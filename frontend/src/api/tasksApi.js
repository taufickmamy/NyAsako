import api from "./axios";

const unwrapList = (data) =>
  Array.isArray(data) ? data : data?.tasks ?? data?.data ?? [];
const unwrapOne = (data) => data?.task ?? data?.data ?? data;

export async function getTasks(projectId) {
  const { data } = await api.get(`/projects/${projectId}/tasks`);
  return unwrapList(data);
}

export async function createTask(projectId, payload) {
  const { data } = await api.post(`/projects/${projectId}/tasks`, payload);
  return unwrapOne(data);
}

export async function updateTaskStatus(projectId, taskId, status) {
  const { data } = await api.patch(`/projects/${projectId}/tasks/${taskId}/status`, { status });
  return unwrapOne(data);
}

export async function updateTask(projectId, taskId, payload) {
  const { data } = await api.put(`/projects/${projectId}/tasks/${taskId}`, payload);
  return unwrapOne(data);
}

export async function deleteTask(projectId, taskId) {
  await api.delete(`/projects/${projectId}/tasks/${taskId}`);
}