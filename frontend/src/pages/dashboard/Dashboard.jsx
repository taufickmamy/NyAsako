import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ActivityList from "../../components/activities/ActivityList";
import Avatar from "../../components/common/Avatar";
import Badge, { StatusBadge } from "../../components/common/Badge";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import Icon from "../../components/common/Icon";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import { FullPageLoader } from "../../components/common/Loader";
import { useAuth } from "../../context/AuthContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { getProjects } from "../../services/projectService";
import { getAllTasks } from "../../services/taskService";
import { getRecentActivities } from "../../services/activityService";
import { getErrorMessage } from "../../utils/errors";
import { isTaskOverdue } from "../../utils/dates";
import { TASK_STATUSES, statusMeta } from "../../utils/constants";
import { canManageProjects, canManageTeam, roleLabel } from "../../utils/roles";

const todayLabel = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date());

export default function Dashboard() {
  const { user } = useAuth();
  const { members, workspace } = useWorkspace();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    const [projectsResult, tasksResult, activitiesResult] = await Promise.allSettled([
      getProjects(),
      getAllTasks(),
      getRecentActivities(5),
    ]);

    if (projectsResult.status === "fulfilled") setProjects(projectsResult.value);
    else setError(getErrorMessage(projectsResult.reason));

    if (tasksResult.status === "fulfilled") setTasks(tasksResult.value);
    if (activitiesResult.status === "fulfilled") setActivities(activitiesResult.value);

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const todo = tasks.filter((task) => task.status === "À faire").length;
    const inProgress = tasks.filter((task) => task.status === "En cours").length;
    const done = tasks.filter((task) => task.status === "Terminé").length;
    const overdue = tasks.filter(isTaskOverdue).length;
    const mine = tasks.filter((task) => String(task.assigned_to) === String(user?.id));
    return { todo, inProgress, done, overdue, mine };
  }, [tasks, user]);

  const recentProjects = useMemo(
    () =>
      projects.slice(0, 4).map((project) => {
        const projectTasks = tasks.filter(
          (task) => String(task.project_id) === String(project.id)
        );
        const done = projectTasks.filter((task) => task.status === "Terminé").length;
        return {
          ...project,
          total: projectTasks.length,
          done,
          progress: projectTasks.length === 0 ? 0 : Math.round((done / projectTasks.length) * 100),
        };
      }),
    [projects, tasks]
  );

  const distribution = useMemo(() => {
    const total = tasks.length || 1;
    return TASK_STATUSES.map((status) => {
      const count = tasks.filter((task) => task.status === status.value).length;
      return { ...status, count, percent: Math.round((count / total) * 100) };
    });
  }, [tasks]);

  if (loading) return <FullPageLoader label="Chargement de votre tableau de bord…" />;

  const firstName = String(user?.name || "").split(" ")[0] || "vous";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={todayLabel}
        title={`Bonjour ${firstName}`}
        description={`Vous êtes connecté en tant que ${roleLabel(user?.role)}. Voici l'état de votre espace de travail.`}
        actions={
          canManageProjects(user) && (
            <Button as={Link} to="/projects/new" icon={<Icon name="plus" className="h-4 w-4" />}>
              Créer un projet
            </Button>
          )
        }
      />

      {error && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={load} icon={<Icon name="refresh" className="h-4 w-4" />}>
            Réessayer
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Projets actifs" value={projects.length} icon="folder" tone="brand" to="/projects" />
        <StatCard label="Tâches à faire" value={stats.todo} icon="list" tone="slate" to="/tasks" />
        <StatCard label="Tâches en cours" value={stats.inProgress} icon="clock" tone="amber" to="/tasks" />
        <StatCard label="Tâches terminées" value={stats.done} icon="check-circle" tone="emerald" to="/tasks" />
        <StatCard
          label="Tâches en retard"
          value={stats.overdue}
          icon="alert"
          tone="red"
          hint={stats.overdue > 0 ? "À traiter en priorité" : "Aucun retard"}
          to="/tasks?due=overdue"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-brand-900 dark:text-white">Projets récents</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Avancement calculé à partir des tâches.
                </p>
              </div>
              <Link
                to="/projects"
                className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
              >
                Voir tout
              </Link>
            </div>

            <div className="mt-4">
              {recentProjects.length === 0 ? (
                <EmptyState
                  icon="folder"
                  title="Aucun projet pour le moment"
                  description="Créez votre premier projet pour démarrer."
                  action={
                    canManageProjects(user) ? (
                      <Button as={Link} to="/projects/new" size="sm" icon={<Icon name="plus" className="h-4 w-4" />}>
                        Créer un projet
                      </Button>
                    ) : null
                  }
                />
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentProjects.map((project) => (
                    <li key={project.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between gap-3">
                        <Link
                          to={`/projects/${project.id}`}
                          className="min-w-0 truncate text-sm font-semibold text-brand-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
                        >
                          {project.title}
                        </Link>
                        <span className="shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {project.done}/{project.total} · {project.progress}%
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              <h2 className="text-base font-bold text-brand-900 dark:text-white">Répartition des tâches</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Sur {tasks.length} tâche(s) au total.</p>
              <ul className="mt-4 space-y-4">
                {distribution.map((status) => (
                  <li key={status.value}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 font-medium text-slate-600 dark:text-slate-300">
                        <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                      <span className="font-semibold text-slate-500 dark:text-slate-400">
                        {status.count} · {status.percent}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full ${
                          status.value === "Terminé"
                            ? "bg-emerald-500"
                            : status.value === "En cours"
                              ? "bg-amber-400"
                              : "bg-slate-400"
                        }`}
                        style={{ width: `${status.percent}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-brand-900 dark:text-white">Mes tâches</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {stats.mine.length} tâche(s) assignée(s).
                  </p>
                </div>
                <Link to="/tasks" className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">
                  Voir
                </Link>
              </div>

              <div className="mt-4">
                {stats.mine.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-400 dark:border-slate-700">
                    Aucune tâche ne vous est assignée.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {stats.mine.slice(0, 4).map((task) => {
                      const meta = statusMeta(task.status);
                      return (
                        <li key={task.id}>
                          <Link
                            to={`/tasks/${task.id}`}
                            className="flex items-start justify-between gap-3 rounded-xl p-2 transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                                {task.title}
                              </span>
                              <span className="mt-0.5 block text-xs text-slate-400">
                                {task.project_title || "Projet"} · {meta.label}
                              </span>
                            </span>
                            <StatusBadge status={task.status} />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </section>
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <h2 className="text-base font-bold text-brand-900 dark:text-white">Raccourcis</h2>
            <div className="mt-4 space-y-2">
              {canManageProjects(user) && (
                <QuickAction to="/projects/new" icon="plus" title="Créer un projet" text="Lancer un nouveau projet" />
              )}
              <QuickAction to="/tasks" icon="tasks" title="Voir mes tâches" text="Filtrer et prioriser" />
              {canManageTeam(user) ? (
                <QuickAction to="/team?invite=1" icon="users" title="Inviter un membre" text="Agrandir l'équipe" />
              ) : (
                <QuickAction to="/documents" icon="file" title="Parcourir les documents" text="Tous les fichiers" />
              )}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-brand-900 dark:text-white">Activité récente</h2>
              <Link to="/activities" className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">
                Voir tout
              </Link>
            </div>
            <div className="mt-4">
              <ActivityList
                activities={activities}
                compact
                showProject
                emptyTitle="Aucune activité récente"
                emptyDescription="Les actions de l'équipe apparaîtront ici."
              />
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-brand-900 dark:text-white">Équipe</h2>
              <Link to="/team" className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">
                Gérer
              </Link>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex -space-x-2">
                {members.slice(0, 5).map((member) => (
                  <Avatar key={member.id} name={member.name} size="sm" ring />
                ))}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                <p className="font-semibold text-brand-900 dark:text-white">{members.length} membre(s)</p>
                <p>dans {workspace.name}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {members.slice(0, 3).map((member) => (
                <Badge key={member.id} tone="slate">
                  {member.name}
                </Badge>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ to, icon, title, text }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-brand-300 hover:bg-brand-50/40 dark:border-slate-800 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/5"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
        <Icon name={icon} className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-brand-900 dark:text-white">{title}</span>
        <span className="block text-xs text-slate-500 dark:text-slate-400">{text}</span>
      </span>
      <Icon name="chevron-right" className="ml-auto h-4 w-4 text-slate-300 dark:text-slate-600" />
    </Link>
  );
}
