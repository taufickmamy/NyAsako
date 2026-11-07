import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { hasAnyRole } from "../utils/roles";

/**
 * Contrôle d'accès basé sur les rôles.
 * Exemple : <Route element={<RoleRoute roles={["Administrateur"]} />}>
 */
export default function RoleRoute({ roles = [] }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !hasAnyRole(user, roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
