import Loader from "./Loader";

const VARIANTS = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 focus-visible:ring-brand-400 shadow-sm",
  secondary:
    "bg-slate-100 text-slate-800 hover:bg-slate-200 focus-visible:ring-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
  outline:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-brand-400 dark:border-slate-700 dark:bg-transparent dark:text-slate-200 dark:hover:bg-slate-800",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-400 shadow-sm",
  ghost:
    "text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400 dark:text-slate-300 dark:hover:bg-slate-800",
  subtle:
    "bg-brand-50 text-brand-700 hover:bg-brand-100 focus-visible:ring-brand-400 dark:bg-brand-500/15 dark:text-brand-300 dark:hover:bg-brand-500/25",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2.5 text-sm gap-2",
  lg: "px-5 py-3 text-sm gap-2",
};

/**
 * Bouton réutilisable (peut aussi être rendu comme lien via `as`).
 * Exemple : <Button as={Link} to="/projects">Projets</Button>
 */
export default function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  loading = false,
  icon = null,
  iconRight = null,
  className = "",
  children,
  disabled,
  ...props
}) {
  const isButton = Component === "button";
  const isDisabled = isButton ? disabled || loading : undefined;

  return (
    <Component
      className={`inline-flex items-center justify-center rounded-lg font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-950 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader size="sm" /> : icon}
      {children}
      {!loading && iconRight}
    </Component>
  );
}
