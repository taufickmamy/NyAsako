// controllers/workspaceController.js
const workspaceService = require('../services/workspaceService');
const { sendSuccess } = require('../utils/response');

const createWorkspace = async (req, res, next) => {
  try {
    const { name, slug, description } = req.body;
    const workspace = await workspaceService.createWorkspace(
      name,
      slug,
      req.user.id,
      description
    );
    return sendSuccess(res, 201, 'Workspace créé avec succès.', { workspace });
  } catch (error) {
    next(error);
  }
};

const getWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await workspaceService.getUserWorkspaces(req.user.id);
    return sendSuccess(res, 200, 'Liste des workspaces récupérée.', { workspaces });
  } catch (error) {
    next(error);
  }
};

const getWorkspace = async (req, res, next) => {
  try {
    const workspace = await workspaceService.getWorkspaceById(
      req.workspace.id,
      req.user.id
    );
    return sendSuccess(res, 200, 'Détails du workspace récupérés.', { workspace });
  } catch (error) {
    next(error);
  }
};

const updateWorkspace = async (req, res, next) => {
  try {
    const workspace = await workspaceService.updateWorkspace(
      req.workspace.id,
      req.body
    );
    return sendSuccess(res, 200, 'Workspace mis à jour avec succès.', { workspace });
  } catch (error) {
    next(error);
  }
};

const deleteWorkspace = async (req, res, next) => {
  try {
    await workspaceService.deleteWorkspace(req.workspace.id);
    return sendSuccess(res, 200, 'Workspace supprimé avec succès.');
  } catch (error) {
    next(error);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const projects = await workspaceService.getWorkspaceProjects(req.workspace.id);
    return sendSuccess(res, 200, 'Projets du workspace récupérés.', { projects });
  } catch (error) {
    next(error);
  }
};

const getMembers = async (req, res, next) => {
  try {
    const members = await workspaceService.getWorkspaceMembers(req.workspace.id);
    return sendSuccess(res, 200, 'Membres du workspace récupérés.', { members });
  } catch (error) {
    next(error);
  }
};

const addMember = async (req, res, next) => {
  try {
    const member = await workspaceService.addMember(req.workspace.id, req.body);
    return sendSuccess(res, 201, 'Membre ajouté au workspace avec succès.', { member });
  } catch (error) {
    next(error);
  }
};

const updateMember = async (req, res, next) => {
  try {
    const targetUserId = Number(req.params.userId);
    const { role } = req.body;
    const member = await workspaceService.updateMemberRole(
      req.workspace.id,
      targetUserId,
      role,
      req.workspaceRole
    );
    return sendSuccess(res, 200, 'Rôle du membre mis à jour.', { member });
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const targetUserId = Number(req.params.userId);
    await workspaceService.removeMember(req.workspace.id, targetUserId);
    return sendSuccess(res, 200, 'Membre retiré du workspace.');
  } catch (error) {
    next(error);
  }
};

const leaveWorkspace = async (req, res, next) => {
  try {
    await workspaceService.leaveWorkspace(req.workspace.id, req.user.id);
    return sendSuccess(res, 200, 'Vous avez quitté le workspace avec succès.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getProjects,
  getMembers,
  addMember,
  updateMember,
  removeMember,
  leaveWorkspace,
};
