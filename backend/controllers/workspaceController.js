// controllers/workspaceController.js
const workspaceService = require('../services/workspaceService');
const { sendSuccess } = require('../utils/response');

const createWorkspace = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const workspace = await workspaceService.createWorkspace(name, description, req.user.id);
    return sendSuccess(res, 201, 'Workspace créé avec succès.', workspace);
  } catch (error) {
    next(error);
  }
};

const getWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await workspaceService.listWorkspaces(req.user.id);
    return sendSuccess(res, 200, 'Workspaces récupérés avec succès.', workspaces);
  } catch (error) {
    next(error);
  }
};

const getWorkspace = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspace = await workspaceService.getWorkspace(id, req.user.id);
    return sendSuccess(res, 200, 'Workspace récupéré avec succès.', workspace);
  } catch (error) {
    next(error);
  }
};

const updateWorkspace = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workspace = await workspaceService.updateWorkspace(id, req.user.id, req.body);
    return sendSuccess(res, 200, 'Workspace mis à jour avec succès.', workspace);
  } catch (error) {
    next(error);
  }
};

const deleteWorkspace = async (req, res, next) => {
  try {
    const { id } = req.params;
    await workspaceService.deleteWorkspace(id, req.user.id);
    return sendSuccess(res, 200, 'Workspace supprimé avec succès.', null);
  } catch (error) {
    next(error);
  }
};

const getMembers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const members = await workspaceService.listMembers(id, req.user.id);
    return sendSuccess(res, 200, 'Membres du workspace récupérés avec succès.', members);
  } catch (error) {
    next(error);
  }
};

const addMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const member = await workspaceService.addMember(id, req.user.id, req.body);
    return sendSuccess(res, 201, 'Membre ajouté au workspace avec succès.', member);
  } catch (error) {
    next(error);
  }
};

const updateMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const member = await workspaceService.updateMemberRole(id, req.user.id, userId, req.body);
    return sendSuccess(res, 200, 'Rôle du membre mis à jour avec succès.', member);
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    await workspaceService.removeMember(id, req.user.id, userId);
    return sendSuccess(res, 200, 'Membre retiré du workspace avec succès.', null);
  } catch (error) {
    next(error);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const { id } = req.params;
    const projects = await workspaceService.listWorkspaceProjects(id, req.user.id);
    return sendSuccess(res, 200, 'Projets du workspace récupérés avec succès.', projects);
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
  getMembers,
  addMember,
  updateMember,
  removeMember,
  getProjects,
};
