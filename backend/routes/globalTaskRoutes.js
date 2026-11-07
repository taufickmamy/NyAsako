// routes/globalTaskRoutes.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authenticateToken = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTask);

module.exports = router;
