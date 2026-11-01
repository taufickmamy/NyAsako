const db = require('../config/db');

const createProject = async (title, description, createdBy) => {
  const query = `
    INSERT INTO projects (title, description, created_by)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [title, description, createdBy];
  const { rows } = await db.query(query, values);
  return rows[0];
};

const findAllProjects = async () => {
  const query = `
    SELECT p.*, u.name AS creator_name 
    FROM projects p
    LEFT JOIN users u ON p.created_by = u.id
    ORDER BY p.created_at DESC;
  `;
  const { rows } = await db.query(query);
  return rows;
};

const findProjectById = async (id) => {
  const query = `
    SELECT p.*, u.name AS creator_name 
    FROM projects p
    LEFT JOIN users u ON p.created_by = u.id
    WHERE p.id = $1;
  `;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

const updateProject = async (id, title, description) => {
  const query = `
    UPDATE projects
    SET title = COALESCE($1, title),
        description = COALESCE($2, description)
    WHERE id = $3
    RETURNING *;
  `;
  const values = [title, description, id];
  const { rows } = await db.query(query, values);
  return rows[0];
};


const deleteProject = async (id) => {
  const query = 'DELETE FROM projects WHERE id = $1 RETURNING *;';
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

module.exports = {
  createProject,
  findAllProjects,
  findProjectById,
  updateProject,
  deleteProject,
};