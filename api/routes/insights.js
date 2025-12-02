// ============================================
// INSIGHTS ROUTES
// Estatísticas gerais da aplicação
// ============================================

const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { success, error } = require('../utils/responses');

// ============================================
// GET /api/insights
// Retorna estatísticas gerais (usuários e hábitos)
// ============================================
router.get('/', async (req, res) => {
  try {
    // Consulta quantidade de usuários
    const usersResult = await db.query('SELECT COUNT(*) as total FROM usuarios');
    const totalUsers = parseInt(usersResult.rows[0].total);
    
    // Consulta quantidade de hábitos
    const habitsResult = await db.query('SELECT COUNT(*) as total FROM habitos');
    const totalHabits = parseInt(habitsResult.rows[0].total);
    
    // Retorna os dados
    res.json(success({
      usuarios: totalUsers,
      habitos: totalHabits
    }));
    
  } catch (err) {
    console.error('❌ Erro ao buscar insights:', err);
    res.status(500).json(error('Erro ao buscar estatísticas'));
  }
});

module.exports = router;
