// ============================================
// Middleware de Validação de Entrada
// ============================================

/**
 * Valida email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida data no formato YYYY-MM-DD
 */
function isValidDate(dateString) {
  if (!dateString) return true; // Permite null
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = new Date(dateString + 'T00:00:00');
  return !isNaN(date.getTime());
}

/**
 * Valida signup
 */
function validateSignup(req, res, next) {
  const { nome, email, senha } = req.body;

  if (!nome || typeof nome !== 'string' || nome.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Nome é obrigatório'
    });
  }

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      error: 'Email inválido'
    });
  }

  if (!senha || senha.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Senha deve ter no mínimo 6 caracteres'
    });
  }

  // Valida data de nascimento se fornecida
  if (req.body.data_nasc && !isValidDate(req.body.data_nasc)) {
    return res.status(400).json({
      success: false,
      error: 'Data de nascimento inválida (formato: YYYY-MM-DD)'
    });
  }

  next();
}

/**
 * Valida login
 */
function validateLogin(req, res, next) {
  const { email, senha } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      error: 'Email inválido'
    });
  }

  if (!senha) {
    return res.status(400).json({
      success: false,
      error: 'Senha é obrigatória'
    });
  }

  next();
}

/**
 * Valida criação/atualização de hábito
 */
function validateHabit(req, res, next) {
  const { titulo, categoria, repetir, tipo_repeticao } = req.body;

  if (!titulo || typeof titulo !== 'string' || titulo.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Título é obrigatório'
    });
  }

  if (!categoria || isNaN(parseInt(categoria))) {
    return res.status(400).json({
      success: false,
      error: 'Categoria inválida'
    });
  }

  // Se repetir = true, tipo_repeticao é obrigatório
  if (repetir && !['diario', 'semanal', 'mensal'].includes(tipo_repeticao)) {
    return res.status(400).json({
      success: false,
      error: 'Tipo de repetição inválido (diario, semanal ou mensal)'
    });
  }

  next();
}

/**
 * Valida entrada de diário
 */
function validateJournal(req, res, next) {
  const { conteudo, data } = req.body;

  if (!conteudo || typeof conteudo !== 'string' || conteudo.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Conteúdo é obrigatório'
    });
  }

  if (!data || !isValidDate(data)) {
    return res.status(400).json({
      success: false,
      error: 'Data inválida (formato: YYYY-MM-DD)'
    });
  }

  next();
}

/**
 * Valida categoria
 */
function validateCategory(req, res, next) {
  const { nome, emoji } = req.body;

  if (!nome || typeof nome !== 'string' || nome.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Nome da categoria é obrigatório'
    });
  }

  if (!emoji || typeof emoji !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Emoji é obrigatório'
    });
  }

  next();
}

module.exports = {
  validateSignup,
  validateLogin,
  validateHabit,
  validateJournal,
  validateCategory,
  isValidEmail,
  isValidDate
};