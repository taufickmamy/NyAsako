// src/components/ActivitySection.jsx
import { useEffect, useState, useCallback } from "react";
import { getProjectActivities } from "../api/activitiesApi";
import { getErrorMessage } from "../utils/errors";
import { formatDate } from "../utils/dates";

export default function ActivitySection({ projectId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProjectActivities(projectId);
      setActivities(data);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  if (loading) {
    return <p className="mt-6 text-center text-sm text-slate-500">Chargement des activités du projet…</p>;
  }

  if (error) {
    return (
      <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
        {error}
      </p>
    );
  }

  return (
    <div className="mt-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <h2 className="text-xl font-bold text-brand-900 dark:text-white">Activités du projet</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Suivez l'historique des actions réalisées sur ce projet.
      </p>

      {activities.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Aucune activité enregistrée pour le moment.
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {activities.map((act) => (
            <li key={act.id} className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                ⚡
              </span>
              <div className="flex-1">
                <p className="text-sm text-slate-800 dark:text-slate-200">
                  <span className="font-semibold text-brand-900 dark:text-white">
                    {act.user_name || "Utilisateur"}
                  </span>{" "}
                  {act.action}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {formatDate(act.created_at)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}