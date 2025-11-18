// ============================================
// Rotas de Categorias
// ============================================

const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { success, error, serverError, notFoundError } = require('../utils/responses');
const { validateCategory } = require('../middleware/validation');

// ============================================
// GET /api/categories - Listar categorias (com filtro opcional por user_id)
// ============================================
router.get('/', async (req, res) => {
  try {
    const { user_id } = req.query;

    let query = 'SELECT * FROM categorias';
    let params = [];

    if (user_id) {
      query += ' WHERE user_id = ?';
      params.push(user_id);
    }

    query += ' ORDER BY nome ASC';

    const categories = await db.query(query, params);

    return success(res, categories);

  } catch (err) {
    console.error('Erro ao listar categorias:', err);
    return serverError(res, 'Erro ao listar categorias');
  }
});

// ============================================
// GET /api/categories/user/:userId - Listar categorias do usuário
// ============================================
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const categories = await db.query(
      'SELECT * FROM categorias WHERE user_id = ? ORDER BY nome ASC',
      [userId]
    );

    return success(res, categories);

  } catch (err) {
    console.error('Erro ao listar categorias do usuário:', err);
    return serverError(res, 'Erro ao listar categorias');
  }
});

// ============================================
// GET /api/categories/:id - Buscar categoria por ID
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const categories = await db.query(
      'SELECT * FROM categorias WHERE id = ?',
      [id]
    );

    if (categories.length === 0) {
      return notFoundError(res, 'Categoria não encontrada');
    }

    return success(res, categories[0]);

  } catch (err) {
    console.error('Erro ao buscar categoria:', err);
    return serverError(res, 'Erro ao buscar categoria');
  }
});

// ============================================
// POST /api/categories - Criar categoria
// ============================================
router.post('/', validateCategory, async (req, res) => {
  try {
    const { nome, emoji, user_id } = req.body;

    if (!user_id) {
      return error(res, 'user_id é obrigatório');
    }

    const result = await db.query(
      'INSERT INTO categorias (nome, emoji, user_id) VALUES (?, ?, ?)',
      [nome, emoji, user_id]
    );

    const categoryId = result.insertId;

    const newCategory = await db.query(
      'SELECT * FROM categorias WHERE id = ?',
      [categoryId]
    );

    return success(res, newCategory[0], 201);

  } catch (err) {
    console.error('Erro ao criar categoria:', err);
    return serverError(res, 'Erro ao criar categoria');
  }
});

// ============================================
// PUT /api/categories/:id - Atualizar categoria
// ============================================
router.put('/:id', validateCategory, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, emoji } = req.body;

    // Verifica se categoria existe
    const existing = await db.query(
      'SELECT * FROM categorias WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return notFoundError(res, 'Categoria não encontrada');
    }

    await db.query(
      'UPDATE categorias SET nome = ?, emoji = ? WHERE id = ?',
      [nome, emoji, id]
    );

    const updated = await db.query(
      'SELECT * FROM categorias WHERE id = ?',
      [id]
    );

    return success(res, updated[0]);

  } catch (err) {
    console.error('Erro ao atualizar categoria:', err);
    return serverError(res, 'Erro ao atualizar categoria');
  }
});

// ============================================
// DELETE /api/categories/:id - Deletar categoria
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    // Verifica se categoria existe e pertence ao usuário
    const existing = await db.query(
      'SELECT * FROM categorias WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (existing.length === 0) {
      return notFoundError(res, 'Categoria não encontrada ou sem permissão');
    }

    // Verifica se existem hábitos usando essa categoria
    const habitsWithCategory = await db.query(
      'SELECT COUNT(*) as count FROM habitos WHERE categoria = ?',
      [id]
    );

    if (habitsWithCategory[0].count > 0) {
      return error(res, 'Não é possível deletar categoria que possui hábitos associados');
    }

    await db.query('DELETE FROM categorias WHERE id = ?', [id]);

    return success(res, { message: 'Categoria excluída com sucesso' });

  } catch (err) {
    console.error('Erro ao deletar categoria:', err);
    return serverError(res, 'Erro ao deletar categoria');
  }
});

module.exports = router;