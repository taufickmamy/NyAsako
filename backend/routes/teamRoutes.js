// routes/teamRoutes.js
const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const authenticateToken = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

// Lecture accessible à tous les membres (nécessaire à l'assignation des tâches)
router.get('/', teamController.getMembers);

// Gestion des membres réservée aux Administrateurs et Managers
router.use(authorizeRoles('Administrateur', 'Manager'));

router.post('/', teamController.addMember);
router.patch('/:id', teamController.updateMember);
router.delete('/:id', teamController.removeMember);

module.exports = router;
