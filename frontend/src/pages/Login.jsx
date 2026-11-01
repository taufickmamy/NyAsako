import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";
import { loginRequest } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { homePathFor } from "../utils/roles";

export default function Login() {
  const { user, login } = useAuth();
  const location = useLocation();
  const registered = location.state?.registered;

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  // si l'utilisateur est déjà connecté, rediriger vers la page d'accueil correspondant à son rôle
  if (user) return <Navigate to={homePathFor(user.role)} replace />;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    const e = {};
    if (!form.email.trim()) e.email = "L'adresse e-mail est obligatoire.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Adresse e-mail invalide.";
    if (!form.password) e.password = "Le mot de passe est obligatoire.";
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
      const { data } = await loginRequest(form);

      if (!data?.user) {
        setServerError("Réponse inattendue du serveur.");
        return;
      }

      // enregistrer les données de l'utilisateur et puis vers la page correspondante à son rôle
      login(data);
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

  return (
    <AuthLayout
      title="Connexion"
      subtitle="Heureux de vous revoir. Connectez-vous à votre espace."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link to="/register" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
            Créer un compte
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {registered && !serverError && (
          <p role="status" className="rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            Compte créé. Vous pouvez vous connecter.
          </p>
        )}
        {serverError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {serverError}
          </p>
        )}

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
        <FormField
          label="Mot de passe"
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Votre mot de passe"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-900"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </AuthLayout>
  );
}