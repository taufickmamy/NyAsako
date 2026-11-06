// controllers/activityController.js
const activityService = require('../services/activityService');

const getProjectActivities = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const activities = await activityService.getActivitiesByProject(projectId);
    return res.status(200).json({ activities });
  } catch (error) {
    next(error);
  }
};

const getAllActivities = async (req, res, next) => {
  try {
    const activities = await activityService.getAllActivities();
    return res.status(200).json({ activities });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectActivities,
  getAllActivities,
};