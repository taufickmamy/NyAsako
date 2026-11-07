import { Link } from "react-router-dom";
import Icon from "./Icon";

const TONES = {
  brand: {
    wrapper: "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400",
    value: "text-brand-900 dark:text-white",
  },
  amber: {
    wrapper: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    value: "text-amber-700 dark:text-amber-300",
  },
  emerald: {
    wrapper: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    value: "text-emerald-700 dark:text-emerald-300",
  },
  red: {
    wrapper: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400",
    value: "text-red-700 dark:text-red-300",
  },
  slate: {
    wrapper: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    value: "text-brand-900 dark:text-white",
  },
};

/** Carte statistique du tableau de bord. */
export default function StatCard({ label, value, icon, tone = "brand", hint, to }) {
  const style = TONES[tone] || TONES.brand;

  const content = (
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md dark:bg-slate-900 dark:ring-slate-800">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className={`mt-2 text-3xl font-bold tracking-tight ${style.value}`}>{value}</p>
        {hint && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
      </div>
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.wrapper}`}>
        <Icon name={icon} className="h-5 w-5" />
      </span>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950">
        {content}
      </Link>
    );
  }

  return content;
}
