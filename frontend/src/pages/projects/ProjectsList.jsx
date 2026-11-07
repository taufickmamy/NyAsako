import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import Icon from "../../components/common/Icon";
import PageHeader from "../../components/common/PageHeader";
import SearchInput from "../../components/common/SearchInput";
import { SectionLoader } from "../../components/common/Loader";
import ProjectCard from "../../components/projects/ProjectCard";
import { useAuth } from "../../context/AuthContext";
import { deleteProject, getProjects } from "../../services/projectService";
import { getAllTasks } from "../../services/taskService";
import { getErrorMessage } from "../../utils/errors";
import { notify } from "../../utils/notifications";
import { canManageProjects } from "../../utils/roles";

export default function ProjectsList() {
  const { user } = useAuth();
  const canManage = canManageProjects(user);
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const [projectsResult, tasksResult] = await Promise.allSettled([
      getProjects(),
      getAllTasks(),
    ]);

    if (projectsResult.status === "fulfilled") setProjects(projectsResult.value);
    else setError(getErrorMessage(projectsResult.reason));

    if (tasksResult.status === "fulfilled") setTasks(tasksResult.value);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function updateQuery(value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("q", value);
    else next.delete("q");
    setSearchParams(next, { replace: true });
  }

  const tasksByProject = useMemo(() => {
    const map = new Map();
    tasks.forEach((task) => {
      const key = String(task.project_id);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(task);
    });
    return map;
  }, [tasks]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return projects;
    return projects.filter(
      (project) =>
        String(project.title || "").toLowerCase().includes(term) ||
        String(project.description || "").toLowerCase().includes(term)
    );
  }, [projects, query]);

  async function handleDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteProject(toDelete.id);
      setProjects((previous) => previous.filter((project) => project.id !== toDelete.id));
      setToDelete(null);
      notify.success("Projet supprimé avec succès.");
    } catch {
      // L'erreur est déjà notifiée par l'intercepteur Axios.
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projets"
        description={
          canManage
            ? "Créez, suivez et faites avancer les projets de votre organisation."
            : "Consultez les projets et l'avancement de votre équipe."
        }
        actions={
          canManage && (
            <Button as={Link} to="/projects/new" icon={<Icon name="plus" className="h-4 w-4" />}>
              Nouveau projet
            </Button>
          )
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          value={query}
          onChange={updateQuery}
          placeholder="Rechercher un projet…"
          className="w-full max-w-sm"
        />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {filtered.length} projet{filtered.length > 1 ? "s" : ""}
          {query && " trouvé(s)"}
        </p>
      </div>

      {loading && <SectionLoader label="Chargement des projets…" />}

      {!loading && error && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={load} icon={<Icon name="refresh" className="h-4 w-4" />}>
            Réessayer
          </Button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon="folder"
          title={projects.length === 0 ? "Aucun projet pour le moment" : "Aucun projet ne correspond"}
          description={
            projects.length === 0
              ? "Créez votre premier projet pour commencer à organiser le travail."
              : "Essayez un autre mot-clé ou réinitialisez la recherche."
          }
          action={
            projects.length === 0 && canManage ? (
              <Button as={Link} to="/projects/new" icon={<Icon name="plus" className="h-4 w-4" />}>
                Créer un projet
              </Button>
            ) : query ? (
              <Button variant="outline" onClick={() => updateQuery("")}>
                Réinitialiser la recherche
              </Button>
            ) : null
          }
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              tasks={tasksByProject.get(String(project.id)) || []}
              canManage={canManage}
              onDelete={setToDelete}
            />
          ))}
        </div>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Supprimer le projet"
          description={`Voulez-vous vraiment supprimer « ${toDelete.title} » ? Toutes ses tâches, documents et activités seront également supprimés. Cette action est irréversible.`}
          confirmLabel="Supprimer le projet"
          onConfirm={handleDelete}
          onClose={() => setToDelete(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
