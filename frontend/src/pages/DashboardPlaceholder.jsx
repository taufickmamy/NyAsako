import { useAuth } from "../context/AuthContext";

export default function DashboardPlaceholder({ title }) {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight text-brand-900 dark:text-white">
        {title}
      </h1>
      <p className="mt-2">
        Bienvenue, <span className="font-semibold">{user?.name}</span>.
      </p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Rôle : {user?.role} · {user?.email}
      </p>

      <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
        Cette page est en construction.
      </div>
    </div>
  );
}