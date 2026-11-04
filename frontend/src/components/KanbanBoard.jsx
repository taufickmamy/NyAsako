// src/components/KanbanBoard.jsx
import { useEffect, useState, useCallback } from "react";
import { getTasks, createTask, updateTaskStatus, updateTask, deleteTask } from "../api/tasksApi";
import TaskForm from "./TaskForm";
import Modal from "./Modal";
import { getErrorMessage } from "../utils/errors";
import { formatDate } from "../utils/dates";

const COLUMNS = [
  { key: "À faire", title: "À faire", dot: "bg-slate-400" },
  { key: "En cours", title: "En cours", dot: "bg-amber-400" },
  { key: "Terminé", title: "Terminé", dot: "bg-emerald-500" },
];

export default function KanbanBoard({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // { type: "create" | "edit" | "delete", task? }
  const [notice, setNotice] = useState("");

  const loadTasks = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const data = await getTasks(projectId);
      setTasks(data);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      if (!silent) setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  async function handleCreate(payload) {
    await createTask(projectId, payload);
    setModal(null);
    setNotice("Tâche créée avec succès.");
    await loadTasks({ silent: true });
  }

  async function handleEdit(payload) {
    await updateTask(projectId, modal.task.id, payload);
    setModal(null);
    setNotice("Tâche modifiée avec succès.");
    await loadTasks({ silent: true });
  }

  async function handleDelete() {
    setError("");
    try {
      await deleteTask(projectId, modal.task.id);
      setModal(null);
      setNotice("Tâche supprimée.");
      await loadTasks({ silent: true });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleMoveStatus(taskId, newStatus) {
    setError("");
    try {
      await updateTaskStatus(projectId, taskId, newStatus);
      await loadTasks({ silent: true });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (loading) return <p className="mt-8 text-center text-slate-500">Chargement des tâches…</p>;

  return (
    <div className="mt-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-brand-900 dark:text-white">Tableau Kanban</h2>
        <button
          type="button"
          onClick={() => setModal({ type: "create" })}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          + Nouvelle tâche
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          <p>{error}</p>
          <button type="button" onClick={() => loadTasks()} className="mt-2 font-semibold underline">
            Réessayer
          </button>
        </div>
      )}

      {notice && (
        <p className="mb-4 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          {notice}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-900">
              <div className="mb-3 flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                {col.title} ({colTasks.length})
              </div>

              <div className="space-y-3">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">{task.title}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        ["Élevée", "Haute"].includes(task.priority) ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                        task.priority === "Moyenne" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                        "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                      }`}>
                        {task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3 dark:border-slate-700">
                      <span>{task.assigned_to_name ? `👤 ${task.assigned_to_name}` : "Non assigné"}</span>
                      {task.due_date && <span>📅 {formatDate(task.due_date)}</span>}
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                      <select
                        value={task.status}
                        onChange={(e) => handleMoveStatus(task.id, e.target.value)}
                        className="rounded border border-slate-300 bg-transparent px-2 py-1 text-xs text-slate-700 dark:border-slate-600 dark:text-slate-300"
                      >
                        <option value="À faire">À faire</option>
                        <option value="En cours">En cours</option>
                        <option value="Terminé">Terminé</option>
                      </select>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setModal({ type: "edit", task })}
                          className="text-brand-600 hover:underline dark:text-brand-400"
                        >
                          Éditer
                        </button>
                        <button
                          onClick={() => setModal({ type: "delete", task })}
                          className="text-red-600 hover:underline dark:text-red-400"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-400 dark:border-slate-700">
                    Aucune tâche
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modal?.type === "create" && (
        <Modal title="Nouvelle tâche" onClose={() => setModal(null)}>
          <TaskForm submitLabel="Créer la tâche" onSubmit={handleCreate} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {modal?.type === "edit" && (
        <Modal title="Modifier la tâche" onClose={() => setModal(null)}>
          <TaskForm initial={modal.task} submitLabel="Enregistrer" onSubmit={handleEdit} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {modal?.type === "delete" && (
        <Modal title="Supprimer la tâche" onClose={() => setModal(null)}>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Voulez-vous vraiment supprimer la tâche <span className="font-semibold">« {modal.task.title} »</span> ?
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModal(null)}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Supprimer
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}