import { useCallback, useEffect, useMemo, useState } from "react";
import Avatar from "../../components/common/Avatar";
import Badge, { RoleBadge } from "../../components/common/Badge";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Dropdown from "../../components/common/Dropdown";
import EmptyState from "../../components/common/EmptyState";
import Icon from "../../components/common/Icon";
import PageHeader from "../../components/common/PageHeader";
import SearchInput from "../../components/common/SearchInput";
import StatCard from "../../components/common/StatCard";
import { SectionLoader } from "../../components/common/Loader";
import MemberFormModal from "../../components/team/MemberFormModal";
import { useAuth } from "../../context/AuthContext";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser as updateUserRequest,
} from "../../services/userService";
import { ROLE_OPTIONS } from "../../utils/constants";
import { formatDate } from "../../utils/dates";
import { getErrorMessage } from "../../utils/errors";
import { notify } from "../../utils/notifications";
import { roleKey } from "../../utils/roles";

export default function AdminUsers() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((item) => roleKey(item.role) === "admin").length,
      managers: users.filter((item) => roleKey(item.role) === "manager").length,
      developers: users.filter((item) => roleKey(item.role) === "developer").length,
    }),
    [users]
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (item) =>
        String(item.name || "").toLowerCase().includes(term) ||
        String(item.email || "").toLowerCase().includes(term) ||
        String(item.role || "").toLowerCase().includes(term)
    );
  }, [users, query]);

  async function handleAdd(payload) {
    await createUser(payload);
    await load();
    setAddOpen(false);
    notify.success("Utilisateur créé avec succès.");
  }

  async function handleUpdate(payload) {
    await updateUserRequest(editing.id, payload);
    await load();
    setEditing(null);
    notify.success("Utilisateur mis à jour avec succès.");
  }

  async function handleDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteUser(toDelete.id);
      setUsers((previous) => previous.filter((item) => String(item.id) !== String(toDelete.id)));
      setToDelete(null);
      notify.success("Utilisateur supprimé.");
    } catch {
      // Erreur déjà signalée par l'intercepteur Axios.
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilisateurs"
        description="Administrez tous les comptes de la plateforme et leurs rôles."
        actions={
          <Button onClick={() => setAddOpen(true)} icon={<Icon name="plus" className="h-4 w-4" />}>
            Nouvel utilisateur
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Comptes" value={stats.total} icon="users" tone="brand" />
        <StatCard label="Administrateurs" value={stats.admins} icon="shield" tone="brand" />
        <StatCard label="Managers" value={stats.managers} icon="briefcase" tone="amber" />
        <StatCard label="Développeurs" value={stats.developers} icon="tasks" tone="emerald" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Rechercher un utilisateur…"
          className="w-full max-w-sm"
        />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {filtered.length} utilisateur{filtered.length > 1 ? "s" : ""}
          {query && " trouvé(s)"}
        </p>
      </div>

      {loading && <SectionLoader label="Chargement des utilisateurs…" />}

      {!loading && error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300"
        >
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={load} icon={<Icon name="refresh" className="h-4 w-4" />}>
            Réessayer
          </Button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon="users"
          title={users.length === 0 ? "Aucun utilisateur" : "Aucun utilisateur ne correspond"}
          description={
            users.length === 0
              ? "Créez le premier compte pour commencer."
              : "Essayez un autre nom, e-mail ou rôle."
          }
          action={
            users.length === 0 ? (
              <Button onClick={() => setAddOpen(true)} icon={<Icon name="plus" className="h-4 w-4" />}>
                Nouvel utilisateur
              </Button>
            ) : query ? (
              <Button variant="outline" onClick={() => setQuery("")}>
                Réinitialiser la recherche
              </Button>
            ) : null
          }
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 dark:divide-slate-800 dark:bg-slate-900 dark:ring-slate-800">
          {filtered.map((item) => {
            const isSelf = String(item.id) === String(user?.id);
            return (
              <li
                key={item.id}
                className="flex flex-col gap-3 p-4 transition hover:bg-slate-50/70 sm:flex-row sm:items-center dark:hover:bg-slate-800/40"
              >
                <Avatar name={item.name} size="md" />

                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-brand-900 dark:text-white">
                    <span className="truncate">{item.name}</span>
                    {isSelf && <Badge tone="brand">Vous</Badge>}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{item.email}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <RoleBadge role={item.role} />
                  {item.created_at && (
                    <span className="hidden text-xs text-slate-400 lg:inline">
                      Inscrit le {formatDate(item.created_at)}
                    </span>
                  )}

                  {!isSelf ? (
                    <Dropdown
                      trigger={<Icon name="more" className="h-4 w-4" />}
                      triggerClassName="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      items={[
                        { label: "Modifier", icon: "edit", onClick: () => setEditing(item) },
                        { separator: true },
                        { label: "Supprimer", icon: "trash", danger: true, onClick: () => setToDelete(item) },
                      ]}
                      label={`Actions pour ${item.name}`}
                    />
                  ) : (
                    <span className="w-7" aria-hidden="true" />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {addOpen && (
        <MemberFormModal
          roleOptions={ROLE_OPTIONS}
          title="Nouvel utilisateur"
          submitLabel="Créer le compte"
          requirePassword
          onSubmit={handleAdd}
          onClose={() => setAddOpen(false)}
        />
      )}

      {editing && (
        <MemberFormModal
          initial={editing}
          roleOptions={ROLE_OPTIONS}
          title={`Modifier ${editing.name}`}
          submitLabel="Enregistrer"
          requirePassword={false}
          onSubmit={handleUpdate}
          onClose={() => setEditing(null)}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Supprimer l'utilisateur"
          description={`Voulez-vous vraiment supprimer le compte de « ${toDelete.name} » ? Cette action est irréversible.`}
          confirmLabel="Supprimer"
          onConfirm={handleDelete}
          onClose={() => setToDelete(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
