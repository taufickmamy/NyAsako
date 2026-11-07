// services/workspaceService.js
const workspaceModel = require('../models/workspaceModel');
const userModel = require('../models/userModel');
const projectModel = require('../models/projectModel');

const MEMBER_ROLES = ['admin', 'member'];

const httpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeName = (name) => String(name || '').trim();

const getMembershipOrThrow = async (workspaceId, userId) => {
  const workspace = await workspaceModel.findWorkspaceById(workspaceId);
  if (!workspace) {
    throw httpError('Workspace non trouvé.', 404);
  }

  const membership = await workspaceModel.findMembership(workspaceId, userId);
  if (!membership) {
    throw httpError('Accès refusé. Vous ne faites pas partie de ce workspace.', 403);
  }

  return { workspace, membership };
};

const ensureManager = (membership) => {
  if (!['owner', 'admin'].includes(membership.role)) {
    throw httpError('Accès refusé. Droits de gestion du workspace requis.', 403);
  }
};

const ensureOwner = (membership) => {
  if (membership.role !== 'owner') {
    throw httpError('Accès refusé. Seul le propriétaire peut effectuer cette action.', 403);
  }
};

const validateMemberRole = (role) => {
  if (role !== undefined && !MEMBER_ROLES.includes(role)) {
    throw httpError('Rôle de membre invalide. Valeurs acceptées : admin, member.', 400);
  }
};

/**
 * Retourne le workspace par défaut (possédé) de l'utilisateur,
 * ou en crée un si l'utilisateur n'en possède encore aucun.
 */
const getOrCreateDefaultWorkspace = async (userId, userName) => {
  const workspaces = await workspaceModel.findWorkspacesByUser(userId);
  const owned = workspaces.find((workspace) => workspace.member_role === 'owner');
  if (owned) return owned;

  const workspace = await workspaceModel.createWorkspace(
    `Espace de ${userName || 'NyAsako'}`,
    'Espace de travail par défaut.',
    userId
  );

  await workspaceModel.addMember(workspace.id, userId, 'owner');
  return workspaceModel.findWorkspaceById(workspace.id);
};

const createWorkspace = async (name, description, userId) => {
  const trimmedName = normalizeName(name);
  if (!trimmedName) {
    throw httpError('Le nom du workspace est requis.', 400);
  }

  const workspace = await workspaceModel.createWorkspace(
    trimmedName,
    description || null,
    userId
  );

  await workspaceModel.addMember(workspace.id, userId, 'owner');
  return workspaceModel.findWorkspaceById(workspace.id);
};

const listWorkspaces = async (userId) => {
  return await workspaceModel.findWorkspacesByUser(userId);
};

const getWorkspace = async (workspaceId, userId) => {
  const { workspace } = await getMembershipOrThrow(workspaceId, userId);
  return workspace;
};

const updateWorkspace = async (workspaceId, userId, payload) => {
  const { membership } = await getMembershipOrThrow(workspaceId, userId);
  ensureManager(membership);

  const { name, description } = payload;

  if (name !== undefined && !normalizeName(name)) {
    throw httpError('Le nom du workspace ne peut pas être vide.', 400);
  }

  const updated = await workspaceModel.updateWorkspace(
    workspaceId,
    name !== undefined ? normalizeName(name) : null,
    description !== undefined ? description : null
  );

  return workspaceModel.findWorkspaceById(updated.id);
};

const deleteWorkspace = async (workspaceId, userId) => {
  const { membership } = await getMembershipOrThrow(workspaceId, userId);
  ensureOwner(membership);

  return await workspaceModel.deleteWorkspace(workspaceId);
};

const listMembers = async (workspaceId, userId) => {
  await getMembershipOrThrow(workspaceId, userId);
  return await workspaceModel.findMembersByWorkspace(workspaceId);
};

const addMember = async (workspaceId, userId, payload) => {
  const { membership } = await getMembershipOrThrow(workspaceId, userId);
  ensureManager(membership);

  const targetUserId = payload.userId;
  const role = payload.role || 'member';

  if (!targetUserId) {
    throw httpError('L\'identifiant du membre (userId) est requis.', 400);
  }

  validateMemberRole(role);

  const targetUser = await userModel.findUserById(targetUserId);
  if (!targetUser) {
    throw httpError('Utilisateur non trouvé.', 404);
  }

  const existing = await workspaceModel.findMembership(workspaceId, targetUserId);
  if (existing) {
    throw httpError('Cet utilisateur est déjà membre du workspace.', 409);
  }

  await workspaceModel.addMember(workspaceId, targetUserId, role);
  return await workspaceModel.findMember(workspaceId, targetUserId);
};

const updateMemberRole = async (workspaceId, userId, targetUserId, payload) => {
  const { membership } = await getMembershipOrThrow(workspaceId, userId);
  ensureManager(membership);

  const role = payload.role;
  if (!role) {
    throw httpError('Le rôle est requis.', 400);
  }
  validateMemberRole(role);

  const target = await workspaceModel.findMember(workspaceId, targetUserId);
  if (!target) {
    throw httpError('Membre non trouvé dans ce workspace.', 404);
  }

  if (target.workspace_role === 'owner') {
    throw httpError('Le rôle du propriétaire ne peut pas être modifié.', 403);
  }

  if (membership.role === 'admin' && target.workspace_role === 'admin') {
    throw httpError('Un administrateur ne peut pas modifier un autre administrateur.', 403);
  }

  await workspaceModel.updateMemberRole(workspaceId, targetUserId, role);
  return await workspaceModel.findMember(workspaceId, targetUserId);
};

const removeMember = async (workspaceId, userId, targetUserId) => {
  const { membership } = await getMembershipOrThrow(workspaceId, userId);

  const target = await workspaceModel.findMember(workspaceId, targetUserId);
  if (!target) {
    throw httpError('Membre non trouvé dans ce workspace.', 404);
  }

  if (target.workspace_role === 'owner') {
    throw httpError('Le propriétaire ne peut pas être retiré du workspace.', 403);
  }

  const isSelf = String(userId) === String(targetUserId);
  if (!isSelf) {
    ensureManager(membership);
    if (membership.role === 'admin' && target.workspace_role === 'admin') {
      throw httpError('Un administrateur ne peut pas retirer un autre administrateur.', 403);
    }
  }

  return await workspaceModel.removeMember(workspaceId, targetUserId);
};

const listWorkspaceProjects = async (workspaceId, userId) => {
  await getMembershipOrThrow(workspaceId, userId);
  return await projectModel.findProjectsByWorkspace(workspaceId);
};

module.exports = {
  getOrCreateDefaultWorkspace,
  createWorkspace,
  listWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  listMembers,
  addMember,
  updateMemberRole,
  removeMember,
  listWorkspaceProjects,
};
