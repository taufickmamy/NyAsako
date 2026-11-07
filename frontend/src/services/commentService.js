import apiClient from "./apiClient";
import { unwrapList, unwrapOne } from "./normalize";

/** Commentaires d'une tâche. */
export async function getTaskComments(taskId) {
  const { data } = await apiClient.get(`/tasks/${taskId}/comments`);
  return unwrapList(data, "comments");
}

export async function createComment(taskId, content) {
  const { data } = await apiClient.post(`/tasks/${taskId}/comments`, { content });
  return unwrapOne(data, "comment");
}

export async function deleteComment(taskId, commentId) {
  await apiClient.delete(`/tasks/${taskId}/comments/${commentId}`);
}
