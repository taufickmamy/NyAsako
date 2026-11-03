import api from "./axios";

const unwrapList = (data) =>
  Array.isArray(data) ? data : data?.projects ?? data?.data ?? [];
const unwrapOne = (data) => data?.project ?? data?.data ?? data;

export async function getProjects() {
  const { data } = await api.get("/projects");
  return unwrapList(data);
}

export async function getProject(id) {
  const { data } = await api.get(`/projects/${id}`);
  return unwrapOne(data);
}

export async function createProject(payload) {
  // payload = { title, description }
  const { data } = await api.post("/projects", payload);
  return unwrapOne(data);
}

export async function updateProject(id, payload) {
  const { data } = await api.put(`/projects/${id}`, payload);
  return unwrapOne(data);
}

export async function deleteProject(id) {
  await api.delete(`/projects/${id}`);
}