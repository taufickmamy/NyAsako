// routes/taskRoutes.js
const express = require('express');
const router = express.Router({ mergeParams: true }); // Permet de récupérer projectId depuis l'URL parente
const taskController = require('../controllers/taskController');
const authenticateToken = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.patch('/:id/status', taskController.updateStatus);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;