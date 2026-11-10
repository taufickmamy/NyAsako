// controllers/userController.js
const userService = require('../services/userService');
const { sendSuccess } = require('../utils/response');

const listUsers = async (req, res, next) => {
  try {
    const users = await userService.listUsers();
    return sendSuccess(res, 200, 'Utilisateurs récupérés avec succès.', users);
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body, req.user);
    return sendSuccess(res, 201, 'Utilisateur créé avec succès.', user);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userService.updateUserById(id, req.body, req.user);
    return sendSuccess(res, 200, 'Utilisateur mis à jour avec succès.', user);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await userService.deleteUserById(id, req.user);
    return sendSuccess(res, 200, 'Utilisateur supprimé avec succès.', null);
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await userService.getCurrentUser(req.user.id);
    return sendSuccess(res, 200, 'Utilisateur connecté récupéré avec succès.', user);
  } catch (error) {
    next(error);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const user = await userService.updateCurrentUser(req.user.id, req.body);
    return sendSuccess(res, 200, 'Profil mis à jour avec succès.', user);
  } catch (error) {
    next(error);
  }
};

const uploadProfilePicture = async (req, res, next) => {
  try {
    const userId = req.user.id; 
    const file = req.file;

    const updatedUser = await userService.updateProfilePicture(userId, file);

    return sendSuccess(res, 200, 'Photo de profil mise à jour avec succès.', { user: updatedUser });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  getMe,
  updateMe,
  uploadProfilePicture
};
