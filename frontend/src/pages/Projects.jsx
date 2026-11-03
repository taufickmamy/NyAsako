import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProjectForm from "../components/ProjectForm";
import { useAuth } from "../context/AuthContext";
import { createProject, deleteProject, getProjects, updateProject } from "../api/projectsApi";
import { getErrorMessage } from "../utils/errors";
import { roleKey } from "../utils/roles";
import { formatDate } from "../utils/dates";
import Modal from "../components/Modal";

export default function Projects() {
  const { user } = useAuth();
  const key = roleKey(user?.role);
  const base = `/${key}/projects`;
  const canManage = key === "admin" || key === "manager";

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null); // { type: "create" | "edit" | "delete", project? }
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      setProjects(await getProjects());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const closeModal = useCallback(() => {
    setModal(null);
    setDeleteError("");
  }, []);

  async function handleCreate(payload) {
    await createProject(payload);
    closeModal();
    setNotice("Projet créé avec succès.");
    await load();
  }

  async function handleUpdate(payload) {
    await updateProject(modal.project.id, payload);
    closeModal();
    setNotice("Projet modifié avec succès.");
    await load();
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteProject(modal.project.id);
      closeModal();
      setNotice("Projet supprimé.");
      await load();
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  const filtered = projects.filter((p) =>
    (p.title || "").toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-900 dark:text-white">Projets</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {canManage ? "Créez et suivez vos projets." : "Les projets de votre entreprise."}
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={() => setModal({ type: "create" })}
            className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
          >
            + Nouveau projet
          </button>
        )}
      </div>

      {notice && (
        <p role="status" className="mt-5 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          {notice}
        </p>
      )}

      <div className="mt-6">
        <label htmlFor="search" className="sr-only">Rechercher un projet</label>
        <input
          id="search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un projet…"
          className="block w-full max-w-sm rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
        />
      </div>

      {loading && <p className="mt-10 text-center text-slate-500 dark:text-slate-400">Chargement…</p>}

      {!loading && error && (
        <div role="alert" className="mt-8 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          <p>{error}</p>
          <button type="button" onClick={load} className="mt-2 font-semibold underline">
            Réessayer
          </button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {projects.length === 0 ? "Aucun projet pour le moment." : "Aucun projet ne correspond à votre recherche."}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <li
              key={p.id}
              className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/10"
            >
              <h2 className="font-semibold text-brand-900 dark:text-white">
                <Link to={`${base}/${p.id}`} className="hover:text-brand-600 dark:hover:text-brand-400">
                  {p.title}
                </Link>
              </h2>

              <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-600 dark:text-slate-400">
                {p.description || "Aucune description."}
              </p>

                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                {p.creator_name ? `Par ${p.creator_name}` : "Créateur inconnu"}
                {p.created_at && ` · ${formatDate(p.created_at)}`}
                </p>

              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-sm font-medium dark:border-slate-800">
                <Link
                  to={`${base}/${p.id}`}
                  className="rounded-lg px-2.5 py-1.5 text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10"
                >
                  Voir
                </Link>
                {canManage && (
                  <>
                    <button
                      type="button"
                      onClick={() => setModal({ type: "edit", project: p })}
                      className="rounded-lg px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => setModal({ type: "delete", project: p })}
                      className="ml-auto rounded-lg px-2.5 py-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      Supprimer
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {modal?.type === "create" && (
        <Modal title="Nouveau projet" onClose={closeModal}>
          <ProjectForm submitLabel="Créer le projet" onSubmit={handleCreate} onCancel={closeModal} />
        </Modal>
      )}

      {modal?.type === "edit" && (
        <Modal title="Modifier le projet" onClose={closeModal}>
          <ProjectForm
            initial={modal.project}
            submitLabel="Enregistrer"
            onSubmit={handleUpdate}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {modal?.type === "delete" && (
        <Modal title="Supprimer le projet" onClose={closeModal}>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Voulez-vous vraiment supprimer <span className="font-semibold">« {modal.project.title} »</span> ?
            Cette action est irréversible.
          </p>
          {deleteError && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
              {deleteError}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-900"
            >
              {deleting ? "Suppression…" : "Supprimer"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}