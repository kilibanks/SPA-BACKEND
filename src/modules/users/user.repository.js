const { pool } = require('../../config/db');

const findAll = async () => {
  const [rows] = await pool.query('SELECT id, name, email, created_at FROM users');
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
};

const findByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
};

const create = async ({ name, email, password }) => {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, password]
  );
  return findById(result.insertId);
};

const update = async (id, { name, email }) => {
  await pool.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
  return findById(id);
};

const remove = async (id) => {
  await pool.query('DELETE FROM users WHERE id = ?', [id]);
};

module.exports = { findAll, findById, findByEmail, create, update, remove };
