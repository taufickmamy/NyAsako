// services/taskService.js
const taskModel = require('../models/taskModel');
const activityService = require('./activityService');
const notificationService = require('./notificationService');

const STATUSES = ['À faire', 'En cours', 'Terminé'];
const PRIORITIES = ['Faible', 'Moyenne', 'Élevée'];

const badRequest = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  throw error;
};

const validateStatus = (status) => {
  if (status !== undefined && !STATUSES.includes(status)) {
    badRequest(`Statut invalide. Valeurs acceptées : ${STATUSES.join(', ')}.`);
  }
};

const validatePriority = (priority) => {
  if (priority !== undefined && !PRIORITIES.includes(priority)) {
    badRequest(`Priorité invalide. Valeurs acceptées : ${PRIORITIES.join(', ')}.`);
  }
};

const createNewTask = async (taskData, userId, io) => {
  const { title, description, status, priority, projectId, assignedTo, dueDate } = taskData;

  if (!title || !String(title).trim()) {
    badRequest('Le titre de la tâche est requis.');
  }
  validateStatus(status);
  validatePriority(priority);

  const task = await taskModel.createTask(title, description, status, priority, projectId, assignedTo, dueDate);

  await activityService.logActivity(
    projectId,
    userId,
    `a créé la tâche « ${task.title} »`
  );

  if (assignedTo) {
    await notificationService.notify({
      recipientIds: [assignedTo], actorId: userId, type: 'task_assigned',
      message: `Vous avez été assigné à la tâche « ${task.title} »`, projectId, taskId: task.id, io,
    });
  }

  return task;
};

const getProjectTasks = async (projectId) => {
  return await taskModel.findTasksByProject(projectId);
};

const getAllTasks = async () => {
  return await taskModel.findAllTasks();
};

const getTaskById = async (taskId) => {
  const task = await taskModel.findTaskById(taskId);
  if (!task) {
    const error = new Error('Tâche non trouvée.');
    error.statusCode = 404;
    throw error;
  }
  return task;
};

const changeTaskStatus = async (projectId, taskId, status, userId, io) => {
  if (!status) {
    badRequest('Le statut est requis.');
  }
  validateStatus(status);

  const previousTask = await taskModel.findTaskById(taskId);
  if (!previousTask) {
    const error = new Error('Tâche non trouvée.');
    error.statusCode = 404;
    throw error;
  }
  const updatedTask = await taskModel.updateTaskStatus(taskId, status, projectId);
  if (!updatedTask) {
    const error = new Error('Tâche non trouvée.');
    error.statusCode = 404;
    throw error;
  }

  await activityService.logActivity(
    projectId,
    userId,
    `a déplacé la tâche « ${updatedTask.title} » vers « ${status} »`
  );

  if (previousTask.status !== updatedTask.status && updatedTask.assigned_to) {
    await notificationService.notify({
      recipientIds: [updatedTask.assigned_to], actorId: userId, type: 'task_status',
      message: `Le statut de « ${updatedTask.title} » est passé à « ${updatedTask.status} »`,
      projectId, taskId: updatedTask.id, io,
    });
  }

  return updatedTask;
};

const editTask = async (projectId, taskId, taskData, userId, io) => {
  const { title, description, status, priority, assignedTo, dueDate } = taskData;

  if (title !== undefined && !String(title).trim()) {
    badRequest('Le titre de la tâche est requis.');
  }
  validateStatus(status);
  validatePriority(priority);

  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (status !== undefined) updates.status = status;
  if (priority !== undefined) updates.priority = priority;
  if (assignedTo !== undefined) updates.assignedTo = assignedTo;
  if (dueDate !== undefined) updates.dueDate = dueDate;

  const previousTask = await taskModel.findTaskById(taskId);
  if (!previousTask) {
    const error = new Error('Tâche non trouvée.');
    error.statusCode = 404;
    throw error;
  }
  const updatedTask = await taskModel.updateTask(taskId, updates, projectId);
  if (!updatedTask) {
    const error = new Error('Tâche non trouvée.');
    error.statusCode = 404;
    throw error;
  }

  await activityService.logActivity(
    projectId,
    userId,
    `a modifié la tâche « ${updatedTask.title} »`
  );

  if (assignedTo && String(assignedTo) !== String(previousTask.assigned_to)) {
    await notificationService.notify({
      recipientIds: [assignedTo], actorId: userId, type: 'task_assigned',
      message: `Vous avez été assigné à la tâche « ${updatedTask.title} »`, projectId, taskId: updatedTask.id, io,
    });
  }
  if (status && status !== previousTask.status && updatedTask.assigned_to) {
    await notificationService.notify({
      recipientIds: [updatedTask.assigned_to], actorId: userId, type: 'task_status',
      message: `Le statut de « ${updatedTask.title} » est passé à « ${updatedTask.status} »`,
      projectId, taskId: updatedTask.id, io,
    });
  }

  return updatedTask;
};

const removeTask = async (projectId, taskId, userId) => {
  const deletedTask = await taskModel.deleteTask(taskId, projectId);
  if (!deletedTask) {
    const error = new Error('Tâche non trouvée.');
    error.statusCode = 404;
    throw error;
  }

  await activityService.logActivity(
    projectId,
    userId,
    `a supprimé la tâche « ${deletedTask.title} »`
  );

  return deletedTask;
};

module.exports = {
  createNewTask,
  getProjectTasks,
  getAllTasks,
  getTaskById,
  changeTaskStatus,
  editTask,
  removeTask,
};
