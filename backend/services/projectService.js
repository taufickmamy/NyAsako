const projectModel = require('../models/projectModel');
const activityService = require('./activityService');

const createNewProject = async (title, description, createdBy) => {
  if (!title) {
    const error = new Error('Le titre du projet est requis.');
    error.statusCode = 400;
    throw error;
  }

  const project = await projectModel.createProject(title, description, createdBy);

  await activityService.logActivity(
    project.id,
    createdBy,
    `a créé le projet « ${project.title} »`
  );

  return project;
};

const getAllProjects = async () => {
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

const editProject = async (id, title, description, userId) => {
  const updatedProject = await projectModel.updateProject(id, title, description);
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

  return updatedProject;
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