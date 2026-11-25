// routes/workspaceRoutes.js
const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');
const authenticateToken = require('../middlewares/authMiddleware');
const { requireWorkspaceMember } = require('../middlewares/workspaceMiddleware');

router.use(authenticateToken);

// Workspaces
router.post('/', workspaceController.createWorkspace);
router.get('/', workspaceController.getWorkspaces);

// Projects ao anatin'ny workspace
router.get('/:id/projects', requireWorkspaceMember(), workspaceController.getProjects);

// Fialana amin'ny workspace (à déclarer avant /:id/members/:userId)
router.post('/:id/leave', requireWorkspaceMember(), workspaceController.leaveWorkspace);
router.delete('/:id/members/me', requireWorkspaceMember(), workspaceController.leaveWorkspace);

// Members ao anatin'ny workspace
router.get('/:id/members', requireWorkspaceMember(), workspaceController.getMembers);
router.post('/:id/members', requireWorkspaceMember(['owner', 'admin', 'manager']), workspaceController.addMember);
router.put('/:id/members/:userId', requireWorkspaceMember(['owner', 'admin']), workspaceController.updateMember);
router.delete('/:id/members/:userId', requireWorkspaceMember(['owner', 'admin']), workspaceController.removeMember);

// Workspace tokana (détails, modification, suppression)
router.get('/:id', requireWorkspaceMember(), workspaceController.getWorkspace);
router.put('/:id', requireWorkspaceMember(['owner', 'admin']), workspaceController.updateWorkspace);
router.patch('/:id', requireWorkspaceMember(['owner', 'admin']), workspaceController.updateWorkspace);
router.delete('/:id', requireWorkspaceMember(['owner']), workspaceController.deleteWorkspace);

module.exports = router;
