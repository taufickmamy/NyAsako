// services/taskService.js
const taskModel = require('../models/taskModel');
const activityService = require('./activityService');

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

const createNewTask = async (taskData, userId) => {
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

  return task;
};

const getProjectTasks = async (projectId) => {
  return await taskModel.findTasksByProject(projectId);
};

const changeTaskStatus = async (projectId, taskId, status, userId) => {
  if (!status) {
    badRequest('Le statut est requis.');
  }
  validateStatus(status);

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

  return updatedTask;
};

const editTask = async (projectId, taskId, taskData, userId) => {
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
  changeTaskStatus,
  editTask,
  removeTask,
};
