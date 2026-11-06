// src/pages/Activities.jsx
import { useEffect, useState } from "react";
import { getAllActivities } from "../api/activitiesApi";
import { getErrorMessage } from "../utils/errors";
import { formatDate } from "../utils/dates";

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getAllActivities();
        setActivities(data);
        setError("");
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredActivities = activities.filter((act) => {
    const matchesSearch =
      act.action?.toLowerCase().includes(search.toLowerCase()) ||
      act.user_name?.toLowerCase().includes(search.toLowerCase());
    
    if (filterType === "all") return matchesSearch;
    return matchesSearch && act.action?.toLowerCase().includes(filterType);
  });

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold tracking-tight text-brand-900 dark:text-white">
        Historique des activités
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Suivez l'ensemble des actions réalisées à travers tous les projets.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Rechercher une activité ou un utilisateur…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          <option value="all">Tous les types</option>
          <option value="tâche">Tâches</option>
          <option value="document">Documents</option>
          <option value="projet">Projets</option>
        </select>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-10 text-center text-slate-500">Chargement des activités…</p>
      ) : filteredActivities.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Aucune activité trouvée.
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {filteredActivities.map((act) => (
            <li key={act.id} className="flex items-start gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
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