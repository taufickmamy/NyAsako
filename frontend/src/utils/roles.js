/**
 * Helpers de gestion des rôles.
 * Les rôles stockés en base sont : "Administrateur", "Manager", "Développeur".
 */

/** Normalise un rôle (accents, casse) vers une clé stable : admin/manager/developer. */
export function roleKey(role) {
  const r = String(role || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (r.startsWith("admin")) return "admin";
  if (r.startsWith("manager")) return "manager";
  if (r.startsWith("dev")) return "developer";
  return "";
}

/** Libellé lisible d'un rôle. */
export function roleLabel(role) {
  const key = roleKey(role);
  if (key === "admin") return "Administrateur";
  if (key === "manager") return "Manager";
  if (key === "developer") return "Développeur";
  return String(role || "Inconnu");
}

/** Page d'accueil après connexion. */
export function homePathFor() {
  return "/dashboard";
}

/** Vrai si l'utilisateur possède l'un des rôles fournis (clés ou libellés). */
export function hasAnyRole(user, roles = []) {
  const current = roleKey(user?.role);
  return roles.some((role) => roleKey(role) === current);
}

export function isAdmin(user) {
  return roleKey(user?.role) === "admin";
}

export function isManager(user) {
  return roleKey(user?.role) === "manager";
}

export function isDeveloper(user) {
  return roleKey(user?.role) === "developer";
}

/** Peut créer / modifier / supprimer des projets. */
export function canManageProjects(user) {
  return hasAnyRole(user, ["Administrateur", "Manager"]);
}

/** Peut gérer l'équipe de l'espace de travail. */
export function canManageTeam(user) {
  return hasAnyRole(user, ["Administrateur", "Manager"]);
}

/** Peut gérer les comptes utilisateurs (administration globale). */
export function canManageUsers(user) {
  return isAdmin(user);
}

/** Peut administrer toutes les tâches (création, édition, suppression). */
export function canManageTasks(user) {
  return hasAnyRole(user, ["Administrateur", "Manager"]);
}

/** Initiales utilisées par les avatars. */
export function initialsOf(name) {
  return String(name || "?")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
