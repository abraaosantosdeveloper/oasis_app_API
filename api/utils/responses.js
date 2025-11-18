// ============================================
// Respostas Padronizadas da API
// ============================================

/**
 * Resposta de sucesso
 */
function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data
  });
}

/**
 * Resposta de erro
 */
function error(res, message, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    error: message
  });
}

/**
 * Erro de validação
 */
function validationError(res, message) {
  return error(res, message, 400);
}

/**
 * Erro de autenticação
 */
function authError(res, message = 'Não autorizado') {
  return error(res, message, 401);
}

/**
 * Erro de permissão
 */
function forbiddenError(res, message = 'Sem permissão') {
  return error(res, message, 403);
}

/**
 * Erro de não encontrado
 */
function notFoundError(res, message = 'Recurso não encontrado') {
  return error(res, message, 404);
}

/**
 * Erro interno do servidor
 */
function serverError(res, message = 'Erro interno do servidor') {
  console.error('❌ Server Error:', message);
  return error(res, message, 500);
}

module.exports = {
  success,
  error,
  validationError,
  authError,
  forbiddenError,
  notFoundError,
  serverError
};