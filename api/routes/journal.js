// ============================================
// Rotas de Diário (Journal)
// ============================================

const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { success, error, serverError, notFoundError } = require('../utils/responses');
const { validateJournal } = require('../middleware/validation');

// ============================================
// GET /api/journal/user/:userId - Listar entradas do usuário
// ============================================
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const entries = await db.query(
      `SELECT * FROM diario 
       WHERE user_id = ? 
       ORDER BY data DESC, criado_em DESC`,
      [userId]
    );

    return success(res, entries);

  } catch (err) {
    console.error('Erro ao listar entradas do diário:', err);
    return serverError(res, 'Erro ao listar entradas');
  }
});

// ============================================
// GET /api/journal/user/:userId/date/:date - Buscar entradas por data específica
// ============================================
router.get('/user/:userId/date/:date', async (req, res) => {
  try {
    const { userId, date } = req.params;

    // Valida formato da data
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return error(res, 'Formato de data inválido (use YYYY-MM-DD)');
    }

    const entries = await db.query(
      `SELECT * FROM diario 
       WHERE user_id = ? AND data = ?
       ORDER BY criado_em DESC`,
      [userId, date]
    );

    return success(res, entries);

  } catch (err) {
    console.error('Erro ao buscar entradas por data:', err);
    return serverError(res, 'Erro ao buscar entradas');
  }
});

// ============================================
// GET /api/journal/:id - Buscar entrada por ID
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const entries = await db.query(
      'SELECT * FROM diario WHERE id = ?',
      [id]
    );

    if (entries.length === 0) {
      return notFoundError(res, 'Entrada não encontrada');
    }

    return success(res, entries[0]);

  } catch (err) {
    console.error('Erro ao buscar entrada:', err);
    return serverError(res, 'Erro ao buscar entrada');
  }
});

// ============================================
// POST /api/journal - Criar entrada de diário
// PERMITE MÚLTIPLAS ENTRADAS NO MESMO DIA
// ============================================
router.post('/', validateJournal, async (req, res) => {
  try {
    const { conteudo, data, user_id } = req.body;

    if (!user_id) {
      return error(res, 'user_id é obrigatório');
    }

    // Insere a entrada (permite múltiplas no mesmo dia)
    const result = await db.query(
      'INSERT INTO diario (conteudo, data, user_id) VALUES (?, ?, ?)',
      [conteudo, data, user_id]
    );

    const entryId = result.insertId;

    const newEntry = await db.query(
      'SELECT * FROM diario WHERE id = ?',
      [entryId]
    );

    return success(res, newEntry[0], 201);

  } catch (err) {
    console.error('Erro ao criar entrada:', err);
    return serverError(res, 'Erro ao criar entrada');
  }
});

// ============================================
// PUT /api/journal/:id - Atualizar entrada de diário
// ============================================
router.put('/:id', validateJournal, async (req, res) => {
  try {
    const { id } = req.params;
    const { conteudo, data } = req.body;

    // Verifica se entrada existe
    const existing = await db.query(
      'SELECT * FROM diario WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return notFoundError(res, 'Entrada não encontrada');
    }

    await db.query(
      'UPDATE diario SET conteudo = ?, data = ? WHERE id = ?',
      [conteudo, data, id]
    );

    const updated = await db.query(
      'SELECT * FROM diario WHERE id = ?',
      [id]
    );

    return success(res, updated[0]);

  } catch (err) {
    console.error('Erro ao atualizar entrada:', err);
    return serverError(res, 'Erro ao atualizar entrada');
  }
});

// ============================================
// DELETE /api/journal/:id - Deletar entrada de diário
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    // Verifica se entrada existe e pertence ao usuário
    const existing = await db.query(
      'SELECT * FROM diario WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (existing.length === 0) {
      return notFoundError(res, 'Entrada não encontrada ou sem permissão');
    }

    await db.query('DELETE FROM diario WHERE id = ?', [id]);

    return success(res, { message: 'Entrada excluída com sucesso' });

  } catch (err) {
    console.error('Erro ao deletar entrada:', err);
    return serverError(res, 'Erro ao deletar entrada');
  }
});

module.exports = router;