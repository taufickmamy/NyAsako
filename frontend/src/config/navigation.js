import { hasAnyRole } from "../utils/roles";

const ALL_ROLES = ["Administrateur", "Manager", "Développeur"];

/**
 * Navigation principale, groupée par section.
 * Chaque entrée déclare les rôles autorisés à la voir.
 */
export const NAV_SECTIONS = [
  {
    title: "Pilotage",
    items: [
      { label: "Tableau de bord", to: "/dashboard", icon: "dashboard", end: true, roles: ALL_ROLES },
      { label: "Projets", to: "/projects", icon: "folder", roles: ALL_ROLES },
      { label: "Mes tâches", to: "/tasks", icon: "tasks", roles: ALL_ROLES },
    ],
  },
  {
    title: "Collaboration",
    items: [
      { label: "Documents", to: "/documents", icon: "file", roles: ALL_ROLES },
      { label: "Activités", to: "/activities", icon: "clock", roles: ALL_ROLES },
      { label: "Équipe", to: "/team", icon: "users", roles: ["Administrateur", "Manager"] },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Utilisateurs", to: "/admin/users", icon: "shield", roles: ["Administrateur"] },
    ],
  },
  {
    title: "Compte",
    items: [
      { label: "Mon profil", to: "/settings/profile", icon: "user", roles: ALL_ROLES },
      { label: "Espace de travail", to: "/settings/workspace", icon: "settings", roles: ALL_ROLES },
    ],
  },
];

/** Toutes les entrées à plat (utile pour le fil d'ariane). */
export const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap((section) => section.items);

/** Filtre les sections selon le rôle de l'utilisateur. */
export function getNavigationFor(user) {
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => hasAnyRole(user, item.roles)),
  })).filter((section) => section.items.length > 0);
}

/** Retrouve le libellé d'une page à partir de son chemin. */
export function findNavItem(pathname) {
  return (
    ALL_NAV_ITEMS.find((item) =>
      item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`)
    ) || null
  );
}
