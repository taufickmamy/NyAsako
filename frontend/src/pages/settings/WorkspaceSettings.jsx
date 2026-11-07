import { useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "../../components/common/Avatar";
import Button from "../../components/common/Button";
import Icon from "../../components/common/Icon";
import Input, { Select, Textarea } from "../../components/common/Input";
import PageHeader from "../../components/common/PageHeader";
import { useWorkspace } from "../../context/WorkspaceContext";
import { ROLE_OPTIONS } from "../../utils/constants";
import { notify } from "../../utils/notifications";
import { roleKey } from "../../utils/roles";

export default function WorkspaceSettings() {
  const { workspace, updateWorkspace, members, canManageTeam } = useWorkspace();

  const [form, setForm] = useState({
    name: workspace.name,
    description: workspace.description,
    defaultRole: workspace.defaultRole,
  });
  const [errors, setErrors] = useState({});

  function handleChange(event) {
    setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const found = {};
    if (!form.name.trim()) found.name = "Le nom de l'espace est obligatoire.";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    updateWorkspace({
      name: form.name.trim(),
      description: form.description.trim(),
      defaultRole: form.defaultRole,
    });
    notify.success("Paramètres de l'espace enregistrés.");
  }

  const roleCounts = ROLE_OPTIONS.map((option) => ({
    ...option,
    count: members.filter((member) => roleKey(member.role) === roleKey(option.value)).length,
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Espace de travail"
        description="Personnalisez le nom et les préférences de votre espace NyAsako."
      />

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
      >
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
        />

        <Textarea
          label="Description"
          id="workspace-description"
          name="description"
          rows={3}
          value={form.description}
          onChange={handleChange}
          placeholder="Présentez votre équipe ou votre organisation…"
          hint="Cette description apparaît dans les paramètres et les documents partagés."
        />

        <Select
          label="Rôle par défaut"
          id="workspace-default-role"
          name="defaultRole"
          value={form.defaultRole}
          onChange={handleChange}
          options={ROLE_OPTIONS}
          hint="Rôle proposé par défaut lors de l'ajout d'un nouveau membre."
        />

        <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
          Ces préférences sont enregistrées dans ce navigateur. La liste des membres, elle, est
          synchronisée avec le serveur.
        </p>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              setForm({
                name: workspace.name,
                description: workspace.description,
                defaultRole: workspace.defaultRole,
              })
            }
          >
            Réinitialiser
          </Button>
          <Button type="submit" icon={<Icon name="check" className="h-4 w-4" />}>
            Enregistrer
          </Button>
        </div>
      </form>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-brand-900 dark:text-white">Membres de l'équipe</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {members.length} membre{members.length > 1 ? "s" : ""} dans cet espace.
            </p>
          </div>
          {canManageTeam && (
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

        <div className="mt-4 flex items-center gap-3">
          <div className="flex -space-x-2">
            {members.slice(0, 6).map((member) => (
              <Avatar key={member.id} name={member.name} size="sm" ring />
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
      </section>
    </div>
  );
}
