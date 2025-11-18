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

// ============================================
// Configurar Express
// ============================================
const app = express();

// ============================================
// CORS
// ============================================
const allowedOrigins = [
  'https://abraaosantosdeveloper.github.io',  
  'http://localhost:5500',
  'http://localhost:3000',
  'http://127.0.0.1:5500'
];

app.use(cors({
  origin: function(origin, callback) {
    // Permite requisições sem origin (Postman, mobile apps)
    if (!origin) return callback(null, true);
    
    // Permite qualquer subdomínio .github.io (recomendado)
    if (origin.includes('github.io')) {
      return callback(null, true);
    }
    
    // Permite origens específicas
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.log('⚠️ CORS: Origem não permitida:', origin);
    callback(null, true); // Permite mesmo assim (remova se quiser bloquear)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400, // Cache preflight por 24h
  optionsSuccessStatus: 204 // Status correto para OPTIONS
}));

// Middleware adicional para garantir headers
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Se for github.io, permite automaticamente
  if (origin && origin.includes('github.io')) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  } else if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  }
  
  // Responde OPTIONS imediatamente
  if (req.method === 'OPTIONS') {
    return res.status(204).end(); // ✅ Status 204 (não 200)
  }
  
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    message: '🌴 OASIS API is running',
    version: '1.0.0',
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
    message: '🌴 OASIS API',
    version: '1.0.0',
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