import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Avatar from "../../components/common/Avatar";
import Badge, { PriorityBadge, StatusBadge } from "../../components/common/Badge";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import Icon from "../../components/common/Icon";
import { Select, Textarea } from "../../components/common/Input";
import { FullPageLoader, SectionLoader } from "../../components/common/Loader";
import PageHeader from "../../components/common/PageHeader";
import TaskFormModal from "../../components/tasks/TaskFormModal";
import { useAuth } from "../../context/AuthContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { getTask, deleteTask, updateTask, updateTaskStatus } from "../../services/taskService";
import {
  createComment,
  deleteComment,
  getTaskComments,
} from "../../services/commentService";
import { TASK_STATUSES } from "../../utils/constants";
import { formatDate, formatDateTime, isTaskOverdue, relativeTime } from "../../utils/dates";
import { getErrorMessage } from "../../utils/errors";
import { notify } from "../../utils/notifications";
import { canManageTasks } from "../../utils/roles";

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { members } = useWorkspace();
  const canManage = canManageTasks(user);

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentsError, setCommentsError] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [deletingComment, setDeletingComment] = useState(false);

  const loadTask = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getTask(id);
      setTask(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadComments = useCallback(async () => {
    setCommentsLoading(true);
    setCommentsError("");
    try {
      const data = await getTaskComments(id);
      setComments(data);
    } catch (err) {
      setCommentsError(getErrorMessage(err));
    } finally {
      setCommentsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTask();
    loadComments();
  }, [loadTask, loadComments]);

  async function handleStatusChange(event) {
    const status = event.target.value;
    const previousStatus = task.status;
    setTask((current) => ({ ...current, status }));

    try {
      const updated = await updateTaskStatus(task.project_id, task.id, status);
      setTask((current) => ({ ...current, ...updated }));
      notify.success(`Statut mis à jour : « ${status} ».`);
    } catch {
      setTask((current) => ({ ...current, status: previousStatus }));
    }
  }

  async function handleUpdate(payload) {
    const updated = await updateTask(task.project_id, task.id, payload);
    setTask((current) => ({ ...current, ...updated }));
    setEditOpen(false);
    notify.success("Tâche mise à jour avec succès.");
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteTask(task.project_id, task.id);
      notify.success("Tâche supprimée.");
      navigate(task.project_id ? `/projects/${task.project_id}` : "/tasks");
    } catch {
      setDeleting(false);
    }
  }

  async function handlePostComment(event) {
    event.preventDefault();
    const value = content.trim();
    if (!value) return;

    setPosting(true);
    try {
      const comment = await createComment(task.id, value);
      setComments((previous) => [...previous, comment]);
      setContent("");
      notify.success("Commentaire ajouté.");
    } catch {
      // Erreur déjà signalée par l'intercepteur Axios.
    } finally {
      setPosting(false);
    }
  }

  async function handleDeleteComment() {
    if (!commentToDelete) return;
    setDeletingComment(true);
    try {
      await deleteComment(task.id, commentToDelete.id);
      setComments((previous) =>
        previous.filter((comment) => String(comment.id) !== String(commentToDelete.id))
      );
      setCommentToDelete(null);
      notify.success("Commentaire supprimé.");
    } catch {
      // Erreur déjà signalée par l'intercepteur Axios.
    } finally {
      setDeletingComment(false);
    }
  }

  if (loading) return <FullPageLoader label="Chargement de la tâche…" />;

  if (error) {
    return (
      <EmptyState
        icon="alert"
        title="Tâche introuvable"
        description={error}
        action={
          <Button as={Link} to="/tasks" icon={<Icon name="arrow-left" className="h-4 w-4" />}>
            Retour aux tâches
          </Button>
        }
      />
    );
  }

  const isOwner = String(task.assigned_to) === String(user?.id);
  const canChangeStatus = canManage || isOwner;
  const overdue = isTaskOverdue(task);

  return (
    <div className="space-y-6">
      <PageHeader
        backTo={task.project_id ? `/projects/${task.project_id}` : "/tasks"}
        backLabel={task.project_id ? "Retour au projet" : "Retour aux tâches"}
        eyebrow={task.project_title || "Tâche"}
        title={task.title}
        actions={
          <>
            {canManage && (
              <Button
                variant="outline"
                onClick={() => setEditOpen(true)}
                icon={<Icon name="edit" className="h-4 w-4" />}
              >
                Modifier
              </Button>
            )}
            {canManage && (
              <Button
                variant="ghost"
                onClick={() => setDeleteOpen(true)}
                className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                icon={<Icon name="trash" className="h-4 w-4" />}
              >
                Supprimer
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={task.status} size="md" />
              <PriorityBadge priority={task.priority} size="md" />
              {overdue && <Badge tone="red">En retard</Badge>}
            </div>

            <h2 className="mt-4 text-sm font-semibold text-brand-900 dark:text-white">Description</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {task.description || "Aucune description fournie pour cette tâche."}
            </p>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-brand-900 dark:text-white">
                Commentaires
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {comments.length}
                </span>
              </h2>
            </div>

            <form onSubmit={handlePostComment} className="mt-4 space-y-2">
              <Textarea
                id="comment-content"
                rows={3}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Écrire un commentaire…"
                aria-label="Nouveau commentaire"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  loading={posting}
                  disabled={!content.trim()}
                  icon={<Icon name="arrow-right" className="h-4 w-4" />}
                >
                  Publier
                </Button>
              </div>
            </form>

            <div className="mt-4">
              {commentsLoading && <SectionLoader label="Chargement des commentaires…" />}

              {!commentsLoading && commentsError && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                  <span>{commentsError}</span>
                  <Button variant="ghost" size="sm" onClick={loadComments}>
                    Réessayer
                  </Button>
                </div>
              )}

              {!commentsLoading && !commentsError && comments.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400 dark:border-slate-700">
                  Aucun commentaire. Soyez le premier à réagir.
                </p>
              )}

              {!commentsLoading && !commentsError && comments.length > 0 && (
                <ul className="space-y-4">
                  {comments.map((comment) => {
                    const canDeleteComment =
                      canManage || String(comment.user_id) === String(user?.id);
                    return (
                      <li key={comment.id} className="flex items-start gap-3">
                        <Avatar name={comment.user_name} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-brand-900 dark:text-white">
                              {comment.user_name || "Utilisateur"}
                            </span>
                            <span className="text-xs text-slate-400">
                              {relativeTime(comment.created_at)}
                            </span>
                            {canDeleteComment && (
                              <button
                                type="button"
                                onClick={() => setCommentToDelete(comment)}
                                className="ml-auto rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                                aria-label="Supprimer le commentaire"
                              >
                                <Icon name="trash" className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="mt-1 whitespace-pre-line rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm leading-relaxed text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                            {comment.content}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <h2 className="text-base font-bold text-brand-900 dark:text-white">Détails</h2>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Statut</p>
                {canChangeStatus ? (
                  <Select
                    aria-label="Changer le statut"
                    value={task.status}
                    onChange={handleStatusChange}
                    options={TASK_STATUSES}
                    className="mt-1.5"
                  />
                ) : (
                  <div className="mt-1.5">
                    <StatusBadge status={task.status} />
                  </div>
                )}
                {!canChangeStatus && (
                  <p className="mt-1.5 text-xs text-slate-400">
                    Seul le responsable ou un manager peut changer le statut.
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Priorité</p>
                <div className="mt-1.5">
                  <PriorityBadge priority={task.priority} />
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Assigné à</p>
                <div className="mt-1.5 flex items-center gap-2">
                  {task.assigned_to_name ? (
                    <>
                      <Avatar name={task.assigned_to_name} size="xs" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {task.assigned_to_name}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm italic text-slate-400">Non assigné</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Échéance</p>
                <p
                  className={`mt-1.5 inline-flex items-center gap-1.5 text-sm ${
                    overdue ? "font-semibold text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <Icon name="calendar" className="h-4 w-4" />
                  {task.due_date ? formatDate(task.due_date) : "Aucune échéance"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Projet</p>
                {task.project_id ? (
                  <Link
                    to={`/projects/${task.project_id}`}
                    className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
                  >
                    <Icon name="folder" className="h-4 w-4" />
                    {task.project_title || "Voir le projet"}
                  </Link>
                ) : (
                  <p className="mt-1.5 text-sm italic text-slate-400">Aucun projet</p>
                )}
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Créée le</p>
                <p className="mt-1.5 text-sm text-slate-700 dark:text-slate-200">
                  {formatDateTime(task.created_at) || "—"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-brand-50 p-5 dark:bg-brand-500/10">
            <h2 className="text-sm font-bold text-brand-900 dark:text-white">Besoin d'aide ?</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-brand-900/70 dark:text-brand-100/80">
              Les managers peuvent réassigner cette tâche et ajuster sa priorité depuis la page du projet.
            </p>
            <Button
              as={Link}
              to="/team"
              variant="subtle"
              size="sm"
              className="mt-3"
              icon={<Icon name="users" className="h-4 w-4" />}
            >
              Voir l'équipe
            </Button>
          </section>
        </div>
      </div>

      {editOpen && (
        <TaskFormModal
          initial={task}
          members={members}
          title="Modifier la tâche"
          submitLabel="Enregistrer"
          onSubmit={handleUpdate}
          onClose={() => setEditOpen(false)}
        />
      )}

      {deleteOpen && (
        <ConfirmDialog
          title="Supprimer la tâche"
          description={`Voulez-vous vraiment supprimer « ${task.title} » ? Cette action est irréversible.`}
          confirmLabel="Supprimer"
          onConfirm={handleDelete}
          onClose={() => setDeleteOpen(false)}
          loading={deleting}
        />
      )}

      {commentToDelete && (
        <ConfirmDialog
          title="Supprimer le commentaire"
          description="Voulez-vous vraiment supprimer ce commentaire ? Cette action est irréversible."
          confirmLabel="Supprimer"
          onConfirm={handleDeleteComment}
          onClose={() => setCommentToDelete(null)}
          loading={deletingComment}
        />
      )}
    </div>
  );
}
