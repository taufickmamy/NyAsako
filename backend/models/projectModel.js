const db = require('../config/db');

const createProject = async (title, description, createdBy, workspaceId = null) => {
  const query = `
    INSERT INTO projects (title, description, created_by, workspace_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [title, description, createdBy, workspaceId];
  const { rows } = await db.query(query, values);
  return rows[0];
};

const findAllProjects = async (workspaceId = null) => {
  const params = [];
  let whereClause = '';

  if (workspaceId) {
    params.push(workspaceId);
    whereClause = `WHERE p.workspace_id = $${params.length}`;
  }

  const query = `
    SELECT p.*, u.name AS creator_name, w.name AS workspace_name
    FROM projects p
    LEFT JOIN users u ON p.created_by = u.id
    LEFT JOIN workspaces w ON p.workspace_id = w.id
    ${whereClause}
    ORDER BY p.created_at DESC;
  `;
  const { rows } = await db.query(query, params);
  return rows;
};

const findProjectsByWorkspace = async (workspaceId) => {
  const query = `
    SELECT p.*, u.name AS creator_name, w.name AS workspace_name
    FROM projects p
    LEFT JOIN users u ON p.created_by = u.id
    LEFT JOIN workspaces w ON p.workspace_id = w.id
    WHERE p.workspace_id = $1
    ORDER BY p.created_at DESC;
  `;
  const { rows } = await db.query(query, [workspaceId]);
  return rows;
};

const findProjectById = async (id) => {
  const query = `
    SELECT p.*, u.name AS creator_name, w.name AS workspace_name
    FROM projects p
    LEFT JOIN users u ON p.created_by = u.id
    LEFT JOIN workspaces w ON p.workspace_id = w.id
    WHERE p.id = $1;
  `;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

const updateProject = async (id, title, description, workspaceId) => {
  const query = `
    UPDATE projects
    SET title = COALESCE($1, title),
        description = COALESCE($2, description),
        workspace_id = COALESCE($3, workspace_id)
    WHERE id = $4
    RETURNING *;
  `;
  const values = [title, description, workspaceId, id];
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
  findProjectsByWorkspace,
  findProjectById,
  updateProject,
  deleteProject,
};
