/**
 * Constantes métier partagées par toute l'application.
 * Les valeurs doivent rester identiques à celles attendues par l'API
 * (énumérations PostgreSQL : task_status, task_priority, user_role).
 */

export const WORKSPACE_STORAGE_KEY = "nyasako_active_workspace_id";

export const TASK_STATUSES = [
  { value: "À faire", label: "À faire", tone: "slate", dot: "bg-slate-400" },
  { value: "En cours", label: "En cours", tone: "amber", dot: "bg-amber-400" },
  { value: "Terminé", label: "Terminé", tone: "emerald", dot: "bg-emerald-500" },
];

export const TASK_PRIORITIES = [
  { value: "Faible", label: "Faible", tone: "slate" },
  { value: "Moyenne", label: "Moyenne", tone: "amber" },
  { value: "Élevée", label: "Élevée", tone: "red" },
];

export const ROLES = {
  ADMIN: "Administrateur",
  MANAGER: "Manager",
  DEVELOPER: "Développeur",
};

export const ROLE_OPTIONS = [
  { value: ROLES.ADMIN, label: "Administrateur" },
  { value: ROLES.MANAGER, label: "Manager" },
  { value: ROLES.DEVELOPER, label: "Développeur" },
];

/** Rôles qu'un manager peut attribuer (il ne peut pas créer d'admin). */
export const MANAGER_ASSIGNABLE_ROLES = [
  { value: ROLES.MANAGER, label: "Manager" },
  { value: ROLES.DEVELOPER, label: "Développeur" },
];

export const WORKSPACE_ROLE_OPTIONS = [
  { value: "admin", label: "Administrateur" },
  { value: "manager", label: "Manager" },
  { value: "member", label: "Membre" },
];

export const WORKSPACE_ASSIGNABLE_ROLES = [
  { value: "manager", label: "Manager" },
  { value: "member", label: "Membre" },
];

export function workspaceRoleLabel(role) {
  return WORKSPACE_ROLE_OPTIONS.find((option) => option.value === role)?.label || String(role || "Membre");
}

/** Statuts et priorités sous forme de simples tableaux de valeurs. */
export const STATUS_VALUES = TASK_STATUSES.map((s) => s.value);
export const PRIORITY_VALUES = TASK_PRIORITIES.map((p) => p.value);

/** Retourne la définition d'un statut à partir de sa valeur. */
export function statusMeta(value) {
  return TASK_STATUSES.find((s) => s.value === value) ?? TASK_STATUSES[0];
}

/** Retourne la définition d'une priorité à partir de sa valeur. */
export function priorityMeta(value) {
  return TASK_PRIORITIES.find((p) => p.value === value) ?? TASK_PRIORITIES[1];
}
