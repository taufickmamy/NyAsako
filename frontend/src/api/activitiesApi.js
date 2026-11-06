// src/api/activitiesApi.js
import api from "./axios";

const unwrapList = (data) =>
  Array.isArray(data) ? data : data?.activities ?? data?.data ?? [];

export async function getProjectActivities(projectId) {
  const { data } = await api.get(`/projects/${projectId}/activities`);
  return unwrapList(data);
}

export async function getAllActivities() {
  const { data } = await api.get("/activities");
  return unwrapList(data);
}