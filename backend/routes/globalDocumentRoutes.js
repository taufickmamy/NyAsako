// routes/globalDocumentRoutes.js
const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const authenticateToken = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/', documentController.getAllDocuments);

module.exports = router;
