// services/authService.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const SALT_ROUNDS = 10;

const register = async (name, email, password, role) => {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await userModel.findUserByEmail(normalizedEmail);
  if (existingUser) {
    const error = new Error('Cet email est déjà utilisé.');
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  return await userModel.createUser(name, normalizedEmail, hashedPassword, role);
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
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
};

module.exports = {
  register,
  login,
};