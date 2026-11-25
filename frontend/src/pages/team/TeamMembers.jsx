import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Avatar from "../../components/common/Avatar";
import Badge from "../../components/common/Badge";
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
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  WORKSPACE_ASSIGNABLE_ROLES,
  WORKSPACE_ROLE_OPTIONS,
  workspaceRoleLabel,
} from "../../utils/constants";
import { formatDate } from "../../utils/dates";
import { notify } from "../../utils/notifications";

export default function TeamMembers() {
  const { user } = useAuth();
  const {
    workspace,
    members,
    membersLoading,
    membersError,
    currentRole,
    canManageMembers,
    refreshMembers,
    addMember,
    updateMember,
    removeMember,
  } = useWorkspace();

  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(() => searchParams.get("invite") === "1");
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (searchParams.get("invite") === "1") {
      setAddOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete("invite");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const roleOptions =
    currentRole === "owner" || currentRole === "admin"
      ? WORKSPACE_ROLE_OPTIONS
      : WORKSPACE_ASSIGNABLE_ROLES;

  const stats = useMemo(
    () => ({
      total: members.length,
      admins: members.filter((member) => member.role === "admin").length,
      managers: members.filter((member) => member.role === "manager").length,
      developers: members.filter((member) => member.role === "member").length,
    }),
    [members]
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return members;
    return members.filter(
      (member) =>
        String(member.name || "").toLowerCase().includes(term) ||
        String(member.email || "").toLowerCase().includes(term) ||
        workspaceRoleLabel(member.role).toLowerCase().includes(term)
    );
  }, [members, query]);

  function userIdOf(member) {
    return member.user_id ?? member.id;
  }

  function canEditMember(member) {
    if (!canManageMembers) return false;
    if (member.role === "owner") return false;
    if (currentRole === "manager" && member.role === "admin") return false;
    if (String(userIdOf(member)) === String(user?.id)) return false;
    return true;
  }

  async function handleAdd(payload) {
    await addMember(payload);
    setAddOpen(false);
    notify.success("Membre ajouté à l'espace de travail.");
  }

  async function handleUpdate(payload) {
    await updateMember(userIdOf(editing), payload);
    setEditing(null);
    notify.success("Rôle du membre mis à jour avec succès.");
  }

  async function handleDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await removeMember(userIdOf(toDelete));
      setToDelete(null);
      notify.success("Membre retiré de l'espace de travail.");
    } catch {
      notify.error("Impossible de retirer ce membre.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Équipe"
        description={`Gérez les membres de « ${workspace?.name || "votre espace"} » et leurs rôles.`}
        actions={
          canManageMembers && (
            <Button onClick={() => setAddOpen(true)} icon={<Icon name="plus" className="h-4 w-4" />}>
              Ajouter un membre
            </Button>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Membres" value={stats.total} icon="users" tone="brand" />
        <StatCard label="Administrateurs" value={stats.admins} icon="shield" tone="brand" />
        <StatCard label="Managers" value={stats.managers} icon="briefcase" tone="amber" />
        <StatCard label="Membres" value={stats.developers} icon="tasks" tone="emerald" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Rechercher un membre…"
          className="w-full max-w-sm"
        />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {filtered.length} membre{filtered.length > 1 ? "s" : ""}
          {query && " trouvé(s)"}
        </p>
      </div>

      {membersLoading && <SectionLoader label="Chargement de l'équipe…" />}

      {!membersLoading && membersError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300"
        >
          <span>{membersError}</span>
          <Button variant="ghost" size="sm" onClick={refreshMembers} icon={<Icon name="refresh" className="h-4 w-4" />}>
            Réessayer
          </Button>
        </div>
      )}

      {!membersLoading && !membersError && filtered.length === 0 && (
        <EmptyState
          icon="users"
          title={members.length === 0 ? "Aucun membre" : "Aucun membre ne correspond"}
          description={
            members.length === 0
              ? "Ajoutez les personnes qui travaillent sur vos projets."
              : "Essayez un autre nom, e-mail ou rôle."
          }
          action={
            members.length === 0 && canManageMembers ? (
              <Button onClick={() => setAddOpen(true)} icon={<Icon name="plus" className="h-4 w-4" />}>
                Ajouter un membre
              </Button>
            ) : query ? (
              <Button variant="outline" onClick={() => setQuery("")}>
                Réinitialiser la recherche
              </Button>
            ) : null
          }
        />
      )}

      {!membersLoading && !membersError && filtered.length > 0 && (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 dark:divide-slate-800 dark:bg-slate-900 dark:ring-slate-800">
          {filtered.map((member) => {
            const isSelf = String(userIdOf(member)) === String(user?.id);
            const editable = canEditMember(member);

            return (
              <li
                key={member.id || userIdOf(member)}
                className="flex flex-col gap-3 p-4 transition hover:bg-slate-50/70 sm:flex-row sm:items-center dark:hover:bg-slate-800/40"
              >
                <Avatar name={member.name} size="md" />

                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-brand-900 dark:text-white">
                    <span className="truncate">{member.name}</span>
                    {isSelf && <Badge tone="brand">Vous</Badge>}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{member.email}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <Badge tone={member.role === "owner" ? "violet" : "blue"}>
                    {workspaceRoleLabel(member.role)}
                  </Badge>
                  {(member.joined_at || member.created_at) && (
                    <span className="hidden text-xs text-slate-400 lg:inline">
                      Depuis le {formatDate(member.joined_at || member.created_at)}
                    </span>
                  )}

                  {editable ? (
                    <Dropdown
                      trigger={<Icon name="more" className="h-4 w-4" />}
                      triggerClassName="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      items={[
                        { label: "Modifier le rôle", icon: "edit", onClick: () => setEditing(member) },
                        { separator: true },
                        { label: "Retirer de l'espace", icon: "trash", danger: true, onClick: () => setToDelete(member) },
                      ]}
                      label={`Actions pour ${member.name}`}
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
          roleOptions={roleOptions}
          title="Ajouter un membre"
          submitLabel="Ajouter"
          mode="workspace"
          onSubmit={handleAdd}
          onClose={() => setAddOpen(false)}
        />
      )}

      {editing && (
        <MemberFormModal
          initial={editing}
          roleOptions={roleOptions}
          title={`Modifier ${editing.name}`}
          submitLabel="Enregistrer"
          mode="role"
          onSubmit={handleUpdate}
          onClose={() => setEditing(null)}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Retirer le membre"
          description={`Voulez-vous vraiment retirer « ${toDelete.name} » de cet espace de travail ? Son compte reste actif et il n'aura plus accès aux projets de cet espace.`}
          confirmLabel="Retirer"
          onConfirm={handleDelete}
          onClose={() => setToDelete(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
