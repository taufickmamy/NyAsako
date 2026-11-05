// controllers/documentController.js
const documentModel = require('../models/documentModel');
const fs = require('fs');

const uploadFile = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const uploadedBy = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier n\'a été envoyé.' });
    }

    const filename = req.file.originalname;
    const filePath = req.file.path;

    const newDoc = await documentModel.saveDocument(filename, filePath, projectId, uploadedBy);

    return res.status(201).json({ message: 'Fichier téléchargé avec succès.', document: newDoc });
  } catch (error) {
    next(error);
  }
};

const getProjectDocuments = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const documents = await documentModel.findDocumentsByProject(projectId);
    return res.status(200).json({ documents });
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await documentModel.deleteDocumentById(id);

    if (!doc) {
      return res.status(404).json({ message: 'Document non trouvé.' });
    }

    //supprimer le fichier du système de fichiers
    if (fs.existsSync(doc.file_path)) {
      fs.unlinkSync(doc.file_path);
    }

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