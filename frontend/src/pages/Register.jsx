import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";
import { registerRequest } from "../api/authApi";

const ROLES = [
  {
    value: "Développeur",
    label: "Développeur",
    text: "Réalise les tâches et fait avancer le Kanban.",
  },
  {
    value: "Manager",
    label: "Manager",
    text: "Crée les projets, compose les équipes et assigne les tâches.",
  },
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    role: "Developer",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => {
      navigate("/login", { state: { registered: true } });
    }, 3000);
    return () => clearTimeout(timer);
  }, [success, navigate]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Le nom est obligatoire.";
    if (!form.email.trim()) e.email = "L'adresse e-mail est obligatoire.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Adresse e-mail invalide.";
    if (!form.password) e.password = "Le mot de passe est obligatoire.";
    else if (form.password.length < 8) e.password = "Au moins 8 caractères.";
    if (form.confirm !== form.password) e.confirm = "Les mots de passe ne correspondent pas.";
    if (!ROLES.some((r) => r.value === form.role)) e.role = "Choisissez un rôle.";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    try {
      await registerRequest({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      setSuccess(true);
    } catch (err) {
      if (err.response) {
        const d = err.response.data;
        setServerError(
          d?.message || d?.error || (typeof d === "string" ? d : `Erreur ${err.response.status}`)
        );
      } else {
        setServerError("Impossible de joindre le serveur.");
      }
    } finally {
      setLoading(false);
    }
  }


  if (success) {
    return (
      <AuthLayout title="Compte créé !">
        <div role="status" className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="mt-4 text-slate-700 dark:text-slate-300">
            Votre compte a été créé avec succès.
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Redirection vers la connexion…
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            Se connecter maintenant
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Créer un compte"
      subtitle="Rejoignez NyAsako et organisez vos projets en équipe."
      footer={
        <>
          Déjà un compte ?{" "}
          <Link to="/login" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
            Se connecter
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {serverError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {serverError}
          </p>
        )}

        <FormField
          label="Nom complet"
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Votre nom"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
        />
        <FormField
          label="Adresse e-mail"
          id="email"
          type="email"
          autoComplete="email"
          placeholder="nom@entreprise.com"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />

        {/* rôle */}
        <fieldset>
          <legend className="block text-sm font-medium text-slate-800 dark:text-slate-200">
            Votre rôle
          </legend>
          <div className="mt-1.5 grid gap-3 sm:grid-cols-2">
            {ROLES.map((r) => (
              <label key={r.value} className="relative block cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value={r.value}
                  checked={form.role === r.value}
                  onChange={handleChange}
                  className="peer sr-only"
                />
                <div className="h-full rounded-lg border border-slate-300 p-3.5 hover:border-slate-400 peer-checked:border-brand-500 peer-checked:bg-brand-50 peer-checked:ring-1 peer-checked:ring-brand-500 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-400 dark:border-slate-700 dark:hover:border-slate-600 dark:peer-checked:bg-brand-500/10">
                  <p className="text-sm font-semibold text-brand-900 dark:text-white">{r.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {r.text}
                  </p>
                </div>
              </label>
            ))}
          </div>
          {errors.role && (
            <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.role}</p>
          )}
        </fieldset>

        <FormField
          label="Mot de passe"
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="8 caractères minimum"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />
        <FormField
          label="Confirmer le mot de passe"
          id="confirm"
          type="password"
          autoComplete="new-password"
          placeholder="Répétez le mot de passe"
          value={form.confirm}
          onChange={handleChange}
          error={errors.confirm}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-900"
        >
          {loading ? "Création…" : "Créer mon compte"}
        </button>
      </form>
    </AuthLayout>
  );
}