// ============================================
// OASIS API - Entry Point
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

// Middlewares
app.use(cors({
  origin: '*', // Em produção, especifique domínios permitidos
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisições (desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
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
    version: '1.0.0'
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