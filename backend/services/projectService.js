const projectModel = require('../models/projectModel');
const activityService = require('./activityService');
const workspaceService = require('./workspaceService');

const httpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const createNewProject = async (title, description, createdBy, workspaceId = null) => {
  if (!title || !String(title).trim()) {
    throw httpError('Le titre du projet est requis.', 400);
  }

  const workspace = await workspaceService.resolveActiveWorkspace(createdBy, workspaceId);
  const targetWorkspaceId = workspace.id;

  const project = await projectModel.createProject(
    String(title).trim(),
    description,
    createdBy,
    targetWorkspaceId
  );

  await activityService.logActivity(
    project.id,
    createdBy,
    `a créé le projet « ${project.title} »`,
    targetWorkspaceId
  );

  return projectModel.findProjectById(project.id);
};

const getAllProjects = async (userId, workspaceId = null) => {
  const workspace = await workspaceService.resolveActiveWorkspace(userId, workspaceId);
  return await projectModel.findAllProjects(workspace.id);
};

const getProjectById = async (id, userId, workspaceId = null) => {
  const workspace = await workspaceService.resolveActiveWorkspace(userId, workspaceId);
  const project = await projectModel.findProjectById(id);
  if (!project || Number(project.workspace_id) !== Number(workspace.id)) {
    throw httpError('Projet non trouvé.', 404);
  }
  return project;
};

const editProject = async (id, title, description, userId, workspaceId = null) => {
  await getProjectById(id, userId, workspaceId);

  const updatedProject = await projectModel.updateProject(id, title, description, null);
  if (!updatedProject) {
    throw httpError('Projet non trouvé.', 404);
  }

  await activityService.logActivity(
    id,
    userId,
    `a modifié le projet « ${updatedProject.title} »`
  );

  return projectModel.findProjectById(id);
};

const removeProject = async (id, userId, workspaceId = null) => {
  const project = await getProjectById(id, userId, workspaceId);

  await activityService.logActivity(
    id,
    userId,
    `a supprimé le projet « ${project.title} »`,
    project.workspace_id
  );

  const deletedProject = await projectModel.deleteProject(id);
  if (!deletedProject) {
    throw httpError('Projet non trouvé.', 404);
  }

  return deletedProject;
};

module.exports = {
  createNewProject,
  getAllProjects,
  getProjectById,
  editProject,
  removeProject,
};
