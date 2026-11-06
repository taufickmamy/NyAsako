// services/activityService.js
const activityModel = require('../models/activityModel');

const logActivity = async (projectId, userId, action) => {
  // Azonao atao eto ny manampy fepetra fanampiny raha ilaina alohan'ny hitahirizana azy
  return await activityModel.createActivity(projectId, userId, action);
};

const getActivitiesByProject = async (projectId) => {
  return await activityModel.findActivitiesByProject(projectId);
};

module.exports = {
  logActivity,
  getActivitiesByProject,
};