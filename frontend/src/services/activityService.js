import apiClient from "./apiClient";
import { unwrapList } from "./normalize";

/** Historique global des activités. */
export async function getAllActivities() {
  const { data } = await apiClient.get("/activities");
  return unwrapList(data, "activities");
}

/** Historique des activités d'un projet. */
export async function getProjectActivities(projectId) {
  const { data } = await apiClient.get(`/projects/${projectId}/activities`);
  return unwrapList(data, "activities");
}

/** Les N dernières activités (widget tableau de bord). */
export async function getRecentActivities(limit = 5) {
  const activities = await getAllActivities();
  return activities.slice(0, limit);
}
