// models/commentModel.js
const db = require('../config/db');

const findCommentById = async (id) => {
  const query = `
    SELECT c.*, u.name AS user_name, u.role AS user_role
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.id = $1;
  `;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

const findCommentsByTask = async (taskId) => {
  const query = `
    SELECT c.*, u.name AS user_name, u.role AS user_role
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.task_id = $1
    ORDER BY c.created_at ASC;
  `;
  const { rows } = await db.query(query, [taskId]);
  return rows;
};

const createComment = async (taskId, userId, content) => {
  const query = `
    INSERT INTO comments (task_id, user_id, content)
    VALUES ($1, $2, $3)
    RETURNING id;
  `;
  const { rows } = await db.query(query, [taskId, userId, content]);
  return await findCommentById(rows[0].id);
};

const deleteComment = async (id) => {
  const query = 'DELETE FROM comments WHERE id = $1 RETURNING *;';
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

module.exports = {
  findCommentById,
  findCommentsByTask,
  createComment,
  deleteComment,
};
