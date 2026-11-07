import { useState } from "react";
import Button from "../common/Button";
import Input, { Select } from "../common/Input";
import Modal from "../common/Modal";
import { getErrorMessage } from "../../utils/errors";

/** Formulaire d'ajout / modification d'un membre de l'équipe. */
export default function MemberFormModal({
  initial,
  roleOptions,
  title = "Ajouter un membre",
  submitLabel = "Ajouter",
  requirePassword = true,
  onSubmit,
  onClose,
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    password: "",
    role: initial?.role ?? roleOptions?.[0]?.value ?? "Développeur",
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
    if (requirePassword) {
      if (!form.password) found.password = "Le mot de passe est obligatoire.";
      else if (form.password.length < 8) found.password = "Au moins 8 caractères.";
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
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
      };
      if (requirePassword) payload.password = form.password;
      await onSubmit(payload);
    } catch (err) {
      setServerError(getErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" form="member-form" loading={loading}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <form id="member-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        {serverError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {serverError}
          </p>
        )}

        <Input
          label="Nom complet"
          id="member-name"
          name="name"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Ex. Hery Rakoto"
          required
        />

        <Input
          label="Adresse e-mail"
          id="member-email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="membre@entreprise.com"
          required
        />

        {requirePassword && (
          <Input
            label="Mot de passe temporaire"
            id="member-password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="8 caractères minimum"
            autoComplete="new-password"
            required
          />
        )}

        <Select
          label="Rôle"
          id="member-role"
          name="role"
          value={form.role}
          onChange={handleChange}
          options={roleOptions}
        />
      </form>
    </Modal>
  );
}
