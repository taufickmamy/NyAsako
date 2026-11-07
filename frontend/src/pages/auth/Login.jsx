import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useAuth } from "../../context/AuthContext";
import * as authService from "../../services/authService";
import { getErrorMessage } from "../../utils/errors";
import { homePathFor } from "../../utils/roles";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const registered = location.state?.registered;

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("sessionExpired")) {
      sessionStorage.removeItem("sessionExpired");
      setSessionExpired(true);
    }
  }, []);

  if (user) return <Navigate to={homePathFor()} replace />;

  function handleChange(event) {
    setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  }

  function validate() {
    const found = {};
    if (!form.email.trim()) found.email = "L'adresse e-mail est obligatoire.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) found.email = "Adresse e-mail invalide.";
    if (!form.password) found.password = "Le mot de passe est obligatoire.";
    return found;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError("");
    setSessionExpired(false);

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    try {
      const data = await authService.login({
        email: form.email.trim(),
        password: form.password,
      });

      if (!data?.user) {
        setServerError("Réponse inattendue du serveur.");
        return;
      }

      login(data);
      navigate(location.state?.from || homePathFor(), { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
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
            Compte créé. Vous pouvez maintenant vous connecter.
          </p>
        )}
        {sessionExpired && !serverError && (
          <p role="alert" className="rounded-lg bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            Votre session a expiré. Veuillez vous reconnecter.
          </p>
        )}
        {serverError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {serverError}
          </p>
        )}

        <Input
          label="Adresse e-mail"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nom@entreprise.com"
          icon="mail"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          required
        />
        <Input
          label="Mot de passe"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Votre mot de passe"
          icon="lock"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          required
        />

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Se connecter
        </Button>
      </form>
    </AuthLayout>
  );
}
