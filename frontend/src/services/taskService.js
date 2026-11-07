import apiClient from "./apiClient";
import { unwrapList, unwrapOne } from "./normalize";
import { getProjects } from "./projectService";

/** Tâches d'un projet donné. */
export async function getProjectTasks(projectId) {
  const { data } = await apiClient.get(`/projects/${projectId}/tasks`);
  return unwrapList(data, "tasks");
}

/**
 * Tâches de tous les projets.
 * Utilise l'endpoint global s'il existe, sinon agrège projet par projet.
 */
export async function getAllTasks() {
  try {
    const { data } = await apiClient.get("/tasks", { silent: true });
    return unwrapList(data, "tasks");
  } catch {
    const projects = await getProjects();
    const results = await Promise.allSettled(
      projects.map((project) => getProjectTasks(project.id))
    );

    return results.flatMap((result, index) => {
      if (result.status !== "fulfilled") return [];
      const project = projects[index];
      return result.value.map((task) => ({
        ...task,
        project_id: task.project_id || project.id,
        project_title: task.project_title || project.title,
      }));
    });
  }
}

/** Détail d'une tâche (endpoint global, sinon recherche agrégée). */
export async function getTask(taskId) {
  try {
    const { data } = await apiClient.get(`/tasks/${taskId}`, { silent: true });
    return unwrapOne(data, "task");
  } catch {
    const tasks = await getAllTasks();
    const task = tasks.find((item) => String(item.id) === String(taskId));
    if (!task) {
      const error = new Error("Tâche introuvable.");
      error.response = { status: 404, data: { message: "Tâche introuvable." } };
      throw error;
    }
    return task;
  }
}

export async function createTask(projectId, payload) {
  const { data } = await apiClient.post(`/projects/${projectId}/tasks`, payload);
  return unwrapOne(data, "task");
}

export async function updateTask(projectId, taskId, payload) {
  const { data } = await apiClient.put(`/projects/${projectId}/tasks/${taskId}`, payload);
  return unwrapOne(data, "task");
}

export async function updateTaskStatus(projectId, taskId, status) {
  const { data } = await apiClient.patch(`/projects/${projectId}/tasks/${taskId}/status`, {
    status,
  });
  return unwrapOne(data, "task");
}

export async function deleteTask(projectId, taskId) {
  await apiClient.delete(`/projects/${projectId}/tasks/${taskId}`);
}

/** Assignation rapide d'une tâche à un membre. */
export async function assignTask(projectId, taskId, userId) {
  return updateTask(projectId, taskId, { assignedTo: userId || null });
}
