// const mysql = require('mysql2/promise');
// const pool = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || 'leonardo1234',
//   database: process.env.DB_NAME || 'resenha',
//   port: process.env.DB_PORT || 3306, // Adicione esta linha
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

const { Pool } = require('pg');
require('dotenv').config(); // Garante que o .env seja carregado

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Necessário para o Render/Railway
  },
  max: 20, // Máximo de conexões simultâneas
  idleTimeoutMillis: 30000, // Tempo ocioso máximo
  connectionTimeoutMillis: 2000, // Timeout de conexão (2 segundos)
});

// Teste de conexão
(async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Banco de dados conectado com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao conectar ao banco:', err.message);
  }
})();

module.exports = pool;
