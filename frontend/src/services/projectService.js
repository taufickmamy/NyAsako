import apiClient from "./apiClient";
import { unwrapList, unwrapOne } from "./normalize";

export async function getProjects() {
  const { data } = await apiClient.get("/projects");
  return unwrapList(data, "projects");
}

export async function getProject(id) {
  const { data } = await apiClient.get(`/projects/${id}`);
  return unwrapOne(data, "project");
}

export async function createProject(payload) {
  const { data } = await apiClient.post("/projects", payload);
  return unwrapOne(data, "project");
}

export async function updateProject(id, payload) {
  const { data } = await apiClient.put(`/projects/${id}`, payload);
  return unwrapOne(data, "project");
}

export async function deleteProject(id) {
  await apiClient.delete(`/projects/${id}`);
}
