const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

const isDevelopment = process.env.NODE_ENV === 'development';

const dbConfig = {
  host: isDevelopment
    ? process.env.LOCAL_DB_HOST
    : process.env.RAILWAY_DB_HOST,

  port: isDevelopment
    ? process.env.LOCAL_DB_PORT
    : process.env.RAILWAY_DB_PORT,

  user: isDevelopment
    ? process.env.LOCAL_DB_USER
    : process.env.RAILWAY_DB_USER,

  password: isDevelopment
    ? process.env.LOCAL_DB_PASSWORD
    : process.env.RAILWAY_DB_PASSWORD,

  database: isDevelopment
    ? process.env.LOCAL_DB_NAME
    : process.env.RAILWAY_DB_NAME,
};

const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const connectDB = async () => {
  const connection = await pool.getConnection();

  logger.info(
    `MySQL connected: ${dbConfig.host}/${dbConfig.database}`
  );

  connection.release();
};

module.exports = { pool, connectDB };