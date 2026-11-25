import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "../../components/common/Avatar";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Icon from "../../components/common/Icon";
import Input, { Textarea } from "../../components/common/Input";
import PageHeader from "../../components/common/PageHeader";
import { SectionLoader } from "../../components/common/Loader";
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  WORKSPACE_ROLE_OPTIONS,
  workspaceRoleLabel,
} from "../../utils/constants";
import { notify } from "../../utils/notifications";

function emptyForm() {
  return { name: "", description: "" };
}

export default function WorkspaceSettings() {
  const {
    workspace,
    workspaces,
    error,
    loading,
    members,
    membersLoading,
    membersError,
    canEditWorkspace,
    canManageMembers,
    addWorkspace,
    updateCurrentWorkspace,
    removeWorkspace,
    switchWorkspace,
    refreshMembers,
  } = useWorkspace();

  const [form, setForm] = useState({
    name: workspace?.name || "",
    description: workspace?.description || "",
  });
  const [newWorkspace, setNewWorkspace] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    setForm({
      name: workspace?.name || "",
      description: workspace?.description || "",
    });
  }, [workspace?.id, workspace?.name, workspace?.description]);

  function handleChange(event) {
    setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  }

  function handleNewChange(event) {
    setNewWorkspace((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canEditWorkspace) return;

    const found = {};
    if (!form.name.trim()) found.name = "Le nom de l'espace est obligatoire.";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      await updateCurrentWorkspace({
        name: form.name.trim(),
        description: form.description.trim(),
      });
      notify.success("Paramètres de l'espace enregistrés.");
    } catch {
      notify.error("Impossible d'enregistrer les paramètres de l'espace.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate(event) {
    event.preventDefault();
    if (!newWorkspace.name.trim()) {
      notify.error("Le nom du nouvel espace est obligatoire.");
      return;
    }

    setCreating(true);
    try {
      const created = await addWorkspace({
        name: newWorkspace.name.trim(),
        description: newWorkspace.description.trim(),
      });
      setNewWorkspace(emptyForm());
      notify.success(`Espace « ${created?.name || newWorkspace.name.trim()} » créé.`);
    } catch {
      notify.error("Impossible de créer l'espace de travail.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await removeWorkspace(toDelete.id);
      notify.success("Espace de travail supprimé.");
      setToDelete(null);
    } catch {
      notify.error("Impossible de supprimer cet espace de travail.");
    }
  }

  const roleCounts = WORKSPACE_ROLE_OPTIONS.map((option) => ({
    ...option,
    count: members.filter((member) => member.role === option.value).length,
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Espaces de travail"
        description="Gérez vos espaces, leurs membres et les préférences de l'espace actif."
      />

      {loading && <SectionLoader label="Chargement des espaces…" />}
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <h2 className="text-base font-bold text-brand-900 dark:text-white">Espace actif</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {workspace?.name || "Aucun espace"} · {workspaces.length} espace
          {workspaces.length > 1 ? "s" : ""} disponible{workspaces.length > 1 ? "s" : ""}
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-5">
          <Input
            label="Nom de l'espace"
            id="workspace-name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            icon="building"
            placeholder="Ex. NyAsako Studio"
            required
            disabled={!canEditWorkspace}
          />

          <Textarea
            label="Description"
            id="workspace-description"
            name="description"
            rows={3}
            value={form.description}
            onChange={handleChange}
            placeholder="Présentez votre équipe ou votre organisation…"
            disabled={!canEditWorkspace}
          />

          {canEditWorkspace && (
            <div className="flex justify-end border-t border-slate-100 pt-5 dark:border-slate-800">
              <Button type="submit" loading={saving} icon={<Icon name="check" className="h-4 w-4" />}>
                Enregistrer
              </Button>
            </div>
          )}
        </form>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-brand-900 dark:text-white">Vos espaces</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Basculez d'un espace à l'autre depuis le menu en haut de page.
            </p>
          </div>
        </div>

        <ul className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
          {workspaces.map((item) => {
            const active = String(item.id) === String(workspace?.id);
            return (
              <li key={item.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate text-sm font-semibold text-brand-900 dark:text-white">
                    {item.name}
                    {active && <span className="text-xs font-normal text-brand-600">actif</span>}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {item.description || "Aucune description"} · {workspaceRoleLabel(item.my_role)}
                  </p>
                </div>
                {!active && (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Icon name="arrow-right" className="h-4 w-4" />}
                    onClick={() => switchWorkspace(item.id)}
                  >
                    Ouvrir
                  </Button>
                )}
                {item.my_role === "owner" && workspaces.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Icon name="trash" className="h-4 w-4" />}
                    onClick={() => setToDelete(item)}
                  >
                    Supprimer
                  </Button>
                )}
              </li>
            );
          })}
          {workspaces.length === 0 && !loading && (
            <li className="p-4 text-sm italic text-slate-400">
              Vous n'avez pas encore d'espace de travail.
            </li>
          )}
        </ul>

        <form onSubmit={handleCreate} className="mt-5 grid gap-3 sm:grid-cols-[1fr,1fr,auto] sm:items-end">
          <Input
            label="Nouvel espace"
            id="new-workspace-name"
            name="name"
            value={newWorkspace.name}
            onChange={handleNewChange}
            placeholder="Nom du nouvel espace"
            required
          />
          <Input
            label="Description (facultatif)"
            id="new-workspace-description"
            name="description"
            value={newWorkspace.description}
            onChange={handleNewChange}
            placeholder="Description"
          />
          <Button type="submit" loading={creating} icon={<Icon name="plus" className="h-4 w-4" />}>
            Créer
          </Button>
        </form>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-brand-900 dark:text-white">Membres de l'équipe</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {members.length} membre{members.length > 1 ? "s" : ""} dans cet espace.
            </p>
          </div>
          {canManageMembers && (
            <Button
              as={Link}
              to="/team"
              variant="outline"
              size="sm"
              icon={<Icon name="users" className="h-4 w-4" />}
            >
              Gérer l'équipe
            </Button>
          )}
        </div>

        {membersLoading && <SectionLoader label="Chargement de l'équipe…" />}
        {!membersLoading && membersError && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
            <span>{membersError}</span>
            <Button variant="ghost" size="sm" onClick={refreshMembers} icon={<Icon name="refresh" className="h-4 w-4" />}>
              Réessayer
            </Button>
          </div>
        )}

        {!membersLoading && !membersError && (
          <>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex -space-x-2">
                {members.slice(0, 6).map((member) => (
                  <Avatar key={member.id || member.user_id} name={member.name} size="sm" ring />
                ))}
              </div>
              {members.length === 0 && (
                <p className="text-sm italic text-slate-400">Aucun membre pour le moment.</p>
              )}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {roleCounts.map((role) => (
                <div
                  key={role.value}
                  className="rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-800"
                >
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{role.label}</p>
                  <p className="mt-1 text-xl font-bold text-brand-900 dark:text-white">{role.count}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {toDelete && (
        <ConfirmDialog
          title="Supprimer l'espace de travail"
          description={`Voulez-vous vraiment supprimer « ${toDelete.name} » ? Ses projets, tâches et documents seront supprimés définitivement.`}
          confirmLabel="Supprimer l'espace"
          onConfirm={handleDelete}
          onClose={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
