// services/activityService.js
const activityModel = require('../models/activityModel');

const logActivity = async (projectId, userId, action) => {
  // L'historique est accessoire : une erreur de journalisation ne doit pas
  // faire échouer l'action métier en cours.
  try {
    return await activityModel.createActivity(projectId, userId, action);
  } catch (error) {
    console.error('Impossible d\'enregistrer l\'activité :', error.message);
    return null;
  }
};

const getActivitiesByProject = async (projectId) => {
  return await activityModel.findActivitiesByProject(projectId);
};

const getAllActivities = async () => {
  return await activityModel.getAllActivities();
};

module.exports = {
  logActivity,
  getActivitiesByProject,
  getAllActivities,
};