// models/userModel.js
const db = require('../config/db');

const createUser = async (name, email, hashedPassword, role = 'Développeur') => {
  const query = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, profile_picture, created_at;
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
  const query = 'SELECT id, name, email, role, profile_picture, created_at FROM users WHERE id = $1;';
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

const findAllUsers = async () => {
  const query = `
    SELECT id, name, email, role, profile_picture, created_at
    FROM users
    ORDER BY created_at DESC;
  `;
  const { rows } = await db.query(query);
  return rows;
};

const updateUser = async (id, updates) => {
  const mapping = {
    name: 'name',
    email: 'email',
    password: 'password',
    role: 'role',
  };

  const values = [];
  const assignments = [];

  Object.entries(mapping).forEach(([key, column]) => {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      values.push(updates[key]);
      assignments.push(`${column} = $${values.length}`);
    }
  });

  if (assignments.length === 0) {
    return await findUserById(id);
  }

  values.push(id);
  const query = `
    UPDATE users
    SET ${assignments.join(', ')}
    WHERE id = $${values.length}
    RETURNING id, name, email, role, profile_picture, created_at;
  `;
  const { rows } = await db.query(query, values);
  return rows[0];
};

const deleteUser = async (id) => {
  const query = 'DELETE FROM users WHERE id = $1 RETURNING id, name, email, role;';
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

const updateProfilePicture = async (userId, filePath) => {
  const query = `
    UPDATE users 
    SET profile_picture = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id, name, email, role, profile_picture;
  `;
  const { rows } = await db.query(query, [filePath, userId]);
  return rows[0];
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  findAllUsers,
  updateUser,
  deleteUser,
  updateProfilePicture,
};