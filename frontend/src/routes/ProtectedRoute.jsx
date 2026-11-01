import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { homePathFor, roleKey } from "../utils/roles";

export default function ProtectedRoute({ allowedRoles }) {
  const { user } = useAuth();


  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(roleKey(user.role))) {
    return <Navigate to={homePathFor(user.role)} replace />;
  }

  return <Outlet />;
}