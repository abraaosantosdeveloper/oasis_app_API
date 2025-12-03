// ============================================
// Database Connection Pool - MySQL
// ============================================

const mysql = require('mysql2/promise');

let pool;

/**
 * Cria e retorna um pool de conexões MySQL
 * Usa connection pooling para melhor performance
 */
function getPool() {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      console.warn('⚠️  DATABASE_URL não configurada no ambiente');
      throw new Error('DATABASE_URL não configurada no ambiente');
    }

    try {
      // Parse da URL do Railway: mysql://user:pass@host:port/database
      const dbUrl = new URL(databaseUrl);
      
      pool = mysql.createPool({
        host: dbUrl.hostname,
        port: parseInt(dbUrl.port) || 3306,
        user: dbUrl.username,
        password: dbUrl.password,
        database: dbUrl.pathname.substring(1), // Remove a barra inicial
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        charset: 'utf8mb4'
      });

      console.log('✅ Pool de conexões MySQL criado');
    } catch (error) {
      console.error('❌ Erro ao criar pool MySQL:', error.message);
      throw error;
    }
  }

  return pool;
}

/**
 * Executa uma query no banco de dados
 * @param {string} sql - Query SQL
 * @param {Array} params - Parâmetros da query (prepared statement)
 * @returns {Promise<Array>} Resultado da query
 */
async function query(sql, params = []) {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('❌ Erro ao executar query:', error.message);
    throw error;
  }
}

/**
 * Testa a conexão com o banco de dados
 */
async function testConnection() {
  try {
    const pool = getPool();
    const connection = await pool.getConnection();
    console.log('✅ Conexão com MySQL estabelecida');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com MySQL:', error.message);
    return false;
  }
}

module.exports = {
  getPool,
  query,
  testConnection
};