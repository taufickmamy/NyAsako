const projectModel = require('../models/projectModel');

const createNewProject = async (title, description, createdBy) => {
  if (!title) {
    const error = new Error('Le titre du projet est requis.');
    error.statusCode = 400;
    throw error;
  }
  return await projectModel.createProject(title, description, createdBy);
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

const editProject = async (id, title, description) => {
  const updatedProject = await projectModel.updateProject(id, title, description);
  if (!updatedProject) {
    const error = new Error('Projet non trouvé.');
    error.statusCode = 404;
    throw error;
  }
  return updatedProject;
};

const removeProject = async (id) => {
  const deletedProject = await projectModel.deleteProject(id);
  if (!deletedProject) {
    const error = new Error('Projet non trouvé.');
    error.statusCode = 404;
    throw error;
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