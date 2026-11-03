// services/taskService.js
const taskModel = require('../models/taskModel');

const createNewTask = async (taskData) => {
  const { title, description, status, priority, projectId, assignedTo, dueDate } = taskData;
  return await taskModel.createTask(title, description, status, priority, projectId, assignedTo, dueDate);
};

const getProjectTasks = async (projectId) => {
  return await taskModel.findTasksByProject(projectId);
};

const changeTaskStatus = async (taskId, status) => {
  const updatedTask = await taskModel.updateTaskStatus(taskId, status);
  if (!updatedTask) {
    const error = new Error('Tâche non trouvée.');
    error.statusCode = 404;
    throw error;
  }
  return updatedTask;
};

const editTask = async (taskId, taskData) => {
  const { title, description, status, priority, assignedTo, dueDate } = taskData;
  const updatedTask = await taskModel.updateTask(taskId, title, description, status, priority, assignedTo, dueDate);
  if (!updatedTask) {
    const error = new Error('Tâche non trouvée.');
    error.statusCode = 404;
    throw error;
  }
  return updatedTask;
};

const removeTask = async (taskId) => {
  const deletedTask = await taskModel.deleteTask(taskId);
  if (!deletedTask) {
    const error = new Error('Tâche non trouvée.');
    error.statusCode = 404;
    throw error;
  }
  return deletedTask;
};

module.exports = {
  createNewTask,
  getProjectTasks,
  changeTaskStatus,
  editTask,
  removeTask,
};