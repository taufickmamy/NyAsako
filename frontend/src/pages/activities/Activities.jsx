import { useCallback, useEffect, useMemo, useState } from "react";
import ActivityList from "../../components/activities/ActivityList";
import Button from "../../components/common/Button";
import Icon from "../../components/common/Icon";
import { Select } from "../../components/common/Input";
import PageHeader from "../../components/common/PageHeader";
import SearchInput from "../../components/common/SearchInput";
import StatCard from "../../components/common/StatCard";
import { SectionLoader } from "../../components/common/Loader";
import { getAllActivities } from "../../services/activityService";
import { getErrorMessage } from "../../utils/errors";

const CATEGORY_OPTIONS = [
  { value: "all", label: "Toutes les actions" },
  { value: "project", label: "Projets" },
  { value: "task", label: "Tâches" },
  { value: "document", label: "Documents" },
  { value: "other", label: "Autres" },
];

function categoryOf(activity) {
  const text = String(activity?.action || "").toLowerCase();
  if (text.includes("document") || text.includes("fichier")) return "document";
  if (text.includes("tâche") || text.includes("tache")) return "task";
  if (text.includes("projet")) return "project";
  return "other";
}

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllActivities();
      setActivities(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return activities.filter((activity) => {
      if (category !== "all" && categoryOf(activity) !== category) return false;
      if (!term) return true;
      return (
        String(activity.user_name || "").toLowerCase().includes(term) ||
        String(activity.action || "").toLowerCase().includes(term) ||
        String(activity.project_name || "").toLowerCase().includes(term)
      );
    });
  }, [activities, query, category]);

  const stats = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = activities.filter(
      (activity) => new Date(activity.created_at).getTime() >= weekAgo
    ).length;
    const users = new Set(activities.map((activity) => activity.user_name).filter(Boolean)).size;
    return { total: activities.length, recent, users };
  }, [activities]);

  const hasFilters = Boolean(query) || category !== "all";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activités"
        description="L'historique complet des actions réalisées dans votre espace de travail."
        actions={
          <Button
            variant="outline"
            onClick={load}
            icon={<Icon name="refresh" className="h-4 w-4" />}
            loading={loading}
          >
            Actualiser
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Activités enregistrées" value={stats.total} icon="activity" tone="brand" />
        <StatCard label="Cette semaine" value={stats.recent} icon="clock" tone="emerald" />
        <StatCard label="Membres actifs" value={stats.users} icon="users" tone="slate" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Rechercher une action, un membre…"
          className="w-full max-w-sm"
        />
        <Select
          aria-label="Filtrer par type d'action"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          options={CATEGORY_OPTIONS}
          className="min-w-[11rem]"
        />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {filtered.length} activité{filtered.length > 1 ? "s" : ""}
        </p>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setCategory("all");
            }}
            icon={<Icon name="close" className="h-4 w-4" />}
          >
            Réinitialiser
          </Button>
        )}
      </div>

      {loading && <SectionLoader label="Chargement des activités…" />}

      {!loading && error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300"
        >
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={load} icon={<Icon name="refresh" className="h-4 w-4" />}>
            Réessayer
          </Button>
        </div>
      )}

      {!loading && !error && (
        <ActivityList
          activities={filtered}
          showProject
          emptyTitle={activities.length === 0 ? "Aucune activité" : "Aucun résultat"}
          emptyDescription={
            activities.length === 0
              ? "Les créations, modifications et changements de statut apparaîtront ici."
              : "Essayez un autre mot-clé ou un autre type d'action."
          }
        />
      )}
    </div>
  );
}
