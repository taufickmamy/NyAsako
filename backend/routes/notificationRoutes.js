const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const notificationController = require('../controllers/notificationController');

router.use(authenticateToken);
router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
