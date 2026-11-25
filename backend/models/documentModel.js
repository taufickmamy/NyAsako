const db = require('../config/db');

const saveDocument = async (filename, filePath, projectId, uploadedBy, workspaceId = null) => {
  const query = `
    INSERT INTO documents (filename, file_path, project_id, uploaded_by, workspace_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const { rows } = await db.query(query, [filename, filePath, projectId, uploadedBy, workspaceId]);
  return rows[0];
};

const findDocumentsByProject = async (projectId, workspaceId = null) => {
  const values = [projectId];
  let workspaceClause = '';
  if (workspaceId) {
    values.push(workspaceId);
    workspaceClause = ` AND (d.workspace_id = $${values.length} OR (d.workspace_id IS NULL AND p.workspace_id = $${values.length}))`;
  }

  const query = `
    SELECT d.*, u.name AS uploader_name
    FROM documents d
    LEFT JOIN users u ON d.uploaded_by = u.id
    LEFT JOIN projects p ON d.project_id = p.id
    WHERE d.project_id = $1${workspaceClause}
    ORDER BY d.created_at DESC;
  `;
  const { rows } = await db.query(query, values);
  return rows;
};

const findAllDocuments = async (workspaceId = null) => {
  const values = [];
  let whereClause = '';
  if (workspaceId) {
    values.push(workspaceId);
    whereClause = `WHERE (d.workspace_id = $1 OR (d.workspace_id IS NULL AND p.workspace_id = $1))`;
  }

  const query = `
    SELECT d.*,
           u.name AS uploader_name,
           p.title AS project_title
    FROM documents d
    LEFT JOIN users u ON d.uploaded_by = u.id
    LEFT JOIN projects p ON d.project_id = p.id
    ${whereClause}
    ORDER BY d.created_at DESC;
  `;
  const { rows } = await db.query(query, values);
  return rows;
};

const findDocumentById = async (id, workspaceId = null) => {
  const values = [id];
  let workspaceClause = '';
  if (workspaceId) {
    values.push(workspaceId);
    workspaceClause = ` AND (d.workspace_id = $2 OR (d.workspace_id IS NULL AND p.workspace_id = $2))`;
  }

  const query = `
    SELECT d.*, p.workspace_id AS project_workspace_id
    FROM documents d
    LEFT JOIN projects p ON d.project_id = p.id
    WHERE d.id = $1${workspaceClause}
    LIMIT 1;
  `;
  const { rows } = await db.query(query, values);
  return rows[0] || null;
};

const deleteDocumentById = async (id) => {
  const query = 'DELETE FROM documents WHERE id = $1 RETURNING *;';
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

module.exports = {
  saveDocument,
  findDocumentsByProject,
  findAllDocuments,
  findDocumentById,
  deleteDocumentById,
};
