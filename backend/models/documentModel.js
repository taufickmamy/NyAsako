// models/documentModel.js
const db = require('../config/db');

const saveDocument = async (filename, filePath, projectId, uploadedBy) => {
  const query = `
    INSERT INTO documents (filename, file_path, project_id, uploaded_by)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [filename, filePath, projectId, uploadedBy];
  const { rows } = await db.query(query, values);
  return rows[0];
};

const findDocumentsByProject = async (projectId) => {
  const query = `
    SELECT d.*, u.name AS uploader_name
    FROM documents d
    LEFT JOIN users u ON d.uploaded_by = u.id
    WHERE d.project_id = $1
    ORDER BY d.created_at DESC;
  `;
  const { rows } = await db.query(query, [projectId]);
  return rows;
};

const findAllDocuments = async () => {
  const query = `
    SELECT d.*,
           u.name AS uploader_name,
           p.title AS project_title
    FROM documents d
    LEFT JOIN users u ON d.uploaded_by = u.id
    LEFT JOIN projects p ON d.project_id = p.id
    ORDER BY d.created_at DESC;
  `;
  const { rows } = await db.query(query);
  return rows;
};

const findDocumentById = async (id) => {
  const query = 'SELECT * FROM documents WHERE id = $1;';
  const { rows } = await db.query(query, [id]);
  return rows[0];
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