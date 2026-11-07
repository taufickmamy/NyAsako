import Avatar from "../common/Avatar";
import Dropdown from "../common/Dropdown";
import Icon from "../common/Icon";
import { PriorityBadge } from "../common/Badge";
import { formatDate, isTaskOverdue } from "../../utils/dates";

/** Carte d'une tâche affichée dans le Kanban. */
export default function TaskCard({
  task,
  showProject = false,
  canManage = false,
  onOpen,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  draggable = true,
}) {
  const overdue = isTaskOverdue(task);

  const actions = [
    { label: "Ouvrir la tâche", icon: "eye", onClick: () => onOpen?.(task) },
    ...(canManage
      ? [
          { label: "Modifier", icon: "edit", onClick: () => onEdit?.(task) },
          { separator: true },
          { label: "Supprimer", icon: "trash", danger: true, onClick: () => onDelete?.(task) },
        ]
      : []),
  ];

  return (
    <article
      draggable={draggable}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(task.id));
        onDragStart?.(task);
      }}
      onDragEnd={() => onDragEnd?.(task)}
      className="group cursor-grab rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md active:cursor-grabbing dark:bg-slate-800 dark:ring-slate-700"
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => onOpen?.(task)}
          className="min-w-0 flex-1 text-left"
        >
          <h3 className="truncate font-semibold text-slate-900 dark:text-white">{task.title}</h3>
        </button>
        <Dropdown
          trigger={<Icon name="more" className="h-4 w-4" />}
          triggerClassName="rounded-lg p-1 text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100 focus:opacity-100 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          items={actions}
          label={`Actions pour ${task.title}`}
        />
      </div>

      {showProject && task.project_title && (
        <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-brand-600 dark:text-brand-400">
          <Icon name="folder" className="h-3 w-3" />
          {task.project_title}
        </p>
      )}

      {task.description && (
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {task.description}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <PriorityBadge priority={task.priority} />
        {overdue && (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-300">
            <Icon name="alert" className="h-3 w-3" />
            En retard
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
        <span className="flex min-w-0 items-center gap-1.5">
          {task.assigned_to_name ? (
            <>
              <Avatar name={task.assigned_to_name} size="xs" />
              <span className="truncate">{task.assigned_to_name}</span>
            </>
          ) : (
            <>
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-slate-300 dark:border-slate-600">
                <Icon name="user" className="h-3 w-3" />
              </span>
              <span className="italic">Non assigné</span>
            </>
          )}
        </span>

        {task.due_date && (
          <span
            className={`flex shrink-0 items-center gap-1 ${
              overdue ? "font-semibold text-red-600 dark:text-red-400" : ""
            }`}
          >
            <Icon name="calendar" className="h-3 w-3" />
            {formatDate(task.due_date)}
          </span>
        )}
      </div>
    </article>
  );
}
