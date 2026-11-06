// models/activityModel.js
const db = require('../config/db');

const createActivity = async (projectId, userId, action) => {
  const query = `
    INSERT INTO activities (project_id, user_id, action, created_at)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    RETURNING *;
  `;
  const values = [projectId, userId, action];
  const { rows } = await db.query(query, values);
  return rows[0];
};

const findActivitiesByProject = async (projectId) => {
  const query = `
    SELECT a.*, u.name AS user_name
    FROM activities a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.project_id = $1
    ORDER BY a.created_at DESC;
  `;
  const { rows } = await db.query(query, [projectId]);
  return rows;
};

module.exports = {
  createActivity,
  findActivitiesByProject,
};