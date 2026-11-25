import apiClient from "./apiClient";
import { unwrapList, unwrapOne } from "./normalize";

export async function getWorkspaces() {
  const { data } = await apiClient.get("/workspaces");
  return unwrapList(data, "workspaces");
}

export async function getWorkspace(workspaceId) {
  const { data } = await apiClient.get(`/workspaces/${workspaceId}`);
  return unwrapOne(data, "workspace");
}

export async function createWorkspace(payload) {
  const { data } = await apiClient.post("/workspaces", payload);
  return unwrapOne(data, "workspace");
}

export async function updateWorkspace(workspaceId, payload) {
  const { data } = await apiClient.patch(`/workspaces/${workspaceId}`, payload);
  return unwrapOne(data, "workspace");
}

export async function deleteWorkspace(workspaceId) {
  await apiClient.delete(`/workspaces/${workspaceId}`);
}

export async function leaveWorkspace(workspaceId) {
  await apiClient.post(`/workspaces/${workspaceId}/leave`);
}

export async function getWorkspaceProjects(workspaceId) {
  const { data } = await apiClient.get(`/workspaces/${workspaceId}/projects`);
  return unwrapList(data, "projects");
}

export async function getWorkspaceMembers(workspaceId) {
  const { data } = await apiClient.get(`/workspaces/${workspaceId}/members`);
  return unwrapList(data, "members");
}

export async function addWorkspaceMember(workspaceId, payload) {
  const { data } = await apiClient.post(`/workspaces/${workspaceId}/members`, payload);
  return unwrapOne(data, "member");
}

export async function updateWorkspaceMember(workspaceId, userId, payload) {
  const { data } = await apiClient.put(`/workspaces/${workspaceId}/members/${userId}`, payload);
  return unwrapOne(data, "member");
}

export async function removeWorkspaceMember(workspaceId, userId) {
  await apiClient.delete(`/workspaces/${workspaceId}/members/${userId}`);
}
