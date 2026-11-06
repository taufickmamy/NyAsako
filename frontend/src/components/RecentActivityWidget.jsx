// src/components/RecentActivityWidget.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllActivities } from "../api/activitiesApi";
import { formatDate } from "../utils/dates";

export default function RecentActivityWidget({ rolePath }) {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllActivities();
        setActivities(data.slice(0, 5));
      } catch {
        setActivities([]);
      }
    }
    load();
  }, []);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-brand-900 dark:text-white">Activité récente</h3>
        <Link to={`/${rolePath}/activities`} className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400">
          Voir tout →
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {activities.length === 0 ? (
          <p className="text-xs text-slate-400">Aucune activité récente.</p>
        ) : (
          activities.map((act) => (
            <div key={act.id} className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0 dark:border-slate-800">
              <span className="mt-0.5 text-xs">⚡</span>
              <div className="flex-1">
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-semibold">{act.user_name}</span> {act.action}
                </p>
                <p className="text-[10px] text-slate-400">{formatDate(act.created_at)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}