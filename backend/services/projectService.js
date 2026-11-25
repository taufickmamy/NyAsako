const projectModel = require('../models/projectModel');
const userModel = require('../models/userModel');
const activityService = require('./activityService');
const workspaceService = require('./workspaceService');

const createNewProject = async (title, description, createdBy, workspaceId = null) => {
  if (!title) {
    const error = new Error('Le titre du projet est requis.');
    error.statusCode = 400;
    throw error;
  }

  // Si un workspace est fourni, l'utilisateur doit en être membre.
  // Sinon on rattache le projet au workspace par défaut du créateur.
  let targetWorkspaceId = workspaceId;

  if (targetWorkspaceId) {
    await workspaceService.getWorkspaceById(targetWorkspaceId, createdBy);
  } else {
    const creator = await userModel.findUserById(createdBy);
    const workspace = await workspaceService.getOrCreateDefaultWorkspace(
      createdBy,
      creator?.name
    );
    targetWorkspaceId = workspace.id;
  }

  const project = await projectModel.createProject(
    title,
    description,
    createdBy,
    targetWorkspaceId
  );

  await activityService.logActivity(
    project.id,
    createdBy,
    `a créé le projet « ${project.title} »`
  );

  return projectModel.findProjectById(project.id);
};

const getAllProjects = async (userId, workspaceId = null) => {
  if (workspaceId) {
    await workspaceService.getWorkspaceById(workspaceId, userId);
    return await projectModel.findAllProjects(workspaceId);
  }

  return await projectModel.findAllProjects();
};

const getProjectById = async (id) => {
  const project = await projectModel.findProjectById(id);
  if (!project) {
    const error = new Error('Projet non trouvé.');
    error.statusCode = 404;
    throw error;
  }
  return project;
};

const editProject = async (id, title, description, userId, workspaceId = null) => {
  if (workspaceId) {
    await workspaceService.getWorkspaceById(workspaceId, userId);
  }

  const updatedProject = await projectModel.updateProject(id, title, description, workspaceId);
  if (!updatedProject) {
    const error = new Error('Projet non trouvé.');
    error.statusCode = 404;
    throw error;
  }

  await activityService.logActivity(
    id,
    userId,
    `a modifié le projet « ${updatedProject.title} »`
  );

  return projectModel.findProjectById(id);
};

const removeProject = async (id, userId) => {
  const deletedProject = await projectModel.deleteProject(id);
  if (!deletedProject) {
    const error = new Error('Projet non trouvé.');
    error.statusCode = 404;
    throw error;
  }

  await activityService.logActivity(
    id,
    userId,
    `a supprimé le projet « ${deletedProject.title} »`
  );

  return deletedProject;
};

module.exports = {
  createNewProject,
  getAllProjects,
  getProjectById,
  editProject,
  removeProject,
};
