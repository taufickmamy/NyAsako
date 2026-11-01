import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import logo from "../assets/ASlogo.png";
import Icon from "../components/Icon";
import ThemeToggle from "../components/ThemeToggle";
import { NAV_BY_ROLE } from "../config/navigation";
import { useAuth } from "../context/AuthContext";
import { roleKey } from "../utils/roles";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); 

  const items = NAV_BY_ROLE[roleKey(user?.role)] || [];
  const initials = (user?.name || "?")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
      isActive
        ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400"
        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    }`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-300">
      {/* Overlay pour mobile sidebar */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 dark:border-slate-800 dark:bg-slate-900 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center px-5">
          <img
            src={logo}
            alt="NyAsako"
            className="h-9 w-auto dark:rounded-lg dark:bg-white dark:px-2 dark:py-0.5"
          />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Navigation principale">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <Icon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Icon name="logout" />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* coté droite */}
      <div className="lg:pl-64">
        {/* Navbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Icon name="menu" />
          </button>

          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white"
                aria-hidden="true"
              >
                {initials}
              </span>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold leading-tight text-brand-900 dark:text-white">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page actuellement */}
        <main className="px-5 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}