import { Link } from "react-router-dom";
import logo from "../assets/ASlogo.png";
import Icon from "../components/common/Icon";
import ThemeToggle from "../components/common/ThemeToggle";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  {
    icon: "kanban",
    title: "Kanban clair pour chaque projet",
    text: "Les tâches circulent de « À faire » à « En cours » puis « Terminé ». Toute l'équipe voit l'avancement d'un coup d'œil.",
  },
  {
    icon: "dashboard",
    title: "Tableau de bord chiffré",
    text: "Projets actifs, tâches en retard, charge par statut : les managers pilotent avec des données concrètes.",
  },
  {
    icon: "users",
    title: "Équipe et rôles maîtrisés",
    text: "Administrateur, Manager, Développeur : chacun accède exactement à ce qui le concerne.",
  },
  {
    icon: "file",
    title: "Documents centralisés",
    text: "Cahiers des charges, maquettes et comptes rendus restent attachés au bon projet.",
  },
  {
    icon: "clock",
    title: "Historique des activités",
    text: "Qui a fait quoi, et quand : chaque création, changement de statut et ajout de document est tracé.",
  },
  {
    icon: "shield",
    title: "Accès sécurisés",
    text: "Authentification JWT et contrôle d'accès par rôle protègent vos données à chaque requête.",
  },
];

const ROLES = [
  {
    name: "Administrateur",
    text: "Gère les comptes, les rôles et l'ensemble des projets de l'organisation.",
    icon: "shield",
  },
  {
    name: "Manager",
    text: "Crée les projets, compose l'équipe, assigne les tâches et suit les statistiques.",
    icon: "briefcase",
  },
  {
    name: "Développeur",
    text: "Reçoit ses tâches, fait avancer le Kanban, commente et partage ses documents.",
    icon: "tasks",
  },
];

const COLUMNS = [
  { title: "À faire", dot: "bg-slate-400", cards: ["Maquettes du dashboard", "Schéma PostgreSQL"] },
  { title: "En cours", dot: "bg-amber-400", cards: ["Authentification JWT"] },
  { title: "Terminé", dot: "bg-emerald-500", cards: ["Kanban interactif", "Upload de documents"] },
];

function BoardPreview() {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-xl shadow-brand-900/10 ring-1 ring-brand-900/10 dark:bg-slate-900 dark:shadow-none dark:ring-white/10">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-brand-900 dark:text-white">Refonte du site client</p>
        <div className="flex -space-x-1.5">
          {["RA", "HE", "MI"].map((initials) => (
            <span
              key={initials}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-[10px] font-semibold text-white ring-2 ring-white dark:ring-slate-900"
            >
              {initials}
            </span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {COLUMNS.map((column) => (
          <div key={column.title} className="rounded-xl bg-slate-50 p-2 dark:bg-slate-800/60">
            <div className="mb-2 flex items-center gap-1.5 px-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              <span className={`h-2 w-2 rounded-full ${column.dot}`} />
              {column.title}
            </div>
            <div className="space-y-2">
              {column.cards.map((card) => (
                <div
                  key={card}
                  className="rounded-lg bg-white p-2.5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
                >
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-100">{card}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white text-slate-700 dark:bg-slate-950 dark:text-slate-300">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link to="/" aria-label="NyAsako, accueil">
            <img src={logo} alt="NyAsako" className="h-10 w-auto dark:rounded-lg dark:bg-white dark:px-2 dark:py-0.5" />
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex dark:text-slate-300">
            <a href="#fonctionnalites" className="hover:text-brand-600 dark:hover:text-brand-400">
              Fonctionnalités
            </a>
            <a href="#roles" className="hover:text-brand-600 dark:hover:text-brand-400">
              Rôles
            </a>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                Mon espace
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden px-3 py-2 text-brand-900 hover:text-brand-600 sm:inline-block dark:text-white dark:hover:text-brand-400"
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                >
                  Créer un compte
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <section className="bg-gradient-to-b from-brand-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-24 pt-16 lg:grid-cols-2 lg:pt-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-900/10 dark:bg-slate-900 dark:text-brand-300 dark:ring-white/10">
              <Icon name="sparkles" className="h-3.5 w-3.5" />
              Plateforme SaaS de gestion de projets
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-brand-900 sm:text-5xl dark:text-white">
              Vos projets avancent quand votre équipe sait quoi faire.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              NyAsako aide les entreprises à organiser leurs projets, répartir les tâches et suivre
              l'avancement en temps réel, du premier jour à la livraison.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={isAuthenticated ? "/dashboard" : "/register"}
                className="rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                {isAuthenticated ? "Accéder à mon espace" : "Commencer gratuitement"}
              </Link>
              <a
                href="#fonctionnalites"
                className="rounded-lg px-6 py-3 text-sm font-semibold text-brand-900 ring-1 ring-brand-900/15 hover:bg-white dark:text-white dark:ring-white/20 dark:hover:bg-white/5"
              >
                Voir les fonctionnalités
              </a>
            </div>
          </div>
          <BoardPreview />
        </div>
      </section>

      <section id="fonctionnalites" className="mx-auto max-w-6xl px-5 py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-brand-900 dark:text-white">
            Tout ce qu'il faut pour mener un projet à terme
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Une seule plateforme pour planifier, exécuter et suivre vos projets.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md dark:bg-slate-900 dark:ring-slate-800"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                <Icon name={feature.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-brand-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {feature.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="roles" className="bg-brand-50 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="max-w-xl text-3xl font-bold tracking-tight text-brand-900 dark:text-white">
            Chacun accède à ce qui le concerne
          </h2>
          <p className="mt-3 max-w-xl text-slate-600 dark:text-slate-400">
            L'authentification sécurisée et trois rôles gardent les droits simples et clairs.
          </p>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-brand-900/10 ring-1 ring-brand-900/10 md:grid-cols-3 dark:bg-white/10 dark:ring-white/10">
            {ROLES.map((role) => (
              <div key={role.name} className="bg-white p-6 dark:bg-slate-800">
                <Icon name={role.icon} className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                <h3 className="mt-3 text-lg font-semibold text-brand-900 dark:text-white">{role.name}</h3>
                <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-400">{role.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-brand-400 via-brand-600 to-brand-900 px-8 py-14 text-center text-white">
          <h2 className="text-3xl font-bold tracking-tight">
            Prêt à organiser votre prochain projet ?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-brand-100">
            Créez votre espace, invitez votre équipe et lancez votre premier Kanban en quelques minutes.
          </p>
          <Link
            to={isAuthenticated ? "/dashboard" : "/register"}
            className="mt-8 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-900 hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {isAuthenticated ? "Ouvrir mon espace" : "Créer un compte"}
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-100 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-slate-500 sm:flex-row dark:text-slate-400">
          <img src={logo} alt="NyAsako" className="h-8 w-auto dark:rounded-lg dark:bg-white dark:px-2 dark:py-0.5" />
          <p>© {new Date().getFullYear()} NyAsako. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
