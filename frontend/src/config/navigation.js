export const NAV_BY_ROLE = {
  admin: [
    { label: "Tableau de bord", to: "/admin", icon: "dashboard", end: true },
    { label: "Utilisateurs", to: "/admin/users", icon: "users" },
    { label: "Projets", to: "/admin/projects", icon: "folder" },
    { label: "Activités", to: "/admin/activities", icon: "clock" },
  ],
  manager: [
    { label: "Tableau de bord", to: "/manager", icon: "dashboard", end: true },
    { label: "Projets", to: "/manager/projects", icon: "folder" },
    { label: "Équipe", to: "/manager/team", icon: "users" },
    { label: "Documents", to: "/manager/documents", icon: "file" },
    { label: "Activités", to: "/manager/activities", icon: "clock" },
  ],
  developer: [
    { label: "Tableau de bord", to: "/developer", icon: "dashboard", end: true },
    { label: "Mes tâches", to: "/developer/tasks", icon: "tasks" },
    { label: "Projets", to: "/developer/projects", icon: "folder" },
    { label: "Documents", to: "/developer/documents", icon: "file" },
  ],
};