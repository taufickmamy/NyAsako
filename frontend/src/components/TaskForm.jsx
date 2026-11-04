// src/components/TaskForm.jsx
import { useState } from "react";
import FormField from "./FormField";
import { getErrorMessage } from "../utils/errors";

const labelClass = "block text-sm font-medium text-slate-800 dark:text-slate-200";
const fieldClass =
  "mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500";

export default function TaskForm({ initial, submitLabel, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    priority: initial?.priority ?? "Moyenne",
    status: initial?.status ?? "À faire",
    due_date: initial?.due_date ? initial.due_date.split("T")[0] : "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Le titre de la tâche est obligatoire.";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
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
        dueDate: form.due_date || null,
      });
    } catch (err) {
      setServerError(getErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {serverError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {serverError}
        </p>
      )}

      <FormField
        label="Titre de la tâche"
        id="title"
        type="text"
        placeholder="Ex. Configurer la base de données"
        value={form.title}
        onChange={handleChange}
        error={errors.title}
      />

      <div>
        <label htmlFor="description" className={labelClass}>Description</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Détails de la tâche…"
          value={form.description}
          onChange={handleChange}
          className={fieldClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="priority" className={labelClass}>Priorité</label>
          <select
            id="priority"
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className={fieldClass}
          >
            <option value="Faible">Faible</option>
            <option value="Moyenne">Moyenne</option>
            <option value="Élevée">Élevée</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className={labelClass}>Statut</label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
            className={fieldClass}
          >
            <option value="À faire">À faire</option>
            <option value="En cours">En cours</option>
            <option value="Terminé">Terminé</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="due_date" className={labelClass}>Date d'échéance</label>
        <input
          id="due_date"
          name="due_date"
          type="date"
          value={form.due_date}
          onChange={handleChange}
          className={fieldClass}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {loading ? "Enregistrement…" : submitLabel}
        </button>
      </div>
    </form>
  );
}