// services/commentService.js
const commentModel = require('../models/commentModel');
const taskModel = require('../models/taskModel');
const activityService = require('./activityService');
const notificationService = require('./notificationService');

const httpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureTask = async (taskId, workspaceId = null) => {
  const task = await taskModel.findTaskById(taskId, workspaceId);
  if (!task) {
    throw httpError('Tâche non trouvée.', 404);
  }
  return task;
};

const getTaskComments = async (taskId, workspaceId = null) => {
  await ensureTask(taskId, workspaceId);
  return await commentModel.findCommentsByTask(taskId);
};

const addComment = async (taskId, userId, content, io, workspaceId = null) => {
  const task = await ensureTask(taskId, workspaceId);
  const trimmedContent = String(content || '').trim();

  if (!trimmedContent) {
    throw httpError('Le contenu du commentaire est requis.', 400);
  }

  if (trimmedContent.length > 2000) {
    throw httpError('Le commentaire ne peut pas dépasser 2000 caractères.', 400);
  }

  const comment = await commentModel.createComment(taskId, userId, trimmedContent);

  await activityService.logActivity(
    task.project_id,
    userId,
    `a commenté la tâche « ${task.title} »`
  );

  if (task.assigned_to) {
    await notificationService.notify({
      recipientIds: [task.assigned_to], actorId: userId, type: 'task_comment',
      message: `Nouveau commentaire sur la tâche « ${task.title} »`,
      projectId: task.project_id, taskId: task.id, io, workspaceId,
    });
  }

  return comment;
};

const removeComment = async (taskId, commentId, user, workspaceId = null) => {
  await ensureTask(taskId, workspaceId);
  const comment = await commentModel.findCommentById(commentId);

  if (!comment || String(comment.task_id) !== String(taskId)) {
    throw httpError('Commentaire non trouvé.', 404);
  }

  const isOwner = String(comment.user_id) === String(user.id);
  const canModerate = ['Administrateur', 'Manager'].includes(user.role);

  if (!isOwner && !canModerate) {
    throw httpError('Vous ne pouvez pas supprimer ce commentaire.', 403);
  }

  return await commentModel.deleteComment(commentId);
};

module.exports = {
  getTaskComments,
  addComment,
  removeComment,
};
