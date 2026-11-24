const db = require('../config/db');

const createNotifications = async ({ recipientIds, actorId, type, message, projectId, taskId }) => {
  const uniqueIds = [...new Set((recipientIds || []).filter((id) => id && String(id) !== String(actorId)))];
  if (!uniqueIds.length) return [];

  const values = [];
  const tuples = uniqueIds.map((recipientId) => {
    values.push(recipientId, actorId || null, type, message, projectId || null, taskId || null);
    const start = values.length - 5;
    return `($${start}, $${start + 1}, $${start + 2}, $${start + 3}, $${start + 4}, $${start + 5})`;
  });
  const { rows } = await db.query(
    `INSERT INTO notifications (recipient_id, actor_id, type, message, project_id, task_id)
     VALUES ${tuples.join(', ')} RETURNING *;`,
    values
  );
  return rows;
};

const findForUser = async (userId) => {
  const { rows } = await db.query(
    `SELECT id, type, message, project_id, task_id, is_read, created_at
     FROM notifications WHERE recipient_id = $1
     ORDER BY created_at DESC LIMIT 50;`,
    [userId]
  );
  return rows;
};

const markRead = async (id, userId) => {
  const { rows } = await db.query(
    `UPDATE notifications SET is_read = TRUE
     WHERE id = $1 AND recipient_id = $2 RETURNING *;`,
    [id, userId]
  );
  return rows[0];
};

module.exports = { createNotifications, findForUser, markRead };
