import { useState } from "react";
import Button from "../common/Button";
import Icon from "../common/Icon";
import { Select } from "../common/Input";
import Modal from "../common/Modal";
import { getErrorMessage } from "../../utils/errors";

/** Fenêtre d'ajout d'un document à un projet. */
export default function DocumentUploadModal({
  projects = [],
  defaultProjectId = "",
  onUpload,
  onClose,
}) {
  const [projectId, setProjectId] = useState(String(defaultProjectId || projects[0]?.id || ""));
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!projectId) {
      setError("Sélectionnez un projet.");
      return;
    }
    if (!file) {
      setError("Sélectionnez un fichier à envoyer.");
      return;
    }

    setLoading(true);
    try {
      await onUpload(Number(projectId), file);
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <Modal
      title="Ajouter un document"
      description="Le fichier sera attaché au projet sélectionné."
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" form="document-form" loading={loading} icon={<Icon name="upload" className="h-4 w-4" />}>
            Envoyer
          </Button>
        </>
      }
    >
      <form id="document-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
        )}

        <Select
          label="Projet"
          id="document-project"
          value={projectId}
          onChange={(event) => setProjectId(event.target.value)}
          options={projects.map((project) => ({ value: String(project.id), label: project.title }))}
          required
        />

        <div>
          <label htmlFor="document-file" className="block text-sm font-medium text-slate-800 dark:text-slate-200">
            Fichier
          </label>
          <label
            htmlFor="document-file"
            className="mt-1.5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-brand-400 hover:bg-brand-50/40 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-brand-500/60"
          >
            <Icon name="upload" className="h-7 w-7 text-slate-400" />
            <span className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              {file ? file.name : "Cliquez pour choisir un fichier"}
            </span>
            <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              PDF, images, Word — 10 Mo maximum
            </span>
            <input
              id="document-file"
              type="file"
              className="sr-only"
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
          </label>
        </div>
      </form>
    </Modal>
  );
}
