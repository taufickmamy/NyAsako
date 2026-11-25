// services/authService.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { findOrCreateDefaultWorkspace } = require('../config/ensureSchema');

const SALT_ROUNDS = 10;
// L'inscription publique ne permet pas de créer un Administrateur.
const PUBLIC_ROLES = ['Développeur', 'Manager'];

const register = async (name, email, password, role) => {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await userModel.findUserByEmail(normalizedEmail);
  if (existingUser) {
    const error = new Error('Cet email est déjà utilisé.');
    error.statusCode = 400;
    throw error;
  }

  const safeRole = PUBLIC_ROLES.includes(role) ? role : 'Développeur';
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userModel.createUser(name, normalizedEmail, hashedPassword, safeRole);
  await findOrCreateDefaultWorkspace(user.id, user.name);
  return user;
};

const login = async (email, password) => {
  const user = await userModel.findUserByEmail(email.trim().toLowerCase());
  if (!user) {
    const error = new Error('Identifiants invalides.');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error = new Error('Identifiants invalides.');
    error.statusCode = 401;
    throw error;
  }

  const payload = { id: user.id, role: user.role };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile_picture: user.profile_picture,
    },
    accessToken,
    refreshToken,
  };
};

module.exports = {
  register,
  login,
};