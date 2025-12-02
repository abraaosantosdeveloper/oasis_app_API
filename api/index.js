// ============================================
// OASIS API - Entry Point (CORS CORRIGIDO)
// Compatível com Vercel Serverless Functions
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./utils/db');

// ============================================
// Importar Rotas
// ============================================
const authRoutes = require('./routes/auth');
const habitsRoutes = require('./routes/habits');
const categoriesRoutes = require('./routes/categories');
const journalRoutes = require('./routes/journal');
const keepAliveRoutes = require('./routes/keep-alive');
const insightsRoutes = require('./routes/insights');

// ============================================
// Configurar Express
// ============================================
const app = express();

// ============================================
// CORS - Configuração Simplificada
// ============================================
const allowedOrigins = [
  'https://abraaosantosdeveloper.github.io',  
  'http://localhost:5500',
  'http://localhost:3000',
  'http://127.0.0.1:5500'
];

// Configuração CORS simplificada e eficaz
app.use(cors({
  origin: function(origin, callback) {
    // Permite requisições sem origin (Postman, mobile apps, testes)
    if (!origin) return callback(null, true);
    
    // Permite qualquer domínio .github.io
    if (origin.includes('github.io')) {
      return callback(null, true);
    }
    
    // Permite origens específicas da lista
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Se quiser ser mais restritivo, descomente a linha abaixo:
    // return callback(new Error('Not allowed by CORS'));
    
    // Por enquanto, permite todas as origens
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Middleware para parsing de JSON e URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Headers adicionais de segurança e compatibilidade
app.use((req, res, next) => {
  // Remove headers conflitantes que o Vercel pode adicionar
  res.removeHeader('X-Powered-By');
  
  // Adiciona headers de segurança
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
});

// Log de requisições (desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'No origin'}`);
    next();
  });
}

// ============================================
// Health Check
// ============================================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'OASIS API is running',
    version: '1.0.2',
    cors: 'enabled',
    endpoints: {
      auth: '/api/login, /api/signup, /api/users/:id',
      habits: '/api/habits',
      categories: '/api/categories',
      journal: '/api/journal'
    }
  });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'OASIS API',
    version: '1.0.2',
    cors: 'enabled'
  });
});

// ============================================
// Registrar Rotas
// ============================================
app.use('/api', authRoutes);
app.use('/api/habits', habitsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/keep-alive', keepAliveRoutes);
app.use('/api/insights', insightsRoutes);

// ============================================
// Tratamento de Erros 404
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint não encontrado'
  });
});

// ============================================
// Tratamento de Erros Globais
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Erro não tratado:', err);
  
  // Erro de CORS
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: 'CORS: Origem não autorizada'
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

// ============================================
// Inicializar Servidor (Local)
// ============================================
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  
  // Testa conexão com banco antes de iniciar
  db.testConnection().then(connected => {
    if (connected) {
      app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
        console.log(`🌐 http://localhost:${PORT}`);
        console.log(`📚 API Docs: http://localhost:${PORT}`);
        console.log(`✅ CORS configurado para:`, allowedOrigins);
      });
    } else {
      console.error('❌ Não foi possível conectar ao banco de dados');
      process.exit(1);
    }
  });
}

// ============================================
// Export para Vercel Serverless
// ============================================
module.exports = app;