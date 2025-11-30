// ============================================
// Rota de Keep-Alive (Railway Anti-Hibernation)
// ============================================

const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { success, serverError } = require('../utils/responses');

// ============================================
// GET /api/keep-alive - Mantém container ativo
// ============================================
router.get('/', async (req, res) => {
  try {
    // Faz uma query simples na tabela not_hibernate
    const result = await db.query('SELECT * FROM not_hibernate LIMIT 1');
    
    return success(res, result[0] || { message: 'Tabela vazia' });

  } catch (err) {
    console.error('Erro no keep-alive:', err);
    return serverError(res, 'Erro ao consultar tabela');
  }
});

module.exports = router;
