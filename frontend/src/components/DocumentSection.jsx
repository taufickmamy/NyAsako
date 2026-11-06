import { useEffect, useState, useCallback } from "react";
import { getDocuments, uploadDocument, deleteDocument } from "../api/documentsApi";
import { getErrorMessage } from "../utils/errors";
import { formatDate } from "../utils/dates";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const FILE_ORIGIN = API_URL.replace(/\/api\/?$/, "");

function getFileUrl(filePath) {
  const normalized = String(filePath || "").replace(/\\/g, "/").replace(/^\/+/, "");
  return `${FILE_ORIGIN}/${normalized}`;
}

export default function DocumentSection({ projectId }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDocuments(projectId);
      setDocuments(data);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      await uploadDocument(projectId, file);
      setNotice("Fichier ajouté avec succès.");
      e.target.value = null; // Reset input file
      loadDocuments();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(docId) {
   try {
      await deleteDocument(projectId, docId);
      setConfirmDeleteId(null); 
      setNotice("Document supprimé avec succès.");
      loadDocuments();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="mt-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-900 dark:text-white">Documents du projet</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Cahiers des charges, maquettes, rapports…
          </p>
        </div>

        <label className="cursor-pointer rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
          {uploading ? "Téléchargement..." : "+ Ajouter un fichier"}
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
          />
        </label>
      </div>

      {notice && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          {notice}
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-6 text-center text-slate-500">Chargement des documents…</p>
      ) : documents.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Aucun document associé à ce projet pour le moment.
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-slate-100 dark:divide-slate-800">
          {documents.map((doc) => (
            <li key={doc.id} className="flex flex-col py-3 sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                  📁
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{doc.filename}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ajouté par {doc.uploader_name || "Inconnu"} le {formatDate(doc.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={getFileUrl(doc.file_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10"
                >
                  Télécharger
                </a>

                {confirmDeleteId !== doc.id ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(doc.id)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    Supprimer
                  </button>
                ) : (
                  
                  <div className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-lg dark:bg-red-950/40">
                    <span className="text-xs font-medium text-red-700 dark:text-red-300">Supprimer ?</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(doc.id)}
                      className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white hover:bg-red-700"
                    >
                      Oui
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="rounded bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300"
                    >
                      Non
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}