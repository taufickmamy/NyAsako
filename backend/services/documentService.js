// services/documentService.js
const documentModel = require('../models/documentModel');
const activityService = require('./activityService');
const notificationService = require('./notificationService');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '..', 'uploads');

const uploadDocument = async (file, projectId, userId, io) => {
  if (!file) {
    throw new Error('Aucun fichier n\'a été envoyé.');
  }

  const filename = file.originalname;
  const filePath = `/uploads/${file.filename}`;

  // 1. Enregistrement du document dans la base de données
  const newDoc = await documentModel.saveDocument(filename, filePath, projectId, userId);

  // 2. enregistrement de l'activité
  await activityService.logActivity(
    projectId,
    userId,
    `a téléversé le document « ${filename} »`
  );

  await notificationService.notifyProjectMembers({
    projectId, actorId: userId, type: 'document_uploaded',
    message: `Nouveau document ajouté au projet : « ${filename} »`,
    io,
  });

  return newDoc;
};

const getDocuments = async (projectId) => {
  return await documentModel.findDocumentsByProject(projectId);
};

const getAllDocuments = async () => {
  return await documentModel.findAllDocuments();
};

const removeDocument = async (id, userId) => {
  const doc = await documentModel.deleteDocumentById(id);
  if (!doc) {
    throw new Error('Document non trouvé.');
  }

  //supprimer le fichier du système de fichiers
  const absolutePath = path.join(uploadDir, path.basename(doc.file_path || ''));
  if (doc.file_path && fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }

  await activityService.logActivity(
    doc.project_id,
    userId,
    `a supprimé le document « ${doc.filename} »`
  );

  return doc;
};

module.exports = {
  uploadDocument,
  getDocuments,
  getAllDocuments,
  removeDocument,
};
