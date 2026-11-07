import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Avatar from "../common/Avatar";
import Dropdown from "../common/Dropdown";
import Icon from "../common/Icon";
import ThemeToggle from "../common/ThemeToggle";
import { findNavItem } from "../../config/navigation";
import { useAuth } from "../../context/AuthContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { isAdmin, roleLabel } from "../../utils/roles";

/** Barre supérieure : menu mobile, titre de page, recherche, notifications, profil. */
export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { workspace } = useWorkspace();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");

  const current = findNavItem(location.pathname);

  function handleSearch(event) {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `/projects?q=${encodeURIComponent(value)}` : "/projects");
  }

  const menuItems = [
    { label: "Mon profil", icon: "user", to: "/settings/profile" },
    { label: "Espace de travail", icon: "settings", to: "/settings/workspace" },
    ...(isAdmin(user)
      ? [{ label: "Administration", icon: "shield", to: "/admin/users" }]
      : []),
    { separator: true },
    { label: "Se déconnecter", icon: "logout", danger: true, onClick: logout },
  ];

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Ouvrir le menu"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Icon name="menu" className="h-5 w-5" />
      </button>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-brand-900 dark:text-white">
          {current?.label || workspace.name}
        </p>
        <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">
          {workspace.name}
        </p>
      </div>

      <form onSubmit={handleSearch} className="ml-auto hidden md:block">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Icon name="search" className="h-4 w-4" />
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un projet…"
            aria-label="Rechercher un projet"
            className="w-56 rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 lg:w-72 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
          />
        </div>
      </form>

      <div className="ml-auto flex items-center gap-1.5 md:ml-2">
        <Link
          to="/activities"
          aria-label="Voir les activités"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Icon name="bell" className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white dark:ring-slate-900" />
        </Link>

        <ThemeToggle />

        <Dropdown
          trigger={
            <span className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Avatar name={user?.name} size="sm" />
              <span className="hidden text-left sm:block">
                <span className="block max-w-[9rem] truncate text-sm font-semibold leading-tight text-brand-900 dark:text-white">
                  {user?.name}
                </span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">
                  {roleLabel(user?.role)}
                </span>
              </span>
              <Icon name="chevron-down" className="hidden h-4 w-4 text-slate-400 sm:block" />
            </span>
          }
          items={menuItems}
          label="Menu du compte"
        />
      </div>
    </header>
  );
}
