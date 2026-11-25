// services/userService.js
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const { findOrCreateDefaultWorkspace } = require('../config/ensureSchema');

const SALT_ROUNDS = 10;
const ROLES = ['Administrateur', 'Manager', 'Développeur'];

const httpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateRole = (role) => {
  if (role !== undefined && !ROLES.includes(role)) {
    throw httpError(`Rôle invalide. Valeurs acceptées : ${ROLES.join(', ')}.`, 400);
  }
};

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const listUsers = async () => {
  return await userModel.findAllUsers();
};

const getCurrentUser = async (id) => {
  const user = await userModel.findUserById(id);
  if (!user) {
    throw httpError('Utilisateur non trouvé.', 404);
  }
  return user;
};

const createUser = async (payload, actor) => {
  const { name, email, password, role = 'Développeur' } = payload;

  if (!name || !String(name).trim() || !email || !password) {
    throw httpError('Le nom, l\'email et le mot de passe sont requis.', 400);
  }

  validateRole(role);

  if (actor?.role === 'Manager' && role === 'Administrateur') {
    throw httpError('Un Manager ne peut pas créer un Administrateur.', 403);
  }

  const normalizedEmail = normalizeEmail(email);
  const existingUser = await userModel.findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw httpError('Cet email est déjà utilisé.', 400);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userModel.createUser(String(name).trim(), normalizedEmail, hashedPassword, role);
  await findOrCreateDefaultWorkspace(user.id, user.name);
  return user;
};

const updateUserById = async (id, payload, actor) => {
  const target = await getCurrentUser(id);
  const { name, email, password, role } = payload;

  validateRole(role);

  if (actor?.role === 'Manager' && target.role === 'Administrateur') {
    throw httpError('Un Manager ne peut pas modifier un Administrateur.', 403);
  }

  if (actor?.role === 'Manager' && role === 'Administrateur') {
    throw httpError('Un Manager ne peut pas promouvoir un utilisateur Administrateur.', 403);
  }

  if (String(actor?.id) === String(id) && role !== undefined && role !== target.role) {
    throw httpError('Vous ne pouvez pas modifier votre propre rôle.', 400);
  }

  const updates = {};

  if (name !== undefined) {
    if (!String(name).trim()) {
      throw httpError('Le nom ne peut pas être vide.', 400);
    }
    updates.name = String(name).trim();
  }

  if (email !== undefined) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      throw httpError('L\'email ne peut pas être vide.', 400);
    }

    const existingUser = await userModel.findUserByEmail(normalizedEmail);
    if (existingUser && String(existingUser.id) !== String(id)) {
      throw httpError('Cet email est déjà utilisé.', 400);
    }

    updates.email = normalizedEmail;
  }

  if (password !== undefined) {
    if (!password || String(password).length < 6) {
      throw httpError('Le mot de passe doit contenir au moins 6 caractères.', 400);
    }
    updates.password = await bcrypt.hash(password, SALT_ROUNDS);
  }

  if (role !== undefined) {
    updates.role = role;
  }

  if (Object.keys(updates).length === 0) {
    return target;
  }

  return await userModel.updateUser(id, updates);
};

const updateCurrentUser = async (id, payload) => {
  const current = await getCurrentUser(id);
  return await updateUserById(id, payload, { id: current.id, role: current.role });
};

const deleteUserById = async (id, actor) => {
  const target = await getCurrentUser(id);

  if (String(actor?.id) === String(id)) {
    throw httpError('Vous ne pouvez pas supprimer votre propre compte.', 400);
  }

  if (actor?.role === 'Manager' && target.role === 'Administrateur') {
    throw httpError('Un Manager ne peut pas supprimer un Administrateur.', 403);
  }

  return await userModel.deleteUser(id);
};


const updateProfilePicture = async (userId, file) => {
  if (!file) {
    throw httpError('Aucune photo fournie.', 400);
  }

  const filePath = `/uploads/${file.filename}`;

  return await userModel.updateProfilePicture(userId, filePath);
};
module.exports = {
  ROLES,
  listUsers,
  getCurrentUser,
  createUser,
  updateUserById,
  updateCurrentUser,
  deleteUserById,
  updateProfilePicture,
};
