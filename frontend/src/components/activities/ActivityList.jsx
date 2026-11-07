import Avatar from "../common/Avatar";
import EmptyState from "../common/EmptyState";
import Icon from "../common/Icon";
import { relativeTime } from "../../utils/dates";

/** Détermine l'icône et la couleur selon le type d'action. */
export function activityMeta(action = "") {
  const text = String(action).toLowerCase();
  if (text.includes("document") || text.includes("fichier")) {
    return { icon: "file", className: "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400" };
  }
  if (text.includes("tâche") || text.includes("tache")) {
    return { icon: "tasks", className: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400" };
  }
  if (text.includes("projet")) {
    return { icon: "folder", className: "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400" };
  }
  return { icon: "activity", className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" };
}

/** Liste d'activités (widget, page globale ou détail projet). */
export default function ActivityList({
  activities = [],
  showProject = false,
  compact = false,
  emptyTitle = "Aucune activité",
  emptyDescription = "Les actions de l'équipe apparaîtront ici.",
}) {
  if (activities.length === 0) {
    return <EmptyState icon="activity" title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <ul className={compact ? "space-y-3" : "space-y-2"}>
      {activities.map((activity) => {
        const meta = activityMeta(activity.action);
        return (
          <li
            key={activity.id}
            className={`flex items-start gap-3 rounded-xl ${
              compact
                ? "border-b border-slate-100 pb-3 last:border-0 last:pb-0 dark:border-slate-800"
                : "bg-white p-3.5 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
            }`}
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.className}`}>
              <Icon name={meta.icon} className="h-4 w-4" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug text-slate-700 dark:text-slate-200">
                <span className="font-semibold text-brand-900 dark:text-white">
                  {activity.user_name || "Utilisateur"}
                </span>{" "}
                {activity.action}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-400">
                <span>{relativeTime(activity.created_at)}</span>
                {showProject && activity.project_name && (
                  <span className="inline-flex items-center gap-1">
                    · <Icon name="folder" className="h-3 w-3" />
                    {activity.project_name}
                  </span>
                )}
              </p>
            </div>

            {!compact && (
              <Avatar name={activity.user_name} size="xs" className="hidden sm:inline-flex" />
            )}
          </li>
        );
      })}
    </ul>
  );
}
