import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ActivityList from "../../components/activities/ActivityList";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import Icon from "../../components/common/Icon";
import { FullPageLoader } from "../../components/common/Loader";
import PageHeader from "../../components/common/PageHeader";
import Tabs from "../../components/common/Tabs";
import DocumentList from "../../components/documents/DocumentList";
import DocumentUploadModal from "../../components/documents/DocumentUploadModal";
import KanbanBoard from "../../components/tasks/KanbanBoard";
import TaskFormModal from "../../components/tasks/TaskFormModal";
import { useAuth } from "../../context/AuthContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  deleteProject,
  getProject,
} from "../../services/projectService";
import {
  createTask,
  deleteTask,
  getProjectTasks,
  updateTask,
  updateTaskStatus,
} from "../../services/taskService";
import { getProjectActivities } from "../../services/activityService";
import {
  deleteDocument,
  getProjectDocuments,
  uploadDocument,
} from "../../services/documentService";
import { getErrorMessage } from "../../utils/errors";
import { formatDate, isTaskOverdue } from "../../utils/dates";
import { notify } from "../../utils/notifications";
import { canManageTasks } from "../../utils/roles";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { members } = useWorkspace();
  const canManage = canManageTasks(user);

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("kanban");

  const [taskModal, setTaskModal] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deletingTask, setDeletingTask] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    const [projectResult, tasksResult, activitiesResult, documentsResult] =
      await Promise.allSettled([
        getProject(id),
        getProjectTasks(id),
        getProjectActivities(id),
        getProjectDocuments(id),
      ]);

    if (projectResult.status === "fulfilled") setProject(projectResult.value);
    else setError(getErrorMessage(projectResult.reason));

    if (tasksResult.status === "fulfilled") setTasks(tasksResult.value);
    if (activitiesResult.status === "fulfilled") setActivities(activitiesResult.value);
    if (documentsResult.status === "fulfilled") setDocuments(documentsResult.value);

    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const done = tasks.filter((task) => task.status === "Terminé").length;
    const inProgress = tasks.filter((task) => task.status === "En cours").length;
    const overdue = tasks.filter((task) => isTaskOverdue(task)).length;
    return {
      total: tasks.length,
      done,
      inProgress,
      overdue,
      progress: tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100),
    };
  }, [tasks]);

  async function handleCreateTask(payload) {
    const created = await createTask(id, payload);
    setTasks((previous) => [...previous, created]);
    setTaskModal(null);
    notify.success("Tâche créée avec succès.");
  }

  async function handleUpdateTask(payload) {
    const updated = await updateTask(id, taskModal.task.id, payload);
    setTasks((previous) =>
      previous.map((task) => (String(task.id) === String(updated.id) ? { ...task, ...updated } : task))
    );
    setTaskModal(null);
    notify.success("Tâche mise à jour avec succès.");
  }

  async function handleDeleteTask() {
    if (!taskToDelete) return;
    setDeletingTask(true);
    try {
      await deleteTask(id, taskToDelete.id);
      setTasks((previous) =>
        previous.filter((task) => String(task.id) !== String(taskToDelete.id))
      );
      setTaskToDelete(null);
      notify.success("Tâche supprimée.");
    } catch {
      // Erreur déjà signalée par l'intercepteur Axios.
    } finally {
      setDeletingTask(false);
    }
  }

  async function handleStatusChange(task, status) {
    const isOwner = String(task.assigned_to) === String(user?.id);
    if (!canManage && !isOwner) {
      notify.error("Vous ne pouvez modifier que le statut de vos propres tâches.");
      return;
    }

    const previousStatus = task.status;
    setTasks((previous) =>
      previous.map((item) =>
        String(item.id) === String(task.id) ? { ...item, status } : item
      )
    );

    try {
      await updateTaskStatus(id, task.id, status);
      notify.success(`« ${task.title} » est maintenant « ${status} ».`);
    } catch {
      setTasks((previous) =>
        previous.map((item) =>
          String(item.id) === String(task.id) ? { ...item, status: previousStatus } : item
        )
      );
    }
  }

  async function handleUpload(projectId, file) {
    const document = await uploadDocument(projectId, file);
    setDocuments((previous) => [document, ...previous]);
    setUploadOpen(false);
    notify.success("Document ajouté avec succès.");
  }

  async function handleDeleteDocument(document) {
    try {
      await deleteDocument(id, document.id);
      setDocuments((previous) =>
        previous.filter((item) => String(item.id) !== String(document.id))
      );
      notify.success("Document supprimé.");
    } catch {
      // Erreur déjà signalée par l'intercepteur Axios.
    }
  }

  async function handleDeleteProject() {
    setDeletingProject(true);
    try {
      await deleteProject(id);
      notify.success("Projet supprimé avec succès.");
      navigate("/projects");
    } catch {
      setDeletingProject(false);
    }
  }

  if (loading) return <FullPageLoader label="Chargement du projet…" />;

  if (error) {
    return (
      <EmptyState
        icon="alert"
        title="Projet introuvable"
        description={error}
        action={
          <Button as={Link} to="/projects" icon={<Icon name="arrow-left" className="h-4 w-4" />}>
            Retour aux projets
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        backTo="/projects"
        backLabel="Retour aux projets"
        eyebrow="Projet"
        title={project.title}
        description={project.description || "Aucune description fournie."}
        actions={
          <>
            {canManage && (
              <Button
                as={Link}
                to={`/projects/${id}/edit`}
                variant="outline"
                icon={<Icon name="edit" className="h-4 w-4" />}
              >
                Modifier
              </Button>
            )}
            {canManage && (
              <Button
                variant="ghost"
                onClick={() => setDeleteProjectOpen(true)}
                className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                icon={<Icon name="trash" className="h-4 w-4" />}
              >
                Supprimer
              </Button>
            )}
            {canManage && (
              <Button
                onClick={() => setTaskModal({ mode: "create" })}
                icon={<Icon name="plus" className="h-4 w-4" />}
              >
                Nouvelle tâche
              </Button>
            )}
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Badge tone="brand">Projet</Badge>
        <span>
          {project.creator_name ? `Créé par ${project.creator_name}` : "Créateur inconnu"}
          {project.created_at && ` le ${formatDate(project.created_at)}`}
        </span>
        <span>·</span>
        <span>
          {stats.done}/{stats.total} tâche(s) terminée(s)
        </span>
      </div>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-brand-900 dark:text-white">Avancement global</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {stats.inProgress} en cours · {stats.overdue} en retard
            </p>
          </div>
          <p className="text-2xl font-bold text-brand-700 dark:text-brand-300">{stats.progress}%</p>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${stats.progress}%` }}
          />
        </div>
      </section>

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { key: "kanban", label: "Kanban", icon: "kanban", count: tasks.length },
          { key: "documents", label: "Documents", icon: "file", count: documents.length },
          { key: "activities", label: "Activités", icon: "activity", count: activities.length },
        ]}
      />

      {tab === "kanban" && (
        <KanbanBoard
          tasks={tasks}
          canManage={canManage}
          canCreate={canManage}
          onCreate={() => setTaskModal({ mode: "create" })}
          onOpen={(task) => navigate(`/tasks/${task.id}`)}
          onEdit={(task) => setTaskModal({ mode: "edit", task })}
          onDelete={setTaskToDelete}
          onStatusChange={handleStatusChange}
          createLabel="Nouvelle tâche"
          emptyTitle="Aucune tâche dans ce projet"
          emptyDescription={
            canManage
              ? "Créez la première tâche pour lancer le suivi."
              : "Les managers n'ont pas encore créé de tâche."
          }
        />
      )}

      {tab === "documents" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {documents.length} document(s) partagé(s) sur ce projet.
            </p>
            <Button
              onClick={() => setUploadOpen(true)}
              icon={<Icon name="upload" className="h-4 w-4" />}
            >
              Ajouter un document
            </Button>
          </div>
          <DocumentList
            documents={documents}
            canDelete={canManage}
            onDelete={handleDeleteDocument}
            emptyTitle="Aucun document"
            emptyDescription="Ajoutez un cahier des charges, une maquette ou un compte rendu."
          />
        </div>
      )}

      {tab === "activities" && (
        <ActivityList
          activities={activities}
          emptyTitle="Aucune activité"
          emptyDescription="Les actions sur ce projet apparaîtront ici."
        />
      )}

      {taskModal && (
        <TaskFormModal
          initial={taskModal.mode === "edit" ? taskModal.task : undefined}
          members={members}
          title={taskModal.mode === "edit" ? "Modifier la tâche" : "Nouvelle tâche"}
          submitLabel={taskModal.mode === "edit" ? "Enregistrer" : "Créer la tâche"}
          onSubmit={taskModal.mode === "edit" ? handleUpdateTask : handleCreateTask}
          onClose={() => setTaskModal(null)}
        />
      )}

      {taskToDelete && (
        <ConfirmDialog
          title="Supprimer la tâche"
          description={`Voulez-vous vraiment supprimer « ${taskToDelete.title} » ? Cette action est irréversible.`}
          confirmLabel="Supprimer"
          onConfirm={handleDeleteTask}
          onClose={() => setTaskToDelete(null)}
          loading={deletingTask}
        />
      )}

      {uploadOpen && (
        <DocumentUploadModal
          projects={[project]}
          defaultProjectId={project.id}
          onUpload={handleUpload}
          onClose={() => setUploadOpen(false)}
        />
      )}

      {deleteProjectOpen && (
        <ConfirmDialog
          title="Supprimer le projet"
          description={`Voulez-vous vraiment supprimer « ${project.title} » ? Toutes ses tâches, documents et activités seront également supprimés. Cette action est irréversible.`}
          confirmLabel="Supprimer le projet"
          onConfirm={handleDeleteProject}
          onClose={() => setDeleteProjectOpen(false)}
          loading={deletingProject}
        />
      )}
    </div>
  );
}
