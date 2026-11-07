import { useState } from "react";
import Avatar from "../common/Avatar";
import Badge from "../common/Badge";
import Button from "../common/Button";
import ConfirmDialog from "../common/ConfirmDialog";
import EmptyState from "../common/EmptyState";
import Icon from "../common/Icon";
import { formatDate } from "../../utils/dates";
import { getFileUrl } from "../../services/documentService";

function fileExtension(filename) {
  const parts = String(filename || "").split(".");
  return parts.length > 1 ? parts.pop().toUpperCase() : "FICHIER";
}

/** Liste de documents réutilisable (projet ou vue globale). */
export default function DocumentList({
  documents = [],
  showProject = false,
  canDelete = false,
  onDelete,
  emptyTitle = "Aucun document",
  emptyDescription = "Ajoutez un fichier pour le partager avec l'équipe.",
  action,
}) {
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await onDelete?.(toDelete);
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  if (documents.length === 0) {
    return (
      <EmptyState
        icon="file"
        title={emptyTitle}
        description={emptyDescription}
        action={action}
      />
    );
  }

  return (
    <>
      <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 dark:divide-slate-800 dark:bg-slate-900 dark:ring-slate-800">
        {documents.map((doc) => (
          <li
            key={doc.id}
            className="flex flex-col gap-3 p-4 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between dark:hover:bg-slate-800/40"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                <Icon name="file" className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {doc.filename}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <Avatar name={doc.uploader_name} size="xs" />
                    {doc.uploader_name || "Inconnu"}
                  </span>
                  <span>· {formatDate(doc.created_at)}</span>
                  <Badge tone="slate">{fileExtension(doc.filename)}</Badge>
                  {showProject && doc.project_title && (
                    <Badge tone="brand">{doc.project_title}</Badge>
                  )}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 pl-13 sm:pl-0">
              <Button
                as="a"
                href={getFileUrl(doc.file_path)}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                size="sm"
                icon={<Icon name="download" className="h-4 w-4" />}
              >
                Télécharger
              </Button>
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setToDelete(doc)}
                  aria-label={`Supprimer ${doc.filename}`}
                  className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  <Icon name="trash" className="h-4 w-4" />
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {toDelete && (
        <ConfirmDialog
          title="Supprimer le document"
          description={`Voulez-vous vraiment supprimer « ${toDelete.filename} » ? Cette action est irréversible.`}
          confirmLabel="Supprimer"
          onConfirm={handleDelete}
          onClose={() => setToDelete(null)}
          loading={deleting}
        />
      )}
    </>
  );
}
