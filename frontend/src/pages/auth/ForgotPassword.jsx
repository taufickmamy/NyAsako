import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import Icon from "../../components/common/Icon";
import Input from "../../components/common/Input";
import { requestPasswordReset } from "../../services/authService";
import { getErrorMessage } from "../../utils/errors";
import { notify } from "../../utils/notifications";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [serverError, setServerError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [devLink, setDevLink] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError("");

    if (!email.trim()) {
      setError("L'adresse e-mail est obligatoire.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Adresse e-mail invalide.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await requestPasswordReset(email.trim());
      setDevLink(response?.data?.devLink || "");
      setSubmitted(true);
      notify.success("E-mail de réinitialisation envoyé.");
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
          Mot de passe oublié
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation.
        </p>
      </div>

      {serverError && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300"
        >
          {serverError}
        </p>
      )}

      {submitted ? (
        <div className="space-y-4">
          <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
            Si un compte est associé à <strong>{email}</strong>, un e-mail contenant les
            instructions pour réinitialiser votre mot de passe vient d'être envoyé.
            Vérifiez également vos courriers indésirables (spams).
          </div>

          {devLink && (
            <div className="rounded-xl bg-amber-50 p-4 text-xs break-all text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
              <p className="mb-1 font-semibold">Mode développement : lien de réinitialisation</p>
              <a href={devLink} className="underline">
                {devLink}
              </a>
            </div>
          )}

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              setSubmitted(false);
              setEmail("");
              setDevLink("");
            }}
          >
            Renvoyer avec une autre adresse
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            label="Adresse e-mail"
            id="forgot-email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            placeholder="nom@exemple.com"
            icon="mail"
            required
          />

          <Button
            type="submit"
            loading={loading}
            className="w-full"
            icon={<Icon name="mail" className="h-4 w-4" />}
          >
            Envoyer le lien de vérification
          </Button>
        </form>
      )}

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