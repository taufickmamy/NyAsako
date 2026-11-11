/** Origine du backend (sans le préfixe /api/v1) pour servir /uploads. */
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
const API_ORIGIN = API_BASE.replace(/\/api(\/v\d+)?\/?$/, "");

/** Transforme un chemin relatif du backend (/uploads/...) en URL absolue. */
export function assetUrl(path) {
  if (!path) return null;
  if (/^(https?:|blob:|data:)/i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}
