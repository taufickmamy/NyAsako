const activityModel = require('../models/activityModel');
const projectModel = require('../models/projectModel');

const logActivity = async (projectId, userId, action, workspaceId = null) => {
  try {
    let targetWorkspaceId = workspaceId;
    if (!targetWorkspaceId && projectId) {
      const project = await projectModel.findProjectById(projectId);
      targetWorkspaceId = project?.workspace_id || null;
    }
    return await activityModel.createActivity(projectId, userId, action, targetWorkspaceId);
  } catch (error) {
    console.error('Impossible d\'enregistrer l\'activité :', error.message);
    return null;
  }
};

const getActivitiesByProject = async (projectId, workspaceId = null) => {
  return await activityModel.findActivitiesByProject(projectId, workspaceId);
};

const getAllActivities = async (workspaceId = null) => {
  return await activityModel.getAllActivities(workspaceId);
};

module.exports = {
  logActivity,
  getActivitiesByProject,
  getAllActivities,
};
