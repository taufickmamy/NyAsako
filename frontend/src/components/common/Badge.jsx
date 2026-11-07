const TONES = {
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  brand: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  emerald: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  red: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  violet: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
};

const SIZES = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-xs",
};

/** Étiquette colorée (statut, priorité, rôle…). */
export default function Badge({ tone = "slate", size = "sm", dot = false, children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${TONES[tone] || TONES.slate} ${SIZES[size]} ${className}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/** Étiquette de statut de tâche. */
export function StatusBadge({ status, size = "sm" }) {
  const tone =
    status === "Terminé" ? "emerald" : status === "En cours" ? "amber" : "slate";
  return (
    <Badge tone={tone} size={size} dot>
      {status || "À faire"}
    </Badge>
  );
}

/** Étiquette de priorité de tâche. */
export function PriorityBadge({ priority, size = "sm" }) {
  const tone =
    priority === "Élevée" ? "red" : priority === "Moyenne" ? "amber" : "slate";
  return (
    <Badge tone={tone} size={size}>
      {priority || "Moyenne"}
    </Badge>
  );
}

/** Étiquette de rôle. */
export function RoleBadge({ role, size = "sm" }) {
  const normalized = String(role || "").toLowerCase();
  const tone = normalized.startsWith("admin")
    ? "violet"
    : normalized.startsWith("manager")
      ? "brand"
      : "blue";
  return (
    <Badge tone={tone} size={size}>
      {role || "Développeur"}
    </Badge>
  );
}
