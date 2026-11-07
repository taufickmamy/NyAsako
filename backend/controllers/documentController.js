// controllers/documentController.js
const documentService = require('../services/documentService');
const { sendSuccess } = require('../utils/response');

const uploadFile = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const uploadedBy = req.user.id;
    const file = req.file;

    const newDoc = await documentService.uploadDocument(file, projectId, uploadedBy);

    return sendSuccess(res, 201, 'Fichier ajouté avec succès.', newDoc);
  } catch (error) {
    next(error);
  }
};

const getProjectDocuments = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const documents = await documentService.getDocuments(projectId);
    return sendSuccess(res, 200, 'Documents récupérés avec succès.', documents);
  } catch (error) {
    next(error);
  }
};

const getAllDocuments = async (req, res, next) => {
  try {
    const documents = await documentService.getAllDocuments();
    return sendSuccess(res, 200, 'Documents récupérés avec succès.', documents);
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    await documentService.removeDocument(id, req.user.id);
    return sendSuccess(res, 200, 'Document supprimé avec succès.', null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadFile,
  getProjectDocuments,
  getAllDocuments,
  deleteDocument,
};
