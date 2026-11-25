const db = require('../config/db');

const createActivity = async (projectId, userId, action, workspaceId = null) => {
  const query = `
    INSERT INTO activities (project_id, user_id, action, workspace_id, created_at)
    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
    RETURNING *;
  `;
  const { rows } = await db.query(query, [projectId, userId, action, workspaceId]);
  return rows[0];
};

const findActivitiesByProject = async (projectId, workspaceId = null) => {
  const values = [projectId];
  let workspaceClause = '';
  if (workspaceId) {
    values.push(workspaceId);
    workspaceClause = ` AND (a.workspace_id = $${values.length} OR (a.workspace_id IS NULL AND p.workspace_id = $${values.length}))`;
  }

  const query = `
    SELECT a.*, u.name AS user_name
    FROM activities a
    LEFT JOIN users u ON a.user_id = u.id
    LEFT JOIN projects p ON a.project_id = p.id
    WHERE a.project_id = $1${workspaceClause}
    ORDER BY a.created_at DESC;
  `;
  const { rows } = await db.query(query, values);
  return rows;
};

const getAllActivities = async (workspaceId = null) => {
  const values = [];
  let whereClause = '';
  if (workspaceId) {
    values.push(workspaceId);
    whereClause = `WHERE (a.workspace_id = $1 OR (a.workspace_id IS NULL AND p.workspace_id = $1))`;
  }

  const query = `
    SELECT a.*, u.name AS user_name, p.title AS project_name
    FROM activities a
    LEFT JOIN users u ON a.user_id = u.id
    LEFT JOIN projects p ON a.project_id = p.id
    ${whereClause}
    ORDER BY a.created_at DESC;
  `;
  const { rows } = await db.query(query, values);
  return rows;
};

module.exports = {
  createActivity,
  findActivitiesByProject,
  getAllActivities,
};
