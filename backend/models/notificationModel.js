const db = require('../config/db');

const createNotifications = async ({
  recipientIds,
  actorId,
  type,
  message,
  projectId,
  taskId,
  workspaceId = null,
}) => {
  const uniqueIds = [...new Set((recipientIds || []).filter((id) => id && String(id) !== String(actorId)))];
  if (!uniqueIds.length) return [];

  const values = [];
  const tuples = uniqueIds.map((recipientId) => {
    values.push(
      recipientId,
      actorId || null,
      type,
      message,
      projectId || null,
      taskId || null,
      workspaceId || null
    );
    const start = values.length - 6;
    return `($${start}, $${start + 1}, $${start + 2}, $${start + 3}, $${start + 4}, $${start + 5}, $${start + 6})`;
  });

  const { rows } = await db.query(
    `INSERT INTO notifications (recipient_id, actor_id, type, message, project_id, task_id, workspace_id)
     VALUES ${tuples.join(', ')} RETURNING *;`,
    values
  );
  return rows;
};

const findForUser = async (userId, workspaceId = null) => {
  const values = [userId];
  let workspaceClause = '';
  if (workspaceId) {
    values.push(workspaceId);
    workspaceClause = ` AND (n.workspace_id = $2 OR (n.workspace_id IS NULL AND p.workspace_id = $2))`;
  }

  const { rows } = await db.query(
    `SELECT n.id, n.type, n.message, n.project_id, n.task_id, n.is_read, n.created_at
     FROM notifications n
     LEFT JOIN projects p ON n.project_id = p.id
     WHERE n.recipient_id = $1${workspaceClause}
     ORDER BY n.created_at DESC LIMIT 50;`,
    values
  );
  return rows;
};

const markRead = async (id, userId, workspaceId = null) => {
  const values = [id, userId];
  let workspaceClause = '';
  if (workspaceId) {
    values.push(workspaceId);
    workspaceClause = ` AND (n.workspace_id = $3 OR (n.workspace_id IS NULL AND n.project_id IN (SELECT id FROM projects WHERE workspace_id = $3)))`;
  }

  const { rows } = await db.query(
    `UPDATE notifications n
     SET is_read = TRUE
     WHERE n.id = $1 AND n.recipient_id = $2${workspaceClause}
     RETURNING n.*;`,
    values
  );
  return rows[0];
};

module.exports = { createNotifications, findForUser, markRead };
