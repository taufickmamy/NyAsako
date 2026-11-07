// services/commentService.js
const commentModel = require('../models/commentModel');
const taskModel = require('../models/taskModel');
const activityService = require('./activityService');

const httpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureTask = async (taskId) => {
  const task = await taskModel.findTaskById(taskId);
  if (!task) {
    throw httpError('Tâche non trouvée.', 404);
  }
  return task;
};

const getTaskComments = async (taskId) => {
  await ensureTask(taskId);
  return await commentModel.findCommentsByTask(taskId);
};

const addComment = async (taskId, userId, content) => {
  const task = await ensureTask(taskId);
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

  return comment;
};

const removeComment = async (taskId, commentId, user) => {
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
