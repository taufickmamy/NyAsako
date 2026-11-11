import { Pencil } from "lucide-react"
import { useState, useRef } from "react";
import Avatar from "../../components/common/Avatar";
import Badge, { RoleBadge } from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Icon from "../../components/common/Icon";
import Input from "../../components/common/Input";
import PageHeader from "../../components/common/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { updateMe, updateAvatar } from "../../services/userService";
import { getErrorMessage } from "../../utils/errors";
import { notify } from "../../utils/notifications";
import { roleLabel } from "../../utils/roles";

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    password: "",
    confirmPassword: "",
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  }


  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setAvatarPreview(URL.createObjectURL(file)); // afficher un aperçu de l'image sélectionnée
    }
  }

  async function handleAvatarUpload() {
    if (!selectedFile) return;
    setAvatarLoading(true);
    try {
      const updated = await updateAvatar(selectedFile);
      updateUser(updated);
      setSelectedFile(null);
      setAvatarPreview(null);
      notify.success("Photo de profil mise à jour avec succès.");
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setAvatarLoading(false);
    }
  }

  function validate() {
    const found = {};
    if (!form.name.trim()) found.name = "Le nom est obligatoire.";
    if (!form.email.trim()) found.email = "L'adresse e-mail est obligatoire.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) found.email = "Adresse e-mail invalide.";

    if (form.password) {
      if (form.password.length < 8) found.password = "Au moins 8 caractères.";
      if (form.password !== form.confirmPassword) {
        found.confirmPassword = "Les mots de passe ne correspondent pas.";
      }
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
      };
      if (form.password) payload.password = form.password;

      const updated = await updateMe(payload);
      updateUser(updated);
      setForm((previous) => ({ ...previous, password: "", confirmPassword: "" }));
      notify.success("Profil mis à jour avec succès.");
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Mon profil"
        description="Gérez vos informations personnelles et votre mot de passe."
      />

      {/* Fizarana Sary Profil */}
      <section className="flex flex-col items-start gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center dark:bg-slate-900 dark:ring-slate-800">
        <div className="relative">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Avatar preview"
              className="h-20 w-20 rounded-full object-cover ring-2 ring-brand-500"
            />
          ) : (
            <Avatar name={user?.name} src={user?.profile_picture} size="xl" />
          )}
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 rounded-full bg-brand-600 p-1.5 text-white shadow hover:bg-brand-700"
            title="Changer la photo"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold text-brand-900 dark:text-white">{user?.name}</h2>
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <RoleBadge role={user?.role} size="md" />
            <Badge tone="slate">{roleLabel(user?.role)}</Badge>
          </div>

          {selectedFile && (
            <div className="mt-4 flex items-center gap-3">
              <Button size="sm" onClick={handleAvatarUpload} loading={avatarLoading}>
                Enregistrer la photo
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setSelectedFile(null); setAvatarPreview(null); }}>
                Annuler
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Formulaire de modification*/}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
      >
        {serverError && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300"
          >
            {serverError}
          </p>
        )}

        <div>
          <h3 className="text-base font-bold text-brand-900 dark:text-white">Informations personnelles</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ces informations sont visibles par les membres de votre équipe.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input
              label="Nom complet"
              id="profile-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              icon="user"
              required
            />
            <Input
              label="Adresse e-mail"
              id="profile-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              icon="mail"
              required
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
          <h3 className="text-base font-bold text-brand-900 dark:text-white">Sécurité</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Laissez les champs vides pour conserver votre mot de passe actuel.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input
              label="Nouveau mot de passe"
              id="profile-password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="8 caractères minimum"
              autoComplete="new-password"
            />
            <Input
              label="Confirmer le mot de passe"
              id="profile-confirm-password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Répétez le mot de passe"
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            onClick={() => {
              setForm({
                name: user?.name ?? "",
                email: user?.email ?? "",
                password: "",
                confirmPassword: "",
              });
              setErrors({});
              setServerError("");
            }}
          >
            Réinitialiser
          </Button>
          <Button type="submit" loading={loading} icon={<Icon name="check" className="h-4 w-4" />}>
            Enregistrer
          </Button>
        </div>
      </form>
    </div>
  );
}