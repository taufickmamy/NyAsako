const taskModel = require('../models/taskModel');
const activityService = require('./activityService');
const notificationService = require('./notificationService');

const STATUSES = ['À faire', 'En cours', 'Terminé'];
const PRIORITIES = ['Faible', 'Moyenne', 'Élevée'];

const httpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateStatus = (status) => {
  if (status !== undefined && !STATUSES.includes(status)) {
    throw httpError(`Statut invalide. Valeurs acceptées : ${STATUSES.join(', ')}.`);
  }
};

const validatePriority = (priority) => {
  if (priority !== undefined && !PRIORITIES.includes(priority)) {
    throw httpError(`Priorité invalide. Valeurs acceptées : ${PRIORITIES.join(', ')}.`);
  }
};

const createNewTask = async (taskData, userId, io, workspaceId = null) => {
  const { title, description, status, priority, projectId, assignedTo, dueDate } = taskData;

  if (!title || !String(title).trim()) {
    throw httpError('Le titre de la tâche est requis.');
  }
  validateStatus(status);
  validatePriority(priority);

  const task = await taskModel.createTask(
    String(title).trim(),
    description,
    status,
    priority,
    projectId,
    assignedTo,
    dueDate,
    workspaceId
  );

  await activityService.logActivity(
    projectId,
    userId,
    `a créé la tâche « ${task.title} »`,
    workspaceId
  );

  if (assignedTo) {
    await notificationService.notify({
      recipientIds: [assignedTo], actorId: userId, type: 'task_assigned',
      message: `Vous avez été assigné à la tâche « ${task.title} »`, projectId, taskId: task.id, io,
      workspaceId,
    });
  }

  return task;
};

const getProjectTasks = async (projectId, workspaceId = null) => {
  return await taskModel.findTasksByProject(projectId, workspaceId);
};

const getAllTasks = async (workspaceId = null) => {
  return await taskModel.findAllTasks(workspaceId);
};

const getTaskById = async (taskId, workspaceId = null) => {
  const task = await taskModel.findTaskById(taskId, workspaceId);
  if (!task) {
    throw httpError('Tâche non trouvée.', 404);
  }
  return task;
};

const changeTaskStatus = async (projectId, taskId, status, userId, io, workspaceId = null) => {
  if (!status) {
    throw httpError('Le statut est requis.');
  }
  validateStatus(status);

  const previousTask = await getTaskById(taskId, workspaceId);
  const updatedTask = await taskModel.updateTaskStatus(taskId, status, projectId);
  if (!updatedTask) {
    throw httpError('Tâche non trouvée.', 404);
  }

  await activityService.logActivity(
    projectId,
    userId,
    `a déplacé la tâche « ${updatedTask.title} » vers « ${status} »`,
    workspaceId
  );

  if (previousTask.status !== updatedTask.status && updatedTask.assigned_to) {
    await notificationService.notify({
      recipientIds: [updatedTask.assigned_to], actorId: userId, type: 'task_status',
      message: `Le statut de « ${updatedTask.title} » est passé à « ${updatedTask.status} »`,
      projectId, taskId: updatedTask.id, io, workspaceId,
    });
  }

  return updatedTask;
};

const editTask = async (projectId, taskId, taskData, userId, io, workspaceId = null) => {
  const { title, description, status, priority, assignedTo, dueDate } = taskData;

  if (title !== undefined && !String(title).trim()) {
    throw httpError('Le titre de la tâche est requis.');
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

  const previousTask = await getTaskById(taskId, workspaceId);
  const updatedTask = await taskModel.updateTask(taskId, updates, projectId);
  if (!updatedTask) {
    throw httpError('Tâche non trouvée.', 404);
  }

  await activityService.logActivity(
    projectId,
    userId,
    `a modifié la tâche « ${updatedTask.title} »`,
    workspaceId
  );

  if (assignedTo && String(assignedTo) !== String(previousTask.assigned_to)) {
    await notificationService.notify({
      recipientIds: [assignedTo], actorId: userId, type: 'task_assigned',
      message: `Vous avez été assigné à la tâche « ${updatedTask.title} »`, projectId, taskId: updatedTask.id, io,
      workspaceId,
    });
  }
  if (status && status !== previousTask.status && updatedTask.assigned_to) {
    await notificationService.notify({
      recipientIds: [updatedTask.assigned_to], actorId: userId, type: 'task_status',
      message: `Le statut de « ${updatedTask.title} » est passé à « ${updatedTask.status} »`,
      projectId, taskId: updatedTask.id, io, workspaceId,
    });
  }

  return updatedTask;
};

const removeTask = async (projectId, taskId, userId, workspaceId = null) => {
  const deletedTask = await getTaskById(taskId, workspaceId);
  if (Number(deletedTask.project_id) !== Number(projectId)) {
    throw httpError('Tâche non trouvée.', 404);
  }

  await taskModel.deleteTask(taskId, projectId);

  await activityService.logActivity(
    projectId,
    userId,
    `a supprimé la tâche « ${deletedTask.title} »`,
    workspaceId
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
