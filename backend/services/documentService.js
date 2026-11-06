// services/documentService.js
const documentModel = require('../models/documentModel');
const activityService = require('./activityService');
const fs = require('fs');

const uploadDocument = async (file, projectId, userId) => {
  if (!file) {
    throw new Error('Aucun fichier n\'a été envoyé.');
  }

  const filename = file.originalname;
  const filePath = file.path;

  // 1. Enregistrement du document dans la base de données
  const newDoc = await documentModel.saveDocument(filename, filePath, projectId, userId);

  // 2. enregistrement de l'activité
  await activityService.logActivity(
    projectId,
    userId,
    `Nandefa rakitra vaovao: ${filename}`
  );

  return newDoc;
};

const getDocuments = async (projectId) => {
  return await documentModel.findDocumentsByProject(projectId);
};

const removeDocument = async (id) => {
  const doc = await documentModel.deleteDocumentById(id);
  if (!doc) {
    throw new Error('Document non trouvé.');
  }

  //supprimer le fichier du système de fichiers
  if (fs.existsSync(doc.file_path)) {
    fs.unlinkSync(doc.file_path);
  }

  return doc;
};

module.exports = {
  uploadDocument,
  getDocuments,
  removeDocument,
};