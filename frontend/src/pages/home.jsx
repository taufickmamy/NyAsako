import logo from "../assets/ASlogo.png";
import ThemeToggle from "../components/themeToggle";

const columns = [
  {
    title: "À faire",
    dot: "bg-slate-400",
    cards: [
      { t: "Maquettes du dashboard", who: "RA", tag: "Design" },
      { t: "Schéma PostgreSQL", who: "SO", tag: "Backend" },
    ],
  },
  {
    title: "En cours",
    dot: "bg-amber-400",
    cards: [{ t: "Authentification JWT", who: "HE", tag: "Backend" }],
  },
  {
    title: "Terminé",
    dot: "bg-emerald-500",
    cards: [
      { t: "Kanban drag & drop", who: "MI", tag: "Frontend" },
      { t: "Upload de documents", who: "HE", tag: "Backend" },
    ],
  },
];

const features = [
  {
    title: "Kanban clair pour chaque projet",
    text: "Les tâches circulent de À faire à En cours puis Terminé. Chacun voit où en est le projet d'un seul coup d'œil.",
    icon: (
      <>
        <rect x="3" y="3" width="5" height="18" rx="1" />
        <rect x="10" y="3" width="5" height="12" rx="1" />
        <rect x="17" y="3" width="4" height="8" rx="1" />
      </>
    ),
  },
  {
    title: "Notifications en temps réel",
    text: "Une tâche assignée, déplacée ou commentée : l'équipe est prévenue instantanément, sans recharger la page.",
    icon: (
      <>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </>
    ),
  },
  {
    title: "Tableau de bord chiffré",
    text: "Tâches terminées, retards, charge par membre. Les managers pilotent avec des chiffres, pas des impressions.",
    icon: (
      <>
        <path d="M3 3v18h18" />
        <path d="M7 14l4-4 4 4 5-6" />
      </>
    ),
  },
  {
    title: "Documents au bon endroit",
    text: "Cahiers des charges, maquettes, comptes rendus : chaque fichier reste attaché au projet concerné.",
    icon: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
      </>
    ),
  },
  {
    title: "Historique des activités",
    text: "Qui a fait quoi, et quand. Chaque modification est tracée pour comprendre et revenir en arrière.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  },
  {
    title: "Accès sécurisés par rôle",
    text: "Admin, Manager ou Developer : chacun voit et modifie uniquement ce qui correspond à son rôle.",
    icon: (
      <>
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </>
    ),
  },
];
const roles = [
  {
    name: "Admin",
    text: "Gère les comptes, les rôles et l'ensemble des projets de l'entreprise.",
  },
  {
    name: "Manager",
    text: "Crée les projets, compose les équipes, assigne les tâches et suit les statistiques.",
  },
  {
    name: "Developer",
    text: "Reçoit ses tâches, fait avancer le Kanban et partage ses documents.",
  },
];

// Le logo PNG a un fond blanc : en mode sombre on le pose sur une pastille blanche.
const logoClass = "w-auto dark:rounded-lg dark:bg-white dark:px-2 dark:py-0.5";

function Avatar({ children }) {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-700 dark:bg-brand-700/40 dark:text-brand-100">
      {children}
    </span>
  );
}

