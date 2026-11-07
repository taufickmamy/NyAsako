import { Link } from "react-router-dom";
import Avatar from "../common/Avatar";
import Badge from "../common/Badge";
import Dropdown from "../common/Dropdown";
import Icon from "../common/Icon";
import { formatDate, isTaskOverdue } from "../../utils/dates";

/** Carte de projet avec progression calculée à partir des tâches. */
export default function ProjectCard({ project, tasks = [], canManage = false, onEdit, onDelete }) {
  const total = tasks.length;
  const done = tasks.filter((task) => task.status === "Terminé").length;
  const inProgress = tasks.filter((task) => task.status === "En cours").length;
  const overdue = tasks.filter((task) => isTaskOverdue(task)).length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

  const members = Array.from(
    new Set(tasks.map((task) => task.assigned_to_name).filter(Boolean))
  ).slice(0, 4);

  const actions = [
    { label: "Ouvrir le projet", icon: "eye", to: `/projects/${project.id}` },
    ...(canManage
      ? [
          { label: "Modifier", icon: "edit", to: `/projects/${project.id}/edit` },
          { separator: true },
          { label: "Supprimer", icon: "trash", danger: true, onClick: () => onDelete?.(project) },
        ]
      : []),
  ];

  return (
    <article className="group flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md dark:bg-slate-900 dark:ring-slate-800">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to={`/projects/${project.id}`}
            className="block truncate text-base font-bold text-brand-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
          >
            {project.title}
          </Link>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {project.creator_name ? `Créé par ${project.creator_name}` : "Créateur inconnu"}
            {project.created_at && ` · ${formatDate(project.created_at)}`}
          </p>
        </div>

        <Dropdown
          trigger={<Icon name="more" className="h-4 w-4" />}
          triggerClassName="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          items={actions}
          label={`Actions pour ${project.title}`}
        />
      </div>

      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        {project.description || "Aucune description fournie."}
      </p>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            {done}/{total} tâche{total > 1 ? "s" : ""} terminée{done > 1 ? "s" : ""}
          </span>
          <span className="font-semibold text-brand-700 dark:text-brand-300">{progress}%</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge tone="slate">{inProgress} en cours</Badge>
        {overdue > 0 && <Badge tone="red">{overdue} en retard</Badge>}
        {total === 0 && <Badge tone="slate">Aucune tâche</Badge>}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
        <div className="flex -space-x-2">
          {members.length > 0 ? (
            members.map((name) => <Avatar key={name} name={name} size="xs" ring />)
          ) : (
            <span className="text-xs italic text-slate-400">Aucun membre assigné</span>
          )}
        </div>

        <Link
          to={`/projects/${project.id}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
        >
          Ouvrir
          <Icon name="arrow-right" className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
