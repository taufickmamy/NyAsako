const activityService = require('../services/activityService');
const { sendSuccess } = require('../utils/response');

const getProjectActivities = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const activities = await activityService.getActivitiesByProject(projectId, req.workspaceId);
    return sendSuccess(res, 200, 'Activités récupérées avec succès.', activities);
  } catch (error) {
    next(error);
  }
};

const getAllActivities = async (req, res, next) => {
  try {
    const activities = await activityService.getAllActivities(req.workspaceId);
    return sendSuccess(res, 200, 'Activités récupérées avec succès.', activities);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectActivities,
  getAllActivities,
};
