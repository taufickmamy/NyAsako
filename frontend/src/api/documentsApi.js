import api from "./axios";

const unwrapList = (data) =>
  Array.isArray(data) ? data : data?.documents ?? data?.data ?? [];
const unwrapOne = (data) => data?.document ?? data?.data ?? data;

export async function getDocuments(projectId) {
  const { data } = await api.get(`/projects/${projectId}/documents`);
  return unwrapList(data);
}

export async function uploadDocument(projectId, file) {
  const formData = new FormData();
  formData.append("File", file);

  const { data } = await api.post(`/projects/${projectId}/documents`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return unwrapOne(data);
}

export async function deleteDocument(projectId, documentId) {
  await api.delete(`/projects/${projectId}/documents/${documentId}`);
}