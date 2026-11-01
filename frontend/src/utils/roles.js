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

const HOME_BY_ROLE = {
  admin: "/admin",
  manager: "/manager",
  developer: "/developer",
};

export function homePathFor(role) {
  return HOME_BY_ROLE[roleKey(role)] || "/";
}