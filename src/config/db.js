const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const connectDB = async () => {
  const connection = await pool.getConnection();
  logger.info(`MySQL connected: ${process.env.DB_HOST}/${process.env.DB_NAME}`);
  connection.release();
};

module.exports = { pool, connectDB };
