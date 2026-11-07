import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Icon from "../../components/common/Icon";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import { SectionLoader } from "../../components/common/Loader";
import KanbanBoard from "../../components/tasks/KanbanBoard";
import TaskFormModal from "../../components/tasks/TaskFormModal";
import { useAuth } from "../../context/AuthContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  deleteTask,
  getAllTasks,
  updateTask,
  updateTaskStatus,
} from "../../services/taskService";
import { getErrorMessage } from "../../utils/errors";
import { isTaskOverdue } from "../../utils/dates";
import { notify } from "../../utils/notifications";
import { canManageTasks } from "../../utils/roles";

export default function MyTasks() {
  const { user } = useAuth();
  const { members } = useWorkspace();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const canManage = canManageTasks(user);

  const overdueOnly = searchParams.get("due") === "overdue";
  const scope =
    searchParams.get("scope") || (overdueOnly ? "all" : "me");

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [taskModal, setTaskModal] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllTasks();
      setTasks(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function updateParams(patch) {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value === null) next.delete(key);
      else next.set(key, value);
    });
    setSearchParams(next, { replace: true });
  }

  const visibleTasks = useMemo(() => {
    let list =
      scope === "me"
        ? tasks.filter((task) => String(task.assigned_to) === String(user?.id))
        : tasks;
    if (overdueOnly) list = list.filter((task) => isTaskOverdue(task));
    return list;
  }, [tasks, scope, overdueOnly, user]);

  const stats = useMemo(() => {
    const mine = tasks.filter((task) => String(task.assigned_to) === String(user?.id));
    return {
      mine: mine.length,
      inProgress: visibleTasks.filter((task) => task.status === "En cours").length,
      done: visibleTasks.filter((task) => task.status === "Terminé").length,
      overdue: tasks.filter((task) => isTaskOverdue(task)).length,
    };
  }, [tasks, visibleTasks, user]);

  async function handleUpdate(payload) {
    const task = taskModal.task;
    const updated = await updateTask(task.project_id, task.id, payload);
    setTasks((previous) =>
      previous.map((item) =>
        String(item.id) === String(updated.id) ? { ...item, ...updated } : item
      )
    );
    setTaskModal(null);
    notify.success("Tâche mise à jour avec succès.");
  }

  async function handleDelete() {
    if (!taskToDelete) return;
    setDeleting(true);
    try {
      await deleteTask(taskToDelete.project_id, taskToDelete.id);
      setTasks((previous) =>
        previous.filter((task) => String(task.id) !== String(taskToDelete.id))
      );
      setTaskToDelete(null);
      notify.success("Tâche supprimée.");
    } catch {
      // Erreur déjà signalée par l'intercepteur Axios.
    } finally {
      setDeleting(false);
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
      await updateTaskStatus(task.project_id, task.id, status);
      notify.success(`« ${task.title} » est maintenant « ${status} ».`);
    } catch {
      setTasks((previous) =>
        previous.map((item) =>
          String(item.id) === String(task.id) ? { ...item, status: previousStatus } : item
        )
      );
    }
  }

  const scopes = [
    { key: "me", label: "Mes tâches", icon: "user" },
    { key: "all", label: "Toutes les tâches", icon: "users" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes tâches"
        description="Suivez vos tâches, priorisez le travail et faites avancer le Kanban."
        actions={
          <Button
            as="button"
            variant={overdueOnly ? "danger" : "outline"}
            onClick={() =>
              updateParams({ due: overdueOnly ? null : "overdue" })
            }
            icon={<Icon name="alert" className="h-4 w-4" />}
          >
            En retard ({stats.overdue})
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Mes tâches" value={stats.mine} icon="user" tone="brand" />
        <StatCard label="En cours" value={stats.inProgress} icon="clock" tone="amber" />
        <StatCard label="Terminées" value={stats.done} icon="check-circle" tone="emerald" />
        <StatCard
          label="En retard"
          value={stats.overdue}
          icon="alert"
          tone="red"
          hint={overdueOnly ? "Filtre actif" : "Toutes les tâches"}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/60">
          {scopes.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => updateParams({ scope: item.key })}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                scope === item.key
                  ? "bg-white text-brand-700 shadow-sm dark:bg-slate-900 dark:text-brand-300"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Icon name={item.icon} className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {visibleTasks.length} tâche{visibleTasks.length > 1 ? "s" : ""} affichée
          {visibleTasks.length > 1 ? "s" : ""}
          {overdueOnly && " · en retard uniquement"}
        </p>
      </div>

      {loading && <SectionLoader label="Chargement des tâches…" />}

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
        <KanbanBoard
          tasks={visibleTasks}
          showProject
          canManage={canManage}
          canCreate={false}
          onOpen={(task) => navigate(`/tasks/${task.id}`)}
          onEdit={(task) => setTaskModal({ task })}
          onDelete={setTaskToDelete}
          onStatusChange={handleStatusChange}
          emptyTitle={scope === "me" ? "Aucune tâche assignée" : "Aucune tâche"}
          emptyDescription={
            scope === "me"
              ? "Aucune tâche ne vous est assignée pour le moment. Consultez toutes les tâches ou contactez votre manager."
              : "Créez des tâches depuis la page d'un projet pour démarrer le suivi."
          }
        />
      )}

      {taskModal && (
        <TaskFormModal
          initial={taskModal.task}
          members={members}
          title="Modifier la tâche"
          submitLabel="Enregistrer"
          onSubmit={handleUpdate}
          onClose={() => setTaskModal(null)}
        />
      )}

      {taskToDelete && (
        <ConfirmDialog
          title="Supprimer la tâche"
          description={`Voulez-vous vraiment supprimer « ${taskToDelete.title} » ? Cette action est irréversible.`}
          confirmLabel="Supprimer"
          onConfirm={handleDelete}
          onClose={() => setTaskToDelete(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
