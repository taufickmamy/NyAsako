import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProject } from "../api/projectsApi";
import { getErrorMessage } from "../utils/errors";
import { roleKey } from "../utils/roles";
import { formatDate } from "../utils/dates";
import KanbanBoard from "../components/KanbanBoard";

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const back = `/${roleKey(user?.role)}/projects`;

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getProject(id);
        if (!cancelled) setProject(data);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="mx-auto max-w-4xl">
      <Link to={back} className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
        ← Retour aux projets
      </Link>

      {loading && <p className="mt-10 text-center text-slate-500 dark:text-slate-400">Chargement…</p>}

      {!loading && error && (
        <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}

      {!loading && !error && project && (
        <>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-brand-900 dark:text-white">
            {project.title}
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {project.creator_name ? `Créé par ${project.creator_name}` : "Créateur inconnu"}
          {project.created_at && ` le ${formatDate(project.created_at)}`}
          </p>

          <p className="mt-4 max-w-2xl leading-relaxed text-slate-600 dark:text-slate-400">
            {project.description || "Aucune description."}
          </p>

          <KanbanBoard projectId={project.id} />
        </>
      )}
    </div>
  );
}