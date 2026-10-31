import { useState } from "react";

export default function FormField({ label, id, error, type = "text", ...inputProps }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && show ? "text" : type;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-800 dark:text-slate-200">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={id}
          type={inputType}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`mt-1.5 block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 ${
            isPassword ? "pr-11 [&::-ms-reveal]:hidden" : ""
          } ${
            error
              ? "border-red-500 focus:ring-red-300 dark:border-red-400"
              : "border-slate-300 focus:ring-brand-400 dark:border-slate-700"
          }`}
          {...inputProps}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            aria-pressed={show}
            className="absolute right-0 top-1.5 flex h-[2.625rem] w-11 items-center justify-center rounded-r-lg text-slate-500 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:text-slate-400 dark:hover:text-white"
          >
            {show ? (
              /* yeux ferme */
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-6.5 0-10-7-10-7a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 5c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                <path d="M1 1l22 22" />
              </svg>
            ) : (
              /* yeux ouvert */
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}