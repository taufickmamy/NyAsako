import apiClient from "./apiClient";
import { unwrapList, unwrapOne } from "./normalize";

/** Administration globale : liste de tous les comptes. */
export async function getUsers() {
  const { data } = await apiClient.get("/users");
  return unwrapList(data, "users");
}

export async function createUser(payload) {
  const { data } = await apiClient.post("/users", payload);
  return unwrapOne(data, "user");
}

export async function updateUser(id, payload) {
  const { data } = await apiClient.patch(`/users/${id}`, payload);
  return unwrapOne(data, "user");
}

export async function updateUserRole(id, role) {
  return updateUser(id, { role });
}

export async function deleteUser(id) {
  await apiClient.delete(`/users/${id}`);
}

/** Profil de l'utilisateur connecté. */
export async function getMe() {
  const { data } = await apiClient.get("/users/me");
  return unwrapOne(data, "user");
}

export async function updateMe(payload) {
  const { data } = await apiClient.patch("/users/me", payload);
  return unwrapOne(data, "user");
}

export async function updateAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);

  const { data } = await apiClient.post("/users/me/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return unwrapOne(data, "user");
}