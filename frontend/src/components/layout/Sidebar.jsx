import { NavLink } from "react-router-dom";
import logo from "../../assets/ASlogo.png";
import Avatar from "../common/Avatar";
import Icon from "../common/Icon";
import { getNavigationFor } from "../../config/navigation";
import { useAuth } from "../../context/AuthContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { roleLabel } from "../../utils/roles";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
    isActive
      ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
  }`;

/** Barre latérale de navigation (desktop fixe, mobile en tiroir). */
export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const { workspace, memberCount } = useWorkspace();
  const sections = getNavigationFor(user);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 dark:border-slate-800 dark:bg-slate-900 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
      aria-label="Navigation latérale"
    >
      <div className="flex h-16 items-center justify-between px-5">
        <NavLink to="/dashboard" onClick={onClose} aria-label="NyAsako, tableau de bord">
          <img
            src={logo}
            alt="NyAsako"
            className="h-9 w-auto dark:rounded-lg dark:bg-white dark:px-2 dark:py-0.5"
          />
        </NavLink>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer le menu"
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
        >
          <Icon name="close" className="h-5 w-5" />
        </button>
      </div>

      <div className="mx-3 mb-2 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/60">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Espace</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-brand-900 dark:text-white">
          {workspace.name}
        </p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {memberCount} membre{memberCount > 1 ? "s" : ""}
        </p>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-3">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={linkClass}
                >
                  <Icon name={item.icon} className="h-5 w-5 shrink-0" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <div className="mb-2 flex items-center gap-3 rounded-xl px-2 py-2">
          <Avatar name={user?.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-brand-900 dark:text-white">
              {user?.name}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {roleLabel(user?.role)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:text-slate-300 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          <Icon name="logout" className="h-5 w-5" />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
