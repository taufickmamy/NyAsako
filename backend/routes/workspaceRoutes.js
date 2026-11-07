// routes/workspaceRoutes.js
const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');
const authenticateToken = require('../middlewares/authMiddleware');

router.use(authenticateToken);

// Workspaces
router.post('/', workspaceController.createWorkspace);
router.get('/', workspaceController.getWorkspaces);
router.get('/:id/projects', workspaceController.getProjects);
router.get('/:id/members', workspaceController.getMembers);
router.post('/:id/members', workspaceController.addMember);
router.put('/:id/members/:userId', workspaceController.updateMember);
router.delete('/:id/members/:userId', workspaceController.removeMember);
router.get('/:id', workspaceController.getWorkspace);
router.put('/:id', workspaceController.updateWorkspace);
router.patch('/:id', workspaceController.updateWorkspace);
router.delete('/:id', workspaceController.deleteWorkspace);

module.exports = router;
