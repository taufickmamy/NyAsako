import { Link } from "react-router-dom";
import logo from "../assets/ASlogo.png";
import ThemeToggle from "./ThemeToggle";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-300">
      <header className="flex items-center justify-between px-5 py-4">
        <Link to="/" aria-label="NyAsako, accueil">
          <img
            src={logo}
            alt="NyAsako"
            className="h-10 w-auto dark:rounded-lg dark:bg-white dark:px-2 dark:py-0.5"
          />
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-5 pb-16">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-8 shadow-xl shadow-brand-900/5 ring-1 ring-slate-200 dark:bg-slate-900 dark:shadow-none dark:ring-white/10">
            <h1 className="text-2xl font-bold tracking-tight text-brand-900 dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
            )}
            <div className="mt-6">{children}</div>
          </div>
          {footer && (
            <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">{footer}</p>
          )}
        </div>
      </main>
    </div>
  );
}