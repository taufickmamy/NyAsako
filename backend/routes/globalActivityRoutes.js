// routes/globalActivityRoutes.js
const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const authenticateToken = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/', activityController.getAllActivities);

module.exports = router;
