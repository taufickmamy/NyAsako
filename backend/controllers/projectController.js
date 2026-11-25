const projectService = require('../services/projectService');
const { sendSuccess } = require('../utils/response');

const createProject = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const createdBy = req.user.id;

    const project = await projectService.createNewProject(
      title,
      description,
      createdBy,
      req.workspaceId || req.body.workspaceId
    );
    return sendSuccess(res, 201, 'Projet créé avec succès.', project);
  } catch (error) {
    next(error);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getAllProjects(req.user.id, req.workspaceId);
    return sendSuccess(res, 200, 'Projets récupérés avec succès.', projects);
  } catch (error) {
    next(error);
  }
};

const getProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await projectService.getProjectById(id, req.user.id, req.workspaceId);
    return sendSuccess(res, 200, 'Projet récupéré avec succès.', project);
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const updatedProject = await projectService.editProject(
      id,
      title,
      description,
      req.user.id,
      req.workspaceId
    );
    return sendSuccess(res, 200, 'Projet mis à jour avec succès.', updatedProject);
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    await projectService.removeProject(id, req.user.id, req.workspaceId);
    return sendSuccess(res, 200, 'Projet supprimé avec succès.', null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
};
