import { useId } from "react";
import Icon from "./Icon";

const BASE_FIELD =
  "block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500";

function fieldClasses(error, extra) {
  return `${BASE_FIELD} ${
    error
      ? "border-red-500 focus:ring-red-300 dark:border-red-400"
      : "border-slate-300 focus:ring-brand-400 dark:border-slate-700"
  } ${extra}`;
}

/** Champ texte avec libellé, icône optionnelle, aide et message d'erreur. */
export default function Input({
  label,
  id,
  error,
  hint,
  icon,
  className = "",
  containerClassName = "",
  required,
  ...props
}) {
  const autoId = useId();
  const fieldId = id || autoId;

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-slate-800 dark:text-slate-200">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Icon name={icon} className="h-4 w-4" />
          </span>
        )}
        <input
          id={fieldId}
          name={fieldId}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          className={fieldClasses(error, `${icon ? "pl-10" : ""} ${className}`)}
          {...props}
        />
      </div>
      {hint && !error && (
        <p id={`${fieldId}-hint`} className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${fieldId}-error`} className="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

/** Zone de texte multiligne. */
export function Textarea({
  label,
  id,
  error,
  hint,
  rows = 4,
  className = "",
  containerClassName = "",
  required,
  ...props
}) {
  const autoId = useId();
  const fieldId = id || autoId;

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-slate-800 dark:text-slate-200">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={fieldId}
        name={fieldId}
        rows={rows}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={fieldClasses(error, className)}
        {...props}
      />
      {hint && !error && (
        <p id={`${fieldId}-hint`} className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${fieldId}-error`} className="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

/** Liste déroulante. `options` = [{ value, label }]. */
export function Select({
  label,
  id,
  error,
  hint,
  options = [],
  children,
  className = "",
  containerClassName = "",
  required,
  ...props
}) {
  const autoId = useId();
  const fieldId = id || autoId;

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-slate-800 dark:text-slate-200">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <select
        id={fieldId}
        name={fieldId}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={fieldClasses(error, className)}
        {...props}
      >
        {children ||
          options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
      </select>
      {hint && !error && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      )}
      {error && (
        <p id={`${fieldId}-error`} className="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
