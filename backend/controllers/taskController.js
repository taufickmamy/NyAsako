// controllers/taskController.js
const taskService = require('../services/taskService');
const { sendSuccess, sendError } = require('../utils/response');

const createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, assignedTo, dueDate } = req.body;

    if (!title) {
      return sendError(res, 400, 'Le titre de la tâche est requis.', []);
    }

    const task = await taskService.createNewTask({
      title,
      description,
      status,
      priority,
      projectId,
      assignedTo,
      dueDate,
    }, req.user.id);

    // Notification en temps réel via Socket.io
    const io = req.app.get('socketio');
    if (io) {
      io.to(`project_${projectId}`).emit('task_created', task);
    }

    return sendSuccess(res, 201, 'Tâche créée avec succès.', task);
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const tasks = await taskService.getProjectTasks(projectId);
    return sendSuccess(res, 200, 'Tâches récupérées avec succès.', tasks);
  } catch (error) {
    next(error);
  }
};

const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getAllTasks();
    return sendSuccess(res, 200, 'Tâches récupérées avec succès.', tasks);
  } catch (error) {
    next(error);
  }
};

const getTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await taskService.getTaskById(id);
    return sendSuccess(res, 200, 'Tâche récupérée avec succès.', task);
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id, projectId } = req.params;
    const { status } = req.body;

    if (!status) {
      return sendError(res, 400, 'Le statut est requis.', []);
    }

    const updatedTask = await taskService.changeTaskStatus(projectId, id, status, req.user.id);

    // Notification en temps réel du changement de statut (Kanban drag & drop)
    const io = req.app.get('socketio');
    if (io) {
      io.to(`project_${projectId}`).emit('task_status_updated', updatedTask);
    }

    return sendSuccess(res, 200, 'Statut de la tâche mis à jour.', updatedTask);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id, projectId } = req.params;
    const updatedTask = await taskService.editTask(projectId, id, req.body, req.user.id);
    return sendSuccess(res, 200, 'Tâche mise à jour avec succès.', updatedTask);
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id, projectId } = req.params;
    await taskService.removeTask(projectId, id, req.user.id);
    return sendSuccess(res, 200, 'Tâche supprimée avec succès.', null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getAllTasks,
  getTask,
  updateStatus,
  updateTask,
  deleteTask,
};
