// services/workspaceService.js
const workspaceModel = require('../models/workspaceModel');
const userModel = require('../models/userModel');

const ALLOWED_MEMBER_ROLES = ['admin', 'manager', 'member'];
const ALLOWED_ALL_ROLES = ['owner', 'admin', 'manager', 'member'];

const httpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const isUniqueViolation = (error) => error && error.code === '23505';

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const generateSlug = (text) => {
  const base = slugify(text) || 'workspace';
  return `${base}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
};

const createWorkspace = async (name, slug, ownerId, description = null) => {
  if (!name || !String(name).trim()) {
    throw httpError('Le nom du workspace est obligatoire.', 400);
  }

  const finalSlug = slug && String(slug).trim() ? slugify(slug) : '';
  const workspaceSlug = finalSlug || generateSlug(name);

  try {
    return await workspaceModel.createWorkspaceWithOwner(
      String(name).trim(),
      workspaceSlug,
      ownerId,
      description
    );
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw httpError('Un workspace avec ce slug existe déjà.', 409);
    }
    throw error;
  }
};

const getUserWorkspaces = async (userId) => {
  return await workspaceModel.findWorkspacesByUserId(userId);
};

const getWorkspaceById = async (workspaceId, userId) => {
  const workspace = await workspaceModel.findWorkspaceById(workspaceId, userId);
  if (!workspace) {
    throw httpError('Workspace introuvable ou accès refusé.', 404);
  }
  return workspace;
};

const resolveActiveWorkspace = async (userId, requestedId = null) => {
  const workspaces = await workspaceModel.findWorkspacesByUserId(userId);
  const requested = requestedId ? Number(requestedId) : null;

  if (requested) {
    const found = workspaces.find((workspace) => Number(workspace.id) === requested);
    if (!found) {
      throw httpError("Accès refusé : vous n'êtes pas membre de ce workspace.", 403);
    }
    return found;
  }

  if (workspaces.length > 0) return workspaces[0];

  const creator = await userModel.findUserById(userId);
  return await createWorkspace(
    `Espace de ${creator?.name || 'NyAsako'}`,
    null,
    userId,
    'Espace de travail par défaut.'
  );
};

/**
 * Retourne le workspace possédé par l'utilisateur, ou le crée s'il n'en a pas.
 * Utilisé notamment lors de la création d'un projet sans workspace explicite.
 */
const getOrCreateDefaultWorkspace = async (userId, userName) => {
  const workspaces = await workspaceModel.findWorkspacesByUserId(userId);
  const owned = workspaces.find((workspace) => workspace.my_role === 'owner');
  if (owned) return owned;

  return await createWorkspace(
    `Espace de ${userName || 'NyAsako'}`,
    null,
    userId,
    'Espace de travail par défaut.'
  );
};

const updateWorkspace = async (workspaceId, payload = {}) => {
  const cleanPayload = {};

  if (payload.name !== undefined) {
    const name = String(payload.name).trim();
    if (!name) {
      throw httpError('Le nom du workspace ne peut pas être vide.', 400);
    }
    cleanPayload.name = name;
  }

  if (payload.slug !== undefined && String(payload.slug).trim()) {
    cleanPayload.slug = slugify(payload.slug) || generateSlug(payload.name || 'workspace');
  }

  if (payload.description !== undefined) {
    const description =
      payload.description === null || String(payload.description).trim() === ''
        ? null
        : String(payload.description).trim();
    cleanPayload.description = description;
  }

  try {
    const updated = await workspaceModel.updateWorkspaceById(workspaceId, cleanPayload);
    if (!updated) {
      throw httpError('Workspace introuvable.', 404);
    }
    return updated;
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw httpError('Un workspace avec ce slug existe déjà.', 409);
    }
    throw error;
  }
};

const deleteWorkspace = async (workspaceId) => {
  const deleted = await workspaceModel.deleteWorkspaceById(workspaceId);
  if (!deleted) {
    throw httpError('Workspace introuvable.', 404);
  }
  return deleted;
};

const getWorkspaceProjects = async (workspaceId) => {
  return await workspaceModel.findProjectsByWorkspaceId(workspaceId);
};

const getWorkspaceMembers = async (workspaceId) => {
  return await workspaceModel.findMembersByWorkspaceId(workspaceId);
};

const addMember = async (workspaceId, { email, userId, role = 'member' } = {}) => {
  if (!ALLOWED_MEMBER_ROLES.includes(role)) {
    throw httpError('Rôle invalide (autorisés : admin, manager, member).', 400);
  }

  let targetUser = null;
  if (email && String(email).trim()) {
    targetUser = await workspaceModel.findUserByEmail(String(email).trim());
  } else if (userId) {
    targetUser = { id: Number(userId) };
  }

  if (!targetUser || !targetUser.id) {
    throw httpError('Utilisateur introuvable (fournir un email valide ou userId).', 404);
  }

  const existing = await workspaceModel.findMember(workspaceId, targetUser.id);
  if (existing && existing.role === 'owner') {
    throw httpError('Le rôle du propriétaire ne peut pas être modifié ici.', 403);
  }

  await workspaceModel.upsertMember(workspaceId, targetUser.id, role);
  return await workspaceModel.findMemberDetails(workspaceId, targetUser.id);
};

const updateMemberRole = async (workspaceId, targetUserId, newRole, actorRole) => {
  if (!ALLOWED_ALL_ROLES.includes(newRole)) {
    throw httpError('Rôle invalide.', 400);
  }

  if (newRole === 'owner' && actorRole !== 'owner') {
    throw httpError('Seul le propriétaire peut transférer la propriété du workspace.', 403);
  }

  const member = await workspaceModel.findMember(workspaceId, targetUserId);
  if (!member) {
    throw httpError('Membre introuvable dans ce workspace.', 404);
  }

  if (member.role === 'owner' && newRole !== 'owner') {
    const ownersCount = await workspaceModel.countOwners(workspaceId);
    if (ownersCount <= 1) {
      throw httpError('Impossible de rétrograder le dernier propriétaire du workspace.', 400);
    }
  }

  await workspaceModel.updateMemberRole(workspaceId, targetUserId, newRole);
  return await workspaceModel.findMemberDetails(workspaceId, targetUserId);
};

const removeMember = async (workspaceId, targetUserId) => {
  const member = await workspaceModel.findMember(workspaceId, targetUserId);
  if (!member) {
    throw httpError('Membre introuvable dans ce workspace.', 404);
  }

  if (member.role === 'owner') {
    const ownersCount = await workspaceModel.countOwners(workspaceId);
    if (ownersCount <= 1) {
      throw httpError('Impossible de retirer le dernier propriétaire du workspace.', 400);
    }
  }

  return await workspaceModel.removeMember(workspaceId, targetUserId);
};

const leaveWorkspace = async (workspaceId, userId) => {
  const member = await workspaceModel.findMember(workspaceId, userId);
  if (!member) {
    throw httpError("Vous n'êtes pas membre de ce workspace.", 404);
  }

  if (member.role === 'owner') {
    const totalMembers = await workspaceModel.countMembers(workspaceId);
    const ownersCount = await workspaceModel.countOwners(workspaceId);

    if (totalMembers > 1 && ownersCount <= 1) {
      throw httpError(
        "Le propriétaire ne peut pas quitter le workspace tant qu'il reste d'autres membres sans transférer la propriété.",
        400
      );
    }
  }

  await workspaceModel.removeMember(workspaceId, userId);
  return { workspaceId, userId };
};

const countMembers = (workspaceId) => workspaceModel.countMembers(workspaceId);

module.exports = {
  createWorkspace,
  getUserWorkspaces,
  getWorkspaceById,
  resolveActiveWorkspace,
  getOrCreateDefaultWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceProjects,
  getWorkspaceMembers,
  addMember,
  updateMemberRole,
  removeMember,
  leaveWorkspace,
  countMembers,
};
