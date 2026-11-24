import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../components/common/Button";
import Icon from "../../components/common/Icon";
import Input from "../../components/common/Input";
import { resetPassword } from "../../services/authService";
import { getErrorMessage } from "../../utils/errors";
import { notify } from "../../utils/notifications";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") ?? "";
  const emailFromUrl = searchParams.get("email") ?? "";

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  function validate() {
    const found = {};
    if (!token) {
      found.token = "Jeton de réinitialisation manquant ou invalide.";
    }
    if (!form.password) {
      found.password = "Le nouveau mot de passe est obligatoire.";
    } else if (form.password.length < 8) {
      found.password = "Au moins 8 caractères requis.";
    }

    if (form.confirmPassword !== form.password) {
      found.confirmPassword = "Les mots de passe ne correspondent pas.";
    }
    return found;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError("");

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    try {
      await resetPassword({
        token,
        email: emailFromUrl || undefined,
        password: form.password,
      });
      notify.success("Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.");
      navigate("/login");
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8 dark:bg-slate-900 dark:ring-slate-800">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-brand-900 dark:text-white">
          Nouveau mot de passe
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Choisissez un mot de passe sécurisé pour votre compte.
        </p>
      </div>

      {errors.token && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"
        >
          {errors.token}
        </p>
      )}

      {serverError && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300"
        >
          {serverError}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Nouveau mot de passe"
          id="reset-password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="8 caractères minimum"
          autoComplete="new-password"
          required
        />

        <Input
          label="Confirmer le mot de passe"
          id="reset-confirm-password"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          placeholder="Répétez le mot de passe"
          autoComplete="new-password"
          required
        />

        <Button
          type="submit"
          loading={loading}
          disabled={!token}
          className="w-full"
          icon={<Icon name="check" className="h-4 w-4" />}
        >
          Enregistrer le mot de passe
        </Button>
      </form>

      <div className="mt-6 border-t border-slate-100 pt-4 text-center dark:border-slate-800">
        <Link
          to="/login"
          className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
        >
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}