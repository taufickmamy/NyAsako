const db = require('../config/db');

const createTask = async (
  title,
  description,
  status,
  priority,
  projectId,
  assignedTo,
  dueDate,
  workspaceId = null
) => {
  const query = `
    INSERT INTO tasks (title, description, status, priority, project_id, assigned_to, due_date, workspace_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;
  const values = [
    title,
    description,
    status || 'À faire',
    priority || 'Moyenne',
    projectId,
    assignedTo,
    dueDate,
    workspaceId,
  ];
  const { rows } = await db.query(query, values);
  return rows[0];
};

const findTasksByProject = async (projectId, workspaceId = null) => {
  const values = [projectId];
  let workspaceClause = '';
  if (workspaceId) {
    values.push(workspaceId);
    workspaceClause = ` AND (t.workspace_id = $${values.length} OR (t.workspace_id IS NULL AND p.workspace_id = $${values.length}))`;
  }

  const query = `
    SELECT t.*, u.name AS assigned_to_name, u.email AS assigned_to_email
    FROM tasks t
    LEFT JOIN users u ON t.assigned_to = u.id
    LEFT JOIN projects p ON t.project_id = p.id
    WHERE t.project_id = $1${workspaceClause}
    ORDER BY t.created_at DESC;
  `;
  const { rows } = await db.query(query, values);
  return rows;
};

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

const deleteTask = async (taskId, projectId) => {
  const query = 'DELETE FROM tasks WHERE id = $1 AND project_id = $2 RETURNING *;';
  const { rows } = await db.query(query, [taskId, projectId]);
  return rows[0];
};

const findAllTasks = async (workspaceId = null) => {
  const values = [];
  let whereClause = '';
  if (workspaceId) {
    values.push(workspaceId);
    whereClause = `WHERE (t.workspace_id = $1 OR (t.workspace_id IS NULL AND p.workspace_id = $1))`;
  }

  const query = `
    SELECT t.*,
           u.name AS assigned_to_name,
           u.email AS assigned_to_email,
           p.title AS project_title
    FROM tasks t
    LEFT JOIN users u ON t.assigned_to = u.id
    LEFT JOIN projects p ON t.project_id = p.id
    ${whereClause}
    ORDER BY t.created_at DESC;
  `;
  const { rows } = await db.query(query, values);
  return rows;
};

const findTaskById = async (taskId, workspaceId = null) => {
  const values = [taskId];
  let workspaceClause = '';
  if (workspaceId) {
    values.push(workspaceId);
    workspaceClause = ` AND (t.workspace_id = $2 OR (t.workspace_id IS NULL AND p.workspace_id = $2))`;
  }

  const query = `
    SELECT t.*,
           u.name AS assigned_to_name,
           u.email AS assigned_to_email,
           p.title AS project_title
    FROM tasks t
    LEFT JOIN users u ON t.assigned_to = u.id
    LEFT JOIN projects p ON t.project_id = p.id
    WHERE t.id = $1${workspaceClause};
  `;
  const { rows } = await db.query(query, values);
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
