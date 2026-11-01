import { Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardPlaceholder from "./pages/DashboardPlaceholder";
import ComingSoon from "./pages/ComingSoon";
import { homePathFor } from "./utils/roles";

const ROLE_SPACES = [
  { key: "admin", path: "/admin", title: "Tableau de bord Admin" },
  { key: "manager", path: "/manager", title: "Tableau de bord Manager" },
  { key: "developer", path: "/developer", title: "Tableau de bord Développeur" },
];

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/**Route proteger selon leur role*/}
      {ROLE_SPACES.map(({ key, path, title }) => (
        <Route key={key} element={<ProtectedRoute allowedRoles={[key]} />}>
          <Route path={path} element={<AppLayout />}>
            <Route index element={<DashboardPlaceholder title={title} />} />
            <Route path="*" element={<ComingSoon />} />
          </Route>
        </Route>
      ))}
    </Routes>
  );
}