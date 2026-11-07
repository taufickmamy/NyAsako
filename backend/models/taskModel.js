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
const updateTaskStatus = async (taskId, status, projectId) => {
  const query = `
    UPDATE tasks
    SET status = $1
    WHERE id = $2 AND project_id = $3
    RETURNING *;
  `;
  const { rows } = await db.query(query, [status, taskId, projectId]);
  return rows[0];
};

// Mettre à jour les champs fournis d'une tâche (permet d'effacer due_date)
const updateTask = async (taskId, updates, projectId) => {
  const mapping = {
    title: 'title',
    description: 'description',
    status: 'status',
    priority: 'priority',
    assignedTo: 'assigned_to',
    dueDate: 'due_date',
  };

  const values = [];
  const assignments = [];

  Object.entries(mapping).forEach(([key, column]) => {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      values.push(updates[key]);
      assignments.push(`${column} = $${values.length}`);
    }
  });

  if (assignments.length === 0) {
    const { rows } = await db.query(
      'SELECT * FROM tasks WHERE id = $1 AND project_id = $2;',
      [taskId, projectId]
    );
    return rows[0];
  }

  values.push(taskId, projectId);
  const query = `
    UPDATE tasks
    SET ${assignments.join(', ')}
    WHERE id = $${values.length - 1} AND project_id = $${values.length}
    RETURNING *;
  `;
  const { rows } = await db.query(query, values);
  return rows[0];
};

// Supprimer une tâche
const deleteTask = async (taskId, projectId) => {
  const query = 'DELETE FROM tasks WHERE id = $1 AND project_id = $2 RETURNING *;';
  const { rows } = await db.query(query, [taskId, projectId]);
  return rows[0];
};

// Récupérer toutes les tâches (vue globale, tous projets confondus)
const findAllTasks = async () => {
  const query = `
    SELECT t.*,
           u.name AS assigned_to_name,
           u.email AS assigned_to_email,
           p.title AS project_title
    FROM tasks t
    LEFT JOIN users u ON t.assigned_to = u.id
    LEFT JOIN projects p ON t.project_id = p.id
    ORDER BY t.created_at DESC;
  `;
  const { rows } = await db.query(query);
  return rows;
};

// Récupérer une tâche par son identifiant (vue globale)
const findTaskById = async (taskId) => {
  const query = `
    SELECT t.*,
           u.name AS assigned_to_name,
           u.email AS assigned_to_email,
           p.title AS project_title
    FROM tasks t
    LEFT JOIN users u ON t.assigned_to = u.id
    LEFT JOIN projects p ON t.project_id = p.id
    WHERE t.id = $1;
  `;
  const { rows } = await db.query(query, [taskId]);
  return rows[0];
};

module.exports = {
  createTask,
  findTasksByProject,
  findAllTasks,
  findTaskById,
  updateTaskStatus,
  updateTask,
  deleteTask,
};