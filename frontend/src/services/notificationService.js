import apiClient from "./apiClient";
import { unwrapList, unwrapOne } from "./normalize";

export async function getNotifications() {
  const { data } = await apiClient.get("/notifications");
  return unwrapList(data, "notifications");
}

export async function markAsRead(id) {
  const { data } = await apiClient.patch(`/notifications/${id}/read`);
  return unwrapOne(data, "notification");
}
