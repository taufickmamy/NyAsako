// controllers/taskController.js
const taskService = require('../services/taskService');

const createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, assignedTo, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Le titre de la tâche est requis.' });
    }

    const task = await taskService.createNewTask({
      title,
      description,
      status,
      priority,
      projectId,
      assignedTo,
      dueDate,
    });

    // Notification en temps réel via Socket.io
    const io = req.app.get('socketio');
    if (io) {
      io.to(`project_${projectId}`).emit('task_created', task);
    }

    return res.status(201).json({ message: 'Tâche créée avec succès.', task });
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const tasks = await taskService.getProjectTasks(projectId);
    return res.status(200).json({ tasks });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id, projectId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Le statut est requis.' });
    }

    const updatedTask = await taskService.changeTaskStatus(projectId, id, status);

    // Notification en temps réel du changement de statut (Kanban drag & drop)
    const io = req.app.get('socketio');
    if (io) {
      io.to(`project_${projectId}`).emit('task_status_updated', updatedTask);
    }

    return res.status(200).json({ message: 'Statut de la tâche mis à jour.', task: updatedTask });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id, projectId } = req.params;
    const updatedTask = await taskService.editTask(projectId, id, req.body);
    return res.status(200).json({ message: 'Tâche mise à jour avec succès.', task: updatedTask });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id, projectId } = req.params;
    await taskService.removeTask(projectId, id);
    return res.status(200).json({ message: 'Tâche supprimée avec succès.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  updateStatus,
  updateTask,
  deleteTask,
};