import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Activities from "./pages/activities/Activities";
import AdminUsers from "./pages/admin/Users";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import Documents from "./pages/documents/Documents";
import ProjectCreate from "./pages/projects/ProjectCreate";
import ProjectDetails from "./pages/projects/ProjectDetails";
import ProjectEdit from "./pages/projects/ProjectEdit";
import ProjectsList from "./pages/projects/ProjectsList";
import Profile from "./pages/settings/Profile";
import WorkspaceSettings from "./pages/settings/WorkspaceSettings";
import MyTasks from "./pages/tasks/MyTasks";
import TaskDetails from "./pages/tasks/TaskDetails";
import TeamMembers from "./pages/team/TeamMembers";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/projects" element={<ProjectsList />} />
          <Route path="/projects/new" element={<ProjectCreate />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/projects/:id/edit" element={<ProjectEdit />} />

          <Route path="/tasks" element={<MyTasks />} />
          <Route path="/tasks/:id" element={<TaskDetails />} />

          <Route path="/documents" element={<Documents />} />
          <Route path="/activities" element={<Activities />} />

          <Route path="/settings/profile" element={<Profile />} />
          <Route path="/settings/workspace" element={<WorkspaceSettings />} />

          <Route element={<RoleRoute roles={["Administrateur", "Manager"]} />}>
            <Route path="/team" element={<TeamMembers />} />
          </Route>

          <Route element={<RoleRoute roles={["Administrateur"]} />}>
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>

      {/* Anciennes URL par espace : redirection vers le tableau de bord unifié. */}
      <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
      <Route path="/admin/*" element={<Navigate to="/dashboard" replace />} />
      <Route path="/manager/*" element={<Navigate to="/dashboard" replace />} />
      <Route path="/developer/*" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
