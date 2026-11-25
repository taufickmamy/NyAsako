const notificationService = require('../services/notificationService');
const { sendSuccess, sendError } = require('../utils/response');

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.listForUser(req.user.id, req.workspaceId);
    return sendSuccess(res, 200, 'Notifications récupérées avec succès.', notifications);
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markRead(req.params.id, req.user.id, req.workspaceId);
    if (!notification) return sendError(res, 404, 'Notification introuvable.', []);
    return sendSuccess(res, 200, 'Notification marquée comme lue.', notification);
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markAsRead };
