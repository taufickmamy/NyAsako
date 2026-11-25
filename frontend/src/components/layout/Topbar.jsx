import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Avatar from "../common/Avatar";
import Dropdown from "../common/Dropdown";
import Icon from "../common/Icon";
import ThemeToggle from "../common/ThemeToggle";
import { findNavItem } from "../../config/navigation";
import NotificationDropdown from "../common/NotificationDropdown";
import { useAuth } from "../../context/AuthContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { workspaceRoleLabel } from "../../utils/constants";
import { isAdmin, roleLabel } from "../../utils/roles";

/** Barre supérieure : menu mobile, titre de page, recherche, notifications, profil. */
export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { workspace, workspaces, switchWorkspace } = useWorkspace();
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

  const workspaceItems = [
    { label: "Changer d'espace de travail", disabled: true },
    { separator: true },
    ...workspaces.map((item) => ({
      label:
        String(item.id) === String(workspace?.id)
          ? `${item.name} (actif)`
          : item.name,
      icon: String(item.id) === String(workspace?.id) ? "check" : "folder",
      onClick: () => switchWorkspace(item.id),
    })),
    { separator: true },
    {
      label: "Gérer les espaces et les membres",
      icon: "settings",
      to: "/settings/workspace",
    },
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
          {current?.label || workspace?.name}
        </p>
        <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">
          {workspace?.name} · {workspaceRoleLabel(workspace?.my_role)}
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
        <NotificationDropdown />

        <ThemeToggle />

        <Dropdown
          align="right"
          width="w-64"
          label="Changer d'espace de travail"
          triggerClassName="rounded-lg px-2 py-1 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800"
          trigger={
            <span className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                <Icon name="building" className="h-4 w-4" />
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block max-w-[9rem] truncate text-sm font-semibold leading-tight text-brand-900 dark:text-white">
                  {workspace?.name}
                </span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">
                  {workspaces.length} espace{workspaces.length > 1 ? "s" : ""}
                </span>
              </span>
              <Icon name="chevron-down" className="h-4 w-4 text-slate-400" />
            </span>
          }
          items={workspaceItems}
        />

        <Dropdown
          trigger={
            <span className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Avatar name={user?.name} src={user?.profile_picture} size="sm" />
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
