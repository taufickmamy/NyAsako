import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

function clearSession() {
  localStorage.removeItem("user");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

// ajouter le token d'accès à chaque requête si disponible
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// si le token d'accès est expiré ou invalide, on supprime la session et on redirige vers la page de connexion
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const data = err.response?.data;
    const message = String(
      data?.message || data?.error || (typeof data === "string" ? data : "")
    );
    const url = err.config?.url || "";
    const isAuthCall = url.startsWith("/auth/"); 

    const tokenProblem =
      status === 401 || (status === 403 && /jeton|token|expir/i.test(message));

    if (tokenProblem && !isAuthCall) {
      clearSession();
      sessionStorage.setItem("sessionExpired", "1");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;