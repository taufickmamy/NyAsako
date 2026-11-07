import apiClient from "./apiClient";
import { unwrapList, unwrapOne } from "./normalize";

/** Membres de l'espace de travail. */
export async function getMembers() {
  const { data } = await apiClient.get("/team");
  return unwrapList(data, "members");
}

export async function addMember(payload) {
  const { data } = await apiClient.post("/team", payload);
  return unwrapOne(data, "member");
}

export async function updateMember(id, payload) {
  const { data } = await apiClient.patch(`/team/${id}`, payload);
  return unwrapOne(data, "member");
}

export async function updateMemberRole(id, role) {
  return updateMember(id, { role });
}

export async function removeMember(id) {
  await apiClient.delete(`/team/${id}`);
}
