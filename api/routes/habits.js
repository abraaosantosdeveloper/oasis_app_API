// ============================================
// Rotas de Hábitos
// ============================================

const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { success, error, serverError, notFoundError } = require('../utils/responses');
const { validateHabit } = require('../middleware/validation');

// ============================================
// Função auxiliar: Calcular próxima data baseada na data de criação
// ============================================
function calcularProximaData(tipoRepeticao, dataCriacao = null) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  let proxima = new Date(hoje);

  // Se tem data de criação, usa ela como referência
  if (dataCriacao) {
    const criacao = new Date(dataCriacao.split('T')[0] + 'T00:00:00');
    
    switch (tipoRepeticao) {
      case 'diario':
        // Para diários, sempre é o próximo dia
        proxima.setDate(proxima.getDate() + 1);
        break;
        
      case 'semanal':
        // Para semanais, encontra o próximo dia da semana igual ao da criação
        const diaDaSemanaCriacao = criacao.getDay();
        let diasParaAdicionar = (diaDaSemanaCriacao - proxima.getDay() + 7) % 7;
        if (diasParaAdicionar === 0) diasParaAdicionar = 7; // Se é hoje, vai para próxima semana
        proxima.setDate(proxima.getDate() + diasParaAdicionar);
        break;
        
      case 'mensal':
        // Para mensais, próxima ocorrência no mesmo dia do mês
        const diaDoMes = criacao.getDate();
        
        // Tenta criar data no próximo mês
        let anoProximo = hoje.getFullYear();
        let mesProximo = hoje.getMonth() + 1;
        
        // Se o dia já passou este mês, vai para o próximo
        if (hoje.getDate() >= diaDoMes) {
          mesProximo++;
        }
        
        // Ajusta se passou de dezembro
        if (mesProximo > 11) {
          mesProximo = 0;
          anoProximo++;
        }
        
        // Cria a data e valida se o dia existe nesse mês
        proxima = new Date(anoProximo, mesProximo, diaDoMes);
        
        // Se a data é inválida (ex: 31 de fevereiro), usa o último dia do mês
        if (proxima.getDate() !== diaDoMes) {
          proxima = new Date(anoProximo, mesProximo + 1, 0); // Último dia do mês
        }
        break;
    }
  } else {
    // Sem data de criação, usa lógica simples
    switch (tipoRepeticao) {
      case 'diario':
        proxima.setDate(proxima.getDate() + 1);
        break;
      case 'semanal':
        proxima.setDate(proxima.getDate() + 7);
        break;
      case 'mensal':
        proxima.setMonth(proxima.getMonth() + 1);
        break;
    }
  }

  // Retorna no formato YYYY-MM-DD
  return proxima.toISOString().split('T')[0];
}

// ============================================
// GET /api/habits/user/:userId - Listar hábitos do usuário
// ============================================
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const habits = await db.query(
      `SELECT h.*, c.nome as categoria_nome, c.emoji as categoria_emoji
       FROM habitos h
       LEFT JOIN categorias c ON h.categoria = c.id
       WHERE h.user_id = ?
       ORDER BY h.criado_em DESC`,
      [userId]
    );

    return success(res, habits);

  } catch (err) {
    console.error('Erro ao listar hábitos:', err);
    return serverError(res, 'Erro ao listar hábitos');
  }
});

// ============================================
// GET /api/habits/:id - Buscar hábito por ID
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const habits = await db.query(
      `SELECT h.*, c.nome as categoria_nome, c.emoji as categoria_emoji
       FROM habitos h
       LEFT JOIN categorias c ON h.categoria = c.id
       WHERE h.id = ?`,
      [id]
    );

    if (habits.length === 0) {
      return notFoundError(res, 'Hábito não encontrado');
    }

    return success(res, habits[0]);

  } catch (err) {
    console.error('Erro ao buscar hábito:', err);
    return serverError(res, 'Erro ao buscar hábito');
  }
});

