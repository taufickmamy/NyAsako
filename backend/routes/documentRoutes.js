// routes/documentRoutes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const documentController = require('../controllers/documentController');
const authenticateToken = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.use(authenticateToken);

router.post('/', upload.single('File'), documentController.uploadFile);
router.get('/', documentController.getProjectDocuments);
router.delete('/:id', documentController.deleteDocument);

module.exports = router;