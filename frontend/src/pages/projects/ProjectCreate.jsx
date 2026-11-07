import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import ProjectForm from "../../components/projects/ProjectForm";
import { createProject } from "../../services/projectService";
import { notify } from "../../utils/notifications";

export default function ProjectCreate() {
  const navigate = useNavigate();

  async function handleSubmit(payload) {
    const project = await createProject(payload);
    notify.success("Projet créé avec succès.");
    navigate(`/projects/${project.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        backTo="/projects"
        backLabel="Retour aux projets"
        title="Créer un projet"
        description="Donnez un nom clair à votre projet et décrivez son objectif."
      />

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <ProjectForm
          submitLabel="Créer le projet"
          onSubmit={handleSubmit}
          onCancel={() => navigate("/projects")}
        />
      </div>
    </div>
  );
}
