const SIZES = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-9 w-9 border-[3px]",
};

/** Indicateur de chargement circulaire. */
export default function Loader({ size = "md", className = "" }) {
  return (
    <span
      role="status"
      aria-label="Chargement"
      className={`inline-block animate-spin rounded-full border-current border-r-transparent ${SIZES[size]} ${className}`}
    />
  );
}

/** Chargement pleine page (utilisé pendant les requêtes initiales). */
export function FullPageLoader({ label = "Chargement de votre espace…" }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-brand-600 dark:text-brand-400">
      <Loader size="lg" />
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

/** Bloc de chargement discret pour une section. */
export function SectionLoader({ label = "Chargement…" }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 p-10 text-slate-500 dark:border-slate-700 dark:text-slate-400">
      <Loader size="sm" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
