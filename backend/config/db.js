// Database connection pool.
// All credentials come from environment variables (see .env.example) —
// nothing is hardcoded here, so this file is safe to commit to Git.

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true
});

// Quick helper used at startup to confirm the app can actually reach RDS.
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('✅ Connected to MySQL (RDS) successfully');
  } catch (err) {
    console.error('❌ Could not connect to MySQL database:', err.message);
  }
}

module.exports = { pool, testConnection };
