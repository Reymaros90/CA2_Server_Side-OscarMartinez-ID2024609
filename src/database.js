// database.js

require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

// Check DB connection
async function checkDatabase() {
  const [rows] = await pool.query("SELECT 1 AS ok;");
  return rows[0].ok === 1;
}

// Ensure required table exists (schema check)
async function ensureSchema() {
  const sql = `
    CREATE TABLE IF NOT EXISTS mysql_table (
      id INT AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(20) NOT NULL,
      second_name VARCHAR(20) NOT NULL,
      email VARCHAR(254) NOT NULL,
      phone VARCHAR(10) NOT NULL,
      eir_code CHAR(6) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(sql);
}

module.exports = { pool, checkDatabase, ensureSchema };