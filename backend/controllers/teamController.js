// controllers/teamController.js
const userService = require('../services/userService');
const { sendSuccess } = require('../utils/response');

const getMembers = async (req, res, next) => {
  try {
    const members = await userService.listUsers();
    return sendSuccess(res, 200, 'Membres récupérés avec succès.', members);
  } catch (error) {
    next(error);
  }
};

const addMember = async (req, res, next) => {
  try {
    const member = await userService.createUser(req.body, req.user);
    return sendSuccess(res, 201, 'Membre ajouté avec succès.', member);
  } catch (error) {
    next(error);
  }
};

const updateMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const member = await userService.updateUserById(id, req.body, req.user);
    return sendSuccess(res, 200, 'Membre mis à jour avec succès.', member);
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    await userService.deleteUserById(id, req.user);
    return sendSuccess(res, 200, 'Membre retiré avec succès.', null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMembers,
  addMember,
  updateMember,
  removeMember,
};
