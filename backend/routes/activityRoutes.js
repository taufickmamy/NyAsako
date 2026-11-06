// routes/activityRoutes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const activityController = require('../controllers/activityController');
const authenticateToken = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/', activityController.getProjectActivities);
router.get('/activities', authenticateToken, activityController.getAllActivities);

module.exports = router;