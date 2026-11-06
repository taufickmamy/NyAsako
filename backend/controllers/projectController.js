const projectService = require('../services/projectService');

const createProject = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const createdBy = req.user.id;

    const project = await projectService.createNewProject(title, description, createdBy);
    return res.status(201).json({ message: 'Projet créé avec succès.', project });
  } catch (error) {
    next(error);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getAllProjects();
    return res.status(200).json({ projects });
  } catch (error) {
    next(error);
  }
};

const getProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await projectService.getProjectById(id);
    return res.status(200).json({ project });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const updatedProject = await projectService.editProject(id, title, description, req.user.id);
    return res.status(200).json({ message: 'Projet mis à jour avec succès.', project: updatedProject });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    await projectService.removeProject(id, req.user.id);
    return res.status(200).json({ message: 'Projet supprimé avec succès.' });
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