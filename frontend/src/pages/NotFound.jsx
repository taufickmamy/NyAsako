import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import Icon from "../components/common/Icon";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
        <Icon name="search" className="h-8 w-8" />
      </span>
      <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
        Erreur 404
      </p>
      <h1 className="mt-2 text-3xl font-bold text-brand-900 dark:text-white">Page introuvable</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <Button as={Link} to="/dashboard" className="mt-6" icon={<Icon name="home" className="h-4 w-4" />}>
        Retour au tableau de bord
      </Button>
    </div>
  );
}
