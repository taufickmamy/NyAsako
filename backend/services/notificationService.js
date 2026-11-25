const db = require('../config/db');
const notificationModel = require('../models/notificationModel');

const resolveWorkspaceId = async (workspaceId, projectId) => {
  if (workspaceId) return workspaceId;
  if (!projectId) return null;

  const { rows } = await db.query(
    'SELECT workspace_id FROM projects WHERE id = $1;',
    [projectId]
  );
  return rows[0]?.workspace_id || null;
};

const notify = async (payload) => {
  try {
    const workspaceId = await resolveWorkspaceId(payload.workspaceId, payload.projectId);
    const notifications = await notificationModel.createNotifications({ ...payload, workspaceId });
    const io = payload.io;
    if (io) {
      notifications.forEach((notification) => {
        io.to(`user_${notification.recipient_id}`).emit('notification_created', notification);
      });
    }
  } catch (error) {
    console.error('Impossible de créer les notifications :', error.message);
  }
};

const notifyProjectMembers = async ({
  projectId, actorId, type, message, taskId, io, workspaceId,
}) => {
  try {
    const { rows } = await db.query(
      `SELECT DISTINCT member_id FROM (
         SELECT p.created_by AS member_id
         FROM projects p WHERE p.id = $1
         UNION
         SELECT pm.user_id AS member_id
         FROM project_members pm WHERE pm.project_id = $1
         UNION
         SELECT wm.user_id AS member_id
         FROM projects p JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
         WHERE p.id = $1
       ) members WHERE member_id IS NOT NULL;`,
      [projectId]
    );
    await notify({
      recipientIds: rows.map((row) => row.member_id), actorId, type, message, projectId, taskId, io,
      workspaceId,
    });
  } catch (error) {
    console.error('Impossible de trouver les membres à notifier :', error.message);
  }
};

const listForUser = (userId, workspaceId = null) => notificationModel.findForUser(userId, workspaceId);
const markRead = (id, userId, workspaceId = null) => notificationModel.markRead(id, userId, workspaceId);

module.exports = { notify, notifyProjectMembers, listForUser, markRead };
