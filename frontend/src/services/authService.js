import apiClient from "./apiClient";
import { unwrapOne } from "./normalize";

/** Connexion : renvoie { user, accessToken } (déballé de l'enveloppe { data }). */
export async function login(credentials) {
  const { data } = await apiClient.post("/auth/login", credentials, { silent: true });
  return unwrapOne(data);
}

/** Inscription d'un nouveau compte. */
export async function register(payload) {
  const { data } = await apiClient.post("/auth/register", payload, { silent: true });
  return data;
}

/** Déconnexion (suppression du cookie refresh côté serveur). */
export async function logout() {
  try {
    await apiClient.post("/auth/logout", {}, { silent: true });
  } catch {
    // La déconnexion locale reste valable même si le serveur est injoignable.
  }
}

/** Récupère le profil de l'utilisateur connecté. */
export async function getMe() {
  const { data } = await apiClient.get("/users/me", { silent: true });
  return unwrapOne(data, "user");
}