// ============================================
// POST /api/habits - Criar hábito
// ============================================
router.post('/', validateHabit, async (req, res) => {
  try {
    const { titulo, descricao, categoria, repetir, tipo_repeticao, user_id } = req.body;

    // Se repetir = true, calcula próxima data
    let proximaData = null;
    if (repetir && tipo_repeticao) {
      proximaData = calcularProximaData(tipo_repeticao);
    }

    const result = await db.query(
      `INSERT INTO habitos 
       (titulo, descricao, categoria, repetir, tipo_repeticao, completado, proxima_data, user_id) 
       VALUES (?, ?, ?, ?, ?, FALSE, ?, ?)`,
      [
        titulo,
        descricao || null,
        categoria,
        repetir ? 1 : 0,
        repetir ? tipo_repeticao : null,
        proximaData,
        user_id
      ]
    );

    const habitId = result.insertId;

    // Busca o hábito criado com dados da categoria
    const newHabit = await db.query(
      `SELECT h.*, c.nome as categoria_nome, c.emoji as categoria_emoji
       FROM habitos h
       LEFT JOIN categorias c ON h.categoria = c.id
       WHERE h.id = ?`,
      [habitId]
    );

    return success(res, newHabit[0], 201);

  } catch (err) {
    console.error('Erro ao criar hábito:', err);
    return serverError(res, 'Erro ao criar hábito');
  }
});

// ============================================
// PUT /api/habits/:id - Atualizar hábito
// ============================================
router.put('/:id', validateHabit, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, categoria, repetir, tipo_repeticao } = req.body;

    // Verifica se hábito existe
    const existing = await db.query('SELECT * FROM habitos WHERE id = ?', [id]);
    
    if (existing.length === 0) {
      return notFoundError(res, 'Hábito não encontrado');
    }

    // Se mudou para repetir=true, calcula próxima data
    let proximaData = existing[0].proxima_data;
    if (repetir && tipo_repeticao && !existing[0].repetir) {
      proximaData = calcularProximaData(tipo_repeticao);
    }
    // Se mudou para repetir=false, remove próxima data
    if (!repetir) {
      proximaData = null;
    }

    await db.query(
      `UPDATE habitos 
       SET titulo = ?, descricao = ?, categoria = ?, repetir = ?, 
           tipo_repeticao = ?, proxima_data = ?
       WHERE id = ?`,
      [
        titulo,
        descricao || null,
        categoria,
        repetir ? 1 : 0,
        repetir ? tipo_repeticao : null,
        proximaData,
        id
      ]
    );

    // Busca hábito atualizado
    const updated = await db.query(
      `SELECT h.*, c.nome as categoria_nome, c.emoji as categoria_emoji
       FROM habitos h
       LEFT JOIN categorias c ON h.categoria = c.id
       WHERE h.id = ?`,
      [id]
    );

    return success(res, updated[0]);

  } catch (err) {
    console.error('Erro ao atualizar hábito:', err);
    return serverError(res, 'Erro ao atualizar hábito');
  }
});

// ============================================
// DELETE /api/habits/:id - Deletar hábito
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica se hábito existe
    const existing = await db.query('SELECT * FROM habitos WHERE id = ?', [id]);
    
    if (existing.length === 0) {
      return notFoundError(res, 'Hábito não encontrado');
    }

    await db.query('DELETE FROM habitos WHERE id = ?', [id]);

    return success(res, { message: 'Hábito excluído com sucesso' });

  } catch (err) {
    console.error('Erro ao deletar hábito:', err);
    return serverError(res, 'Erro ao deletar hábito');
  }
});

// ============================================
// POST /api/habits/:id/toggle - Marcar/desmarcar como concluído
// ============================================
router.post('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;

    // Busca hábito atual
    const habits = await db.query('SELECT * FROM habitos WHERE id = ?', [id]);
    
    if (habits.length === 0) {
      return notFoundError(res, 'Hábito não encontrado');
    }

    const habit = habits[0];
    const novoStatus = !habit.completado;

    let proximaData = habit.proxima_data;

    // Se está marcando como concluído e o hábito repete
    if (novoStatus && habit.repetir && habit.tipo_repeticao) {
      // Calcula próxima data baseada na data de criação
      proximaData = calcularProximaData(habit.tipo_repeticao, habit.criado_em);
    }

    // Se está desmarcando, não altera a próxima data
    // (mantém a data agendada)

    await db.query(
      'UPDATE habitos SET completado = ?, proxima_data = ?, atualizado_em = NOW() WHERE id = ?',
      [novoStatus ? 1 : 0, proximaData, id]
    );

    // Retorna hábito atualizado
    const updated = await db.query(
      `SELECT h.*, c.nome as categoria_nome, c.emoji as categoria_emoji
       FROM habitos h
       LEFT JOIN categorias c ON h.categoria = c.id
       WHERE h.id = ?`,
      [id]
    );

    return success(res, updated[0]);

  } catch (err) {
    console.error('Erro ao alternar status:', err);
    return serverError(res, 'Erro ao alternar status');
  }
});

module.exports = router;