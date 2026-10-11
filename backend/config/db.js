// ============================================
// DATABASE CONNECTION (MySQL)
// ============================================
// This file creates a "connection pool" to MySQL.
// A pool = a small group of connections we reuse for every query.
// Faster and safer than opening a new connection each time.

// Load environment variables from .env into process.env
require('dotenv').config();

// Import the mysql2 library (promise version, so we can use async/await)
const mysql = require('mysql2/promise');

// Create the pool using the values from .env
const pool = mysql.createPool({
  host:     process.env.DB_HOST,       // e.g. "localhost"
  port:     process.env.DB_PORT,       // e.g. 3306
  user:     process.env.DB_USER,       // e.g. "root"
  password: process.env.DB_PASSWORD,   // your MySQL password
  database: process.env.DB_NAME,       // "ecommerce_db"

  // How many connections to keep in the pool
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ============================================
// STARTUP TEST
// ============================================
// When the server boots, we try one quick query.
// If MySQL is up and credentials are right, we see "✅ MySQL connected".
// If not, we see the error, which saves hours of debugging later.
(async () => {
  try {
    // Run a trivial query — "SELECT 1" just proves the connection works
    const conn = await pool.getConnection();
    await conn.query('SELECT 1');
    conn.release(); // return this connection back to the pool
    console.log('✅ MySQL connected successfully to', process.env.DB_NAME);
  } catch (err) {
    console.error('❌ MySQL connection FAILED:', err.message);
  }
})();

// Export the pool so other files (routes, etc.) can use it
module.exports = pool;