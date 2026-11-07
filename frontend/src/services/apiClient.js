import axios from "axios";
import { HTTP_ERROR_MESSAGES, isSessionError } from "../utils/errors";
import { notify } from "../utils/notifications";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

/**
 * Instance Axios unique utilisée par TOUS les services.
 * - ajoute automatiquement le jeton JWT ;
 * - normalise les erreurs HTTP (400, 401, 403, 404, 500...) ;
 * - déclenche une notification globale ;
 * - nettoie la session et prévient l'application si le jeton est invalide.
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
  withCredentials: true,
});

/** Supprime les données de session du stockage local. */
export function clearSession() {
  localStorage.removeItem("user");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const url = error.config?.url || "";
    const isAuthCall = url.startsWith("/auth/");
    const silent = Boolean(error.config?.silent);

    // Message explicite : priorité au message serveur, puis au mapping HTTP.
    const message =
      (typeof data === "string" && data.trim()) ||
      data?.message ||
      data?.error ||
      HTTP_ERROR_MESSAGES[status] ||
      "Une erreur inattendue est survenue.";

    error.userMessage = message;

    if (isSessionError(error) && !isAuthCall) {
      clearSession();
      sessionStorage.setItem("sessionExpired", "1");
      window.dispatchEvent(new CustomEvent("nyasako:session-expired"));
    }

    // Notification globale (désactivable via { silent: true }).
    if (!silent && !isAuthCall) {
      notify.error(message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
