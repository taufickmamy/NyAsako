import apiClient from "./apiClient";
import { unwrapList, unwrapOne } from "./normalize";
import { getProjects } from "./projectService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
const FILE_ORIGIN = API_URL.replace(/\/api(?:\/v1)?\/?$/, "");

/** Construit l'URL publique d'un fichier téléversé. */
export function getFileUrl(filePath) {
  if (!filePath) return "#";
  if (/^https?:\/\//i.test(filePath)) return filePath;
  const normalized = String(filePath).replace(/\\/g, "/").replace(/^\/+/, "");
  return `${FILE_ORIGIN}/${normalized}`;
}

export async function getProjectDocuments(projectId) {
  const { data } = await apiClient.get(`/projects/${projectId}/documents`);
  return unwrapList(data, "documents");
}

/**
 * Tous les documents de tous les projets.
 * Utilise l'endpoint global s'il existe, sinon agrège projet par projet.
 */
export async function getAllDocuments() {
  try {
    const { data } = await apiClient.get("/documents", { silent: true });
    return unwrapList(data, "documents");
  } catch {
    const projects = await getProjects();
    const results = await Promise.allSettled(
      projects.map((project) => getProjectDocuments(project.id))
    );

    return results.flatMap((result, index) => {
      if (result.status !== "fulfilled") return [];
      const project = projects[index];
      return result.value.map((doc) => ({
        ...doc,
        project_id: doc.project_id || project.id,
        project_title: doc.project_title || project.title,
      }));
    });
  }
}

export async function uploadDocument(projectId, file) {
  const formData = new FormData();
  formData.append("File", file);

  const { data } = await apiClient.post(`/projects/${projectId}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return unwrapOne(data, "document");
}

export async function deleteDocument(projectId, documentId) {
  await apiClient.delete(`/projects/${projectId}/documents/${documentId}`);
}
