// ============================================
// Middleware de Autenticação JWT
// ============================================

const jwt = require('jsonwebtoken');
const { authError } = require('../utils/responses');

/**
 * Verifica se o token JWT é válido
 */
function verifyToken(req, res, next) {
  // Pega token do header Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return authError(res, 'Token não fornecido');
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return authError(res, 'Formato de token inválido');
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return authError(res, 'Formato de token inválido');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return authError(res, 'Token expirado');
    }
    return authError(res, 'Token inválido');
  }
}

/**
 * Gera um token JWT
 */
function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Token válido por 7 dias
  );
}

module.exports = {
  verifyToken,
  generateToken
};