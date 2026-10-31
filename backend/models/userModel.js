// models/userModel.js
const db = require('../config/db');

const createUser = async (name, email, hashedPassword, role = 'Développeur') => {
  const query = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at;
  `;
  const values = [name, email, hashedPassword, role];
  const { rows } = await db.query(query, values);
  return rows[0];
};

const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE LOWER(email) = LOWER($1);';
  const { rows } = await db.query(query, [email]);
  return rows[0];
};

const findUserById = async (id) => {
  const query = 'SELECT id, name, email, role, created_at FROM users WHERE id = $1;';
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
};