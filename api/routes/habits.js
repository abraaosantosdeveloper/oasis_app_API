// ============================================
// Rotas de Hábitos
// ============================================

const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { success, error, serverError, notFoundError } = require('../utils/responses');
const { validateHabit } = require('../middleware/validation');
const { 
  addDays, 
  addWeeks, 
  addMonths, 
  startOfDay, 
  getDay, 
  getDate,
  setDate,
  endOfMonth,
  format,
  parseISO,
  isAfter,
  isSameDay
} = require('date-fns');

// ============================================
// Função auxiliar: Calcular próxima data baseada na data de criação
// ============================================
function calcularProximaData(tipoRepeticao, dataCriacao = null) {
  const hoje = startOfDay(new Date());
  let proxima = hoje;

  // Se tem data de criação, usa ela como referência
  if (dataCriacao) {
    const criacao = startOfDay(parseISO(dataCriacao.split('T')[0]));
    
    switch (tipoRepeticao) {
      case 'diario':
        // Para diários, sempre é o próximo dia
        proxima = addDays(hoje, 1);
        break;
        
      case 'semanal':
        // Para semanais, encontra o próximo dia da semana igual ao da criação
        const diaDaSemanaCriacao = getDay(criacao);
        const diaAtual = getDay(hoje);
        
        let diasParaAdicionar = (diaDaSemanaCriacao - diaAtual + 7) % 7;
        if (diasParaAdicionar === 0) diasParaAdicionar = 7; // Se é hoje, vai para próxima semana
        
        proxima = addDays(hoje, diasParaAdicionar);
        break;
        
      case 'mensal':
        // Para mensais, próxima ocorrência no mesmo dia do mês
        const diaDoMesCriacao = getDate(criacao);
        const diaAtualMes = getDate(hoje);
        
        // Se o dia ainda não passou este mês, usa o mês atual
        // Senão, usa o próximo mês
        let proximoMes = hoje;
        if (diaAtualMes >= diaDoMesCriacao) {
          proximoMes = addMonths(hoje, 1);
        }
        
        // Tenta definir o dia do mês
        try {
          proxima = setDate(proximoMes, diaDoMesCriacao);
        } catch (err) {
          // Se o dia não existe no mês (ex: 31 de fevereiro), usa o último dia
          proxima = endOfMonth(proximoMes);
        }
        
        // Valida se o dia foi definido corretamente
        if (getDate(proxima) !== diaDoMesCriacao) {
          // Se não conseguiu, usa o último dia do mês
          proxima = endOfMonth(proximoMes);
        }
        break;
    }
  } else {
    // Sem data de criação, usa lógica simples
    switch (tipoRepeticao) {
      case 'diario':
        proxima = addDays(hoje, 1);
        break;
      case 'semanal':
        proxima = addWeeks(hoje, 1);
        break;
      case 'mensal':
        proxima = addMonths(hoje, 1);
        break;
    }
  }

  // Retorna no formato YYYY-MM-DD
  return format(proxima, 'yyyy-MM-dd');
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
      try {
        proximaData = calcularProximaData(habit.tipo_repeticao, habit.criado_em);
        console.log(`✅ Próxima data calculada: ${proximaData} para hábito ${id}`);
      } catch (err) {
        console.error('Erro ao calcular próxima data:', err);
        return serverError(res, 'Erro ao calcular próxima data');
      }
    }

    // Se está desmarcando, não altera a próxima data
    // (mantém a data agendada)

    await db.query(
      'UPDATE habitos SET completado = ?, proxima_data = ? WHERE id = ?',
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

    if (updated.length === 0) {
      return notFoundError(res, 'Hábito não encontrado após atualização');
    }

    return success(res, updated[0]);

  } catch (err) {
    console.error('Erro ao alternar status:', err);
    console.error('Stack:', err.stack);
    return serverError(res, 'Erro ao alternar status: ' + err.message);
  }
});

module.exports = router;