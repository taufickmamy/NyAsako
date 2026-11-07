import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import Icon from "../../components/common/Icon";
import PageHeader from "../../components/common/PageHeader";
import { FullPageLoader } from "../../components/common/Loader";
import ProjectForm from "../../components/projects/ProjectForm";
import { getProject, updateProject } from "../../services/projectService";
import { getErrorMessage } from "../../utils/errors";
import { notify } from "../../utils/notifications";

export default function ProjectEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  async function handleSubmit(payload) {
    const updated = await updateProject(id, payload);
    notify.success("Projet mis à jour avec succès.");
    navigate(`/projects/${updated.id}`);
  }

  if (loading) return <FullPageLoader label="Chargement du projet…" />;

  if (error) {
    return (
      <EmptyState
        icon="alert"
        title="Projet introuvable"
        description={error}
        action={
          <Button as="button" onClick={() => navigate("/projects")} icon={<Icon name="arrow-left" className="h-4 w-4" />}>
            Retour aux projets
          </Button>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        backTo={`/projects/${id}`}
        backLabel="Retour au projet"
        title="Modifier le projet"
        description="Mettez à jour le titre ou la description du projet."
      />

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <ProjectForm
          initial={project}
          submitLabel="Enregistrer les modifications"
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/projects/${id}`)}
        />
      </div>
    </div>
  );
}
