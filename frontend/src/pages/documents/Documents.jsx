import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../components/common/Button";
import Icon from "../../components/common/Icon";
import { Select } from "../../components/common/Input";
import PageHeader from "../../components/common/PageHeader";
import SearchInput from "../../components/common/SearchInput";
import StatCard from "../../components/common/StatCard";
import { SectionLoader } from "../../components/common/Loader";
import DocumentList from "../../components/documents/DocumentList";
import DocumentUploadModal from "../../components/documents/DocumentUploadModal";
import { useAuth } from "../../context/AuthContext";
import {
  deleteDocument,
  getAllDocuments,
  uploadDocument,
} from "../../services/documentService";
import { getProjects } from "../../services/projectService";
import { getErrorMessage } from "../../utils/errors";
import { notify } from "../../utils/notifications";
import { canManageTasks } from "../../utils/roles";

export default function Documents() {
  const { user } = useAuth();
  const canManage = canManageTasks(user);

  const [documents, setDocuments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [uploadOpen, setUploadOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const [documentsResult, projectsResult] = await Promise.allSettled([
      getAllDocuments(),
      getProjects(),
    ]);

    if (documentsResult.status === "fulfilled") setDocuments(documentsResult.value);
    else setError(getErrorMessage(documentsResult.reason));

    if (projectsResult.status === "fulfilled") setProjects(projectsResult.value);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return documents.filter((document) => {
      if (
        projectFilter !== "all" &&
        String(document.project_title || "") !== projectFilter
      ) {
        return false;
      }
      if (!term) return true;
      return (
        String(document.filename || "").toLowerCase().includes(term) ||
        String(document.project_title || "").toLowerCase().includes(term) ||
        String(document.uploader_name || "").toLowerCase().includes(term)
      );
    });
  }, [documents, query, projectFilter]);

  const stats = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = documents.filter(
      (document) => new Date(document.created_at).getTime() >= weekAgo
    ).length;
    const coveredProjects = new Set(
      documents.map((document) => document.project_title).filter(Boolean)
    ).size;

    return { total: documents.length, recent, coveredProjects };
  }, [documents]);

  async function handleUpload(projectId, file) {
    const document = await uploadDocument(projectId, file);
    const project = projects.find((item) => String(item.id) === String(projectId));
    setDocuments((previous) => [
      { ...document, project_id: document.project_id || projectId, project_title: document.project_title || project?.title },
      ...previous,
    ]);
    setUploadOpen(false);
    notify.success("Document ajouté avec succès.");
  }

  async function handleDelete(document) {
    try {
      await deleteDocument(document.project_id, document.id);
      setDocuments((previous) =>
        previous.filter((item) => String(item.id) !== String(document.id))
      );
      notify.success("Document supprimé.");
    } catch {
      // Erreur déjà signalée par l'intercepteur Axios.
    }
  }

  const projectOptions = useMemo(
    () => [
      { value: "all", label: "Tous les projets" },
      ...Array.from(
        new Set(documents.map((document) => document.project_title).filter(Boolean))
      )
        .sort((a, b) => a.localeCompare(b, "fr"))
        .map((title) => ({ value: title, label: title })),
    ],
    [documents]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Retrouvez tous les fichiers partagés par votre équipe, projet par projet."
        actions={
          <Button
            onClick={() => setUploadOpen(true)}
            icon={<Icon name="upload" className="h-4 w-4" />}
            disabled={projects.length === 0}
          >
            Ajouter un document
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Documents" value={stats.total} icon="file" tone="brand" />
        <StatCard label="Projets concernés" value={stats.coveredProjects} icon="folder" tone="slate" />
        <StatCard label="Ajoutés cette semaine" value={stats.recent} icon="clock" tone="emerald" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Rechercher un document…"
          className="w-full max-w-sm"
        />
        <Select
          aria-label="Filtrer par projet"
          value={projectFilter}
          onChange={(event) => setProjectFilter(event.target.value)}
          options={projectOptions}
          className="min-w-[11rem]"
        />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {filtered.length} document{filtered.length > 1 ? "s" : ""}
        </p>
      </div>

      {loading && <SectionLoader label="Chargement des documents…" />}

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

      {!loading && !error && (
        <DocumentList
          documents={filtered}
          showProject
          canDelete={canManage}
          onDelete={handleDelete}
          emptyTitle={
            documents.length === 0 ? "Aucun document" : "Aucun document ne correspond"
          }
          emptyDescription={
            documents.length === 0
              ? "Ajoutez un cahier des charges, une maquette ou un compte rendu pour le partager."
              : "Essayez un autre mot-clé ou un autre projet."
          }
          action={
            documents.length === 0 ? (
              <Button
                onClick={() => setUploadOpen(true)}
                disabled={projects.length === 0}
                icon={<Icon name="upload" className="h-4 w-4" />}
              >
                Ajouter un document
              </Button>
            ) : query || projectFilter !== "all" ? (
              <Button
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setProjectFilter("all");
                }}
              >
                Réinitialiser les filtres
              </Button>
            ) : null
          }
        />
      )}

      {uploadOpen && (
        <DocumentUploadModal
          projects={projects}
          onUpload={handleUpload}
          onClose={() => setUploadOpen(false)}
        />
      )}
    </div>
  );
}
