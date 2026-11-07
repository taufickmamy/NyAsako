import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Icon from "../../components/common/Icon";
import * as authService from "../../services/authService";
import { getErrorMessage } from "../../utils/errors";

const ROLE_CHOICES = [
  {
    value: "Développeur",
    label: "Développeur",
    text: "Réalise les tâches et fait avancer le Kanban.",
    icon: "tasks",
  },
  {
    value: "Manager",
    label: "Manager",
    text: "Crée les projets, compose les équipes et assigne les tâches.",
    icon: "briefcase",
  },
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    role: "Développeur",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  }

  function validate() {
    const found = {};
    if (!form.name.trim()) found.name = "Le nom est obligatoire.";
    if (!form.email.trim()) found.email = "L'adresse e-mail est obligatoire.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) found.email = "Adresse e-mail invalide.";
    if (!form.password) found.password = "Le mot de passe est obligatoire.";
    else if (form.password.length < 8) found.password = "Au moins 8 caractères.";
    if (form.confirm !== form.password) found.confirm = "Les mots de passe ne correspondent pas.";
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
      await authService.register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
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

        <Input
          label="Nom complet"
          id="name"
          name="name"
          autoComplete="name"
          placeholder="Votre nom"
          icon="user"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          required
        />
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

        <fieldset>
          <legend className="block text-sm font-medium text-slate-800 dark:text-slate-200">
            Votre rôle
          </legend>
          <div className="mt-1.5 grid gap-3 sm:grid-cols-2">
            {ROLE_CHOICES.map((role) => (
              <label key={role.value} className="relative block cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  checked={form.role === role.value}
                  onChange={handleChange}
                  className="peer sr-only"
                />
                <div className="h-full rounded-lg border border-slate-300 p-3.5 transition hover:border-slate-400 peer-checked:border-brand-500 peer-checked:bg-brand-50 peer-checked:ring-1 peer-checked:ring-brand-500 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-400 dark:border-slate-700 dark:hover:border-slate-600 dark:peer-checked:bg-brand-500/10">
                  <Icon name={role.icon} className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  <p className="mt-2 text-sm font-semibold text-brand-900 dark:text-white">{role.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {role.text}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        <Input
          label="Mot de passe"
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="8 caractères minimum"
          icon="lock"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          required
        />
        <Input
          label="Confirmer le mot de passe"
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          placeholder="Répétez le mot de passe"
          icon="lock"
          value={form.confirm}
          onChange={handleChange}
          error={errors.confirm}
          required
        />

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Créer mon compte
        </Button>
      </form>
    </AuthLayout>
  );
}
