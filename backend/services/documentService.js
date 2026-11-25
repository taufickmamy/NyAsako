const documentModel = require('../models/documentModel');
const activityService = require('./activityService');
const notificationService = require('./notificationService');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '..', 'uploads');

const httpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const uploadDocument = async (file, projectId, userId, io, workspaceId = null) => {
  if (!file) {
    throw httpError('Aucun fichier n\'a été envoyé.');
  }

  const filename = file.originalname;
  const filePath = `/uploads/${file.filename}`;

  const newDoc = await documentModel.saveDocument(
    filename, filePath, projectId, userId, workspaceId
  );

  await activityService.logActivity(
    projectId,
    userId,
    `a téléversé le document « ${filename} »`,
    workspaceId
  );

  await notificationService.notifyProjectMembers({
    projectId, actorId: userId, type: 'document_uploaded',
    message: `Nouveau document ajouté au projet : « ${filename} »`,
    io, workspaceId,
  });

  return newDoc;
};

const getDocuments = async (projectId, workspaceId = null) => {
  return await documentModel.findDocumentsByProject(projectId, workspaceId);
};

const getAllDocuments = async (workspaceId = null) => {
  return await documentModel.findAllDocuments(workspaceId);
};

const removeDocument = async (id, userId, workspaceId = null) => {
  const doc = await documentModel.findDocumentById(id, workspaceId);
  if (!doc) {
    throw httpError('Document non trouvé.', 404);
  }

  const docWorkspaceId = doc.workspace_id || doc.project_workspace_id;
  await documentModel.deleteDocumentById(id);

  const absolutePath = path.join(uploadDir, path.basename(doc.file_path || ''));
  if (doc.file_path && fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }

  await activityService.logActivity(
    doc.project_id,
    userId,
    `a supprimé le document « ${doc.filename} »`,
    docWorkspaceId
  );

  return doc;
};

module.exports = {
  uploadDocument,
  getDocuments,
  getAllDocuments,
  removeDocument,
};
