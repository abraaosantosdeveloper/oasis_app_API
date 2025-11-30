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
    // Esta tabela deve existir no banco apenas para este propósito
    await db.query('SELECT * FROM not_hibernate LIMIT 1');
    
    return success(res, { 
      message: 'Container ativo', 
      timestamp: new Date().toISOString() 
    });

  } catch (err) {
    console.error('Erro no keep-alive:', err);
    // Mesmo com erro, retorna sucesso para manter o ping funcionando
    return success(res, { 
      message: 'Container ativo (fallback)', 
      timestamp: new Date().toISOString() 
    });
  }
});

module.exports = router;
