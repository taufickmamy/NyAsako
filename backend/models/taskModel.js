// models/taskModel.js
const db = require('../config/db');

// Créer une nouvelle tâche
const createTask = async (title, description, status, priority, projectId, assignedTo, dueDate) => {
  const query = `
    INSERT INTO tasks (title, description, status, priority, project_id, assigned_to, due_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const values = [title, description, status || 'À faire', priority || 'Moyenne', projectId, assignedTo, dueDate];
  const { rows } = await db.query(query, values);
  return rows[0];
};

// Récupérer toutes les tâches d'un projet
const findTasksByProject = async (projectId) => {
  const query = `
    SELECT t.*, u.name AS assigned_to_name, u.email AS assigned_to_email
    FROM tasks t
    LEFT JOIN users u ON t.assigned_to = u.id
    WHERE t.project_id = $1
    ORDER BY t.created_at DESC;
  `;
  const { rows } = await db.query(query, [projectId]);
  return rows;
};

// Mettre à jour le statut d'une tâche (drag & drop Kanban)
const updateTaskStatus = async (taskId, status) => {
  const query = `
    UPDATE tasks
    SET status = $1
    WHERE id = $2
    RETURNING *;
  `;
  const { rows } = await db.query(query, [status, taskId]);
  return rows[0];
};

// Mettre à jour une tâche complète
const updateTask = async (taskId, title, description, status, priority, assignedTo, dueDate) => {
  const query = `
    UPDATE tasks
    SET title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        priority = COALESCE($4, priority),
        assigned_to = COALESCE($5, assigned_to),
        due_date = COALESCE($6, due_date)
    WHERE id = $7
    RETURNING *;
  `;
  const values = [title, description, status, priority, assignedTo, dueDate, taskId];
  const { rows } = await db.query(query, values);
  return rows[0];
};

// Supprimer une tâche
const deleteTask = async (taskId) => {
  const query = 'DELETE FROM tasks WHERE id = $1 RETURNING *;';
  const { rows } = await db.query(query, [taskId]);
  return rows[0];
};

module.exports = {
  createTask,
  findTasksByProject,
  updateTaskStatus,
  updateTask,
  deleteTask,
};