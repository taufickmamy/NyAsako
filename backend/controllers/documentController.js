// controllers/documentController.js
const documentService = require('../services/documentService');

const uploadFile = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const uploadedBy = req.user.id;
    const file = req.file;

    const newDoc = await documentService.uploadDocument(file, projectId, uploadedBy);

    return res.status(201).json({ 
      message: 'Fichier téléchargé avec succès.', 
      document: newDoc 
    });
  } catch (error) {
    next(error);
  }
};

const getProjectDocuments = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const documents = await documentService.getDocuments(projectId);
    return res.status(200).json({ documents });
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    await documentService.removeDocument(id);
    return res.status(200).json({ message: 'Document supprimé avec succès.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadFile,
  getProjectDocuments,
  deleteDocument,
};