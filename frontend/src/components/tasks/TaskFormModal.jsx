import { useState } from "react";
import Button from "../common/Button";
import Input, { Select, Textarea } from "../common/Input";
import Modal from "../common/Modal";
import { getErrorMessage } from "../../utils/errors";
import { TASK_PRIORITIES, TASK_STATUSES } from "../../utils/constants";
import { toInputDate } from "../../utils/dates";

/** Formulaire de création / modification d'une tâche. */
export default function TaskFormModal({
  initial,
  members = [],
  title = "Nouvelle tâche",
  submitLabel = "Créer la tâche",
  onSubmit,
  onClose,
}) {
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    priority: initial?.priority ?? "Moyenne",
    status: initial?.status ?? "À faire",
    dueDate: toInputDate(initial?.due_date),
    assignedTo: initial?.assigned_to ? String(initial.assigned_to) : "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  }

  function validate() {
    const found = {};
    if (!form.title.trim()) found.title = "Le titre de la tâche est obligatoire.";
    return found;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError("");

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        status: form.status,
        dueDate: form.dueDate || null,
        assignedTo: form.assignedTo ? Number(form.assignedTo) : null,
      });
    } catch (err) {
      setServerError(getErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" form="task-form" loading={loading}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        {serverError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {serverError}
          </p>
        )}

        <Input
          label="Titre de la tâche"
          id="task-title"
          name="title"
          value={form.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="Ex. Configurer la base de données"
          required
        />

        <Textarea
          label="Description"
          id="task-description"
          name="description"
          rows={3}
          value={form.description}
          onChange={handleChange}
          placeholder="Détails, critères d'acceptation…"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Priorité"
            id="task-priority"
            name="priority"
            value={form.priority}
            onChange={handleChange}
            options={TASK_PRIORITIES}
          />
          <Select
            label="Statut"
            id="task-status"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={TASK_STATUSES}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Date d'échéance"
            id="task-due-date"
            name="dueDate"
            type="date"
            value={form.dueDate}
            onChange={handleChange}
          />
          <Select
            label="Assigné à"
            id="task-assignee"
            name="assignedTo"
            value={form.assignedTo}
            onChange={handleChange}
            options={[
              { value: "", label: "Non assigné" },
              ...members.map((member) => ({ value: String(member.id), label: member.name })),
            ]}
          />
        </div>
      </form>
    </Modal>
  );
}
