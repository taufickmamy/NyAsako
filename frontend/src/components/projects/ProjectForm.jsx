import { useState } from "react";
import Button from "../common/Button";
import Input, { Textarea } from "../common/Input";
import { getErrorMessage } from "../../utils/errors";

/** Formulaire partagé de création et de modification d'un projet. */
export default function ProjectForm({
  initial,
  submitLabel = "Enregistrer",
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  }

  function validate() {
    const found = {};
    if (!form.title.trim()) found.title = "Le titre du projet est obligatoire.";
    else if (form.title.trim().length < 3) found.title = "Le titre doit contenir au moins 3 caractères.";
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
      });
    } catch (err) {
      setServerError(getErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {serverError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {serverError}
        </p>
      )}

      <Input
        label="Titre du projet"
        id="project-title"
        name="title"
        value={form.title}
        onChange={handleChange}
        error={errors.title}
        placeholder="Ex. Refonte du site client"
        required
      />

      <Textarea
        label="Description"
        id="project-description"
        name="description"
        rows={5}
        value={form.description}
        onChange={handleChange}
        placeholder="Objectifs, périmètre, livrables attendus…"
        hint="Une description claire aide l'équipe à comprendre le contexte du projet."
      />

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            Annuler
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