function BoardPreview() {
  const members = [
    { w: "RA", bg: "bg-brand-500" },
    { w: "HE", bg: "bg-emerald-500" },
    { w: "MI", bg: "bg-amber-500" },
  ];

  return (
    <div className="min-w-0">
      <div className="rounded-2xl bg-white p-4 shadow-xl shadow-brand-900/10 ring-1 ring-brand-900/10 dark:bg-slate-900 dark:shadow-none dark:ring-white/10">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-brand-900 dark:text-white">
            Refonte du site client
          </p>
          <div className="flex -space-x-1.5">
            {members.map((m) => (
              <span
                key={m.w}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-white ring-2 ring-white dark:ring-slate-900 ${m.bg}`}
              >
                {m.w}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {columns.map((col) => (
            <div key={col.title} className="rounded-xl bg-slate-50 p-2 dark:bg-slate-800/60">
              <div className="mb-2 flex items-center gap-1.5 px-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                {col.title}
              </div>
              <div className="space-y-2">
                {col.cards.map((c) => (
                  <div
                    key={c.t}
                    className="rounded-lg bg-white p-2.5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
                  >
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-100">{c.t}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">{c.tag}</span>
                      <Avatar>{c.who}</Avatar>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification : eo ambanin'ny tabilao, tsy mivoaka ny ecran intsony */}
      <div className="relative -mt-3 ml-4 w-fit max-w-[15rem] rounded-xl bg-brand-900 px-4 py-3 text-xs text-white shadow-lg ring-1 ring-white/10 sm:ml-8 dark:bg-brand-600">
        <p className="font-medium">Authentification JWT</p>
        <p className="mt-0.5 text-brand-100">déplacée vers Terminé par Hery</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-700 dark:bg-slate-950 dark:text-slate-300">
      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <a href="/" aria-label="NyAsako, accueil">
            <img src={logo} alt="NyAsako" className={`h-10 ${logoClass}`} />
          </a>
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
            <a
              href="/login"
              className="hidden px-3 py-2 text-brand-900 hover:text-brand-600 sm:inline-block dark:text-white dark:hover:text-brand-400"
            >
              Se connecter
            </a>
            <a
              href="/register"
              className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
            >
              Créer un compte
            </a>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-24 pt-16 lg:grid-cols-2 lg:pt-24">
          <div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-brand-900 sm:text-5xl dark:text-white">
              Vos projets avancent quand votre équipe sait quoi faire.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              NyAsako aide les entreprises à organiser leurs projets, répartir les tâches et suivre
              l'avancement en temps réel, du premier jour à la livraison.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/register"
                className="rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
              >
                Commencer gratuitement
              </a>
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

      {/* Fonctionnalités */}
      <section id="fonctionnalites" className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <h2 className="text-3xl font-bold tracking-tight text-brand-900 dark:text-white">
            Tout ce qu'il faut pour mener un projet à terme
          </h2>
          <ul className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {features.map((f) => (
              <li key={f.title} className="py-6">
                <h3 className="text-lg font-semibold text-brand-900 dark:text-white">{f.title}</h3>
                <p className="mt-1.5 max-w-xl leading-relaxed text-slate-600 dark:text-slate-400">
                  {f.text}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Rôles */}
      <section id="roles" className="bg-brand-50 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="max-w-xl text-3xl font-bold tracking-tight text-brand-900 dark:text-white">
            Chacun accède à ce qui le concerne
          </h2>
          <p className="mt-3 max-w-xl text-slate-600 dark:text-slate-400">
            L'authentification sécurisée et trois rôles gardent les droits simples et clairs.
          </p>
          <dl className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-brand-900/10 ring-1 ring-brand-900/10 md:grid-cols-3 dark:bg-white/10 dark:ring-white/10">
            {roles.map((r) => (
              <div key={r.name} className="bg-white p-6 dark:bg-slate-800">
                <dt className="text-lg font-semibold text-brand-900 dark:text-white">{r.name}</dt>
                <dd className="mt-2 leading-relaxed text-slate-600 dark:text-slate-400">{r.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-brand-400 via-brand-600 to-brand-900 px-8 py-14 text-center text-white">
          <h2 className="text-3xl font-bold tracking-tight">
            Prêt à organiser votre prochain projet ?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-brand-100">
            Créez votre espace, invitez votre équipe et lancez votre premier Kanban en quelques
            minutes.
          </p>
          <a
            href="/register"
            className="mt-8 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-900 hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-700"
          >
            Créer un compte
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-slate-500 sm:flex-row dark:text-slate-400">
          <img src={logo} alt="NyAsako" className={`h-8 ${logoClass}`} />
          <p>© {new Date().getFullYear()} NyAsako. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}