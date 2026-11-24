const db = require('../config/db');
const notificationModel = require('../models/notificationModel');

const notify = async (payload) => {
  try {
    const notifications = await notificationModel.createNotifications(payload);
    const io = payload.io;
    if (io) {
      notifications.forEach((notification) => {
        io.to(`user_${notification.recipient_id}`).emit('notification_created', notification);
      });
    }
  } catch (error) {
    // A notification is auxiliary; it must not cancel the underlying action.
    console.error('Impossible de créer les notifications :', error.message);
  }
};

const notifyProjectMembers = async ({ projectId, actorId, type, message, taskId, io }) => {
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
    await notify({ recipientIds: rows.map((row) => row.member_id), actorId, type, message, projectId, taskId, io });
  } catch (error) {
    console.error('Impossible de trouver les membres à notifier :', error.message);
  }
};

const listForUser = (userId) => notificationModel.findForUser(userId);
const markRead = (id, userId) => notificationModel.markRead(id, userId);

module.exports = { notify, notifyProjectMembers, listForUser, markRead };
