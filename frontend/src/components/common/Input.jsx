import { useId, useState } from "react";
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
  name,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  icon,
  required = false,
  autoComplete,
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";
  const resolvedType = isPasswordField && showPassword ? "text" : type;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Icon name={icon} className="h-4 w-4" />
          </span>
        )}

        <input
          id={id}
          name={name}
          type={resolvedType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`w-full rounded-lg border bg-white py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 ${
            icon ? "pl-9" : "pl-3"
          } ${isPasswordField ? "pr-10" : "pr-3"} ${
            error
              ? "border-red-500 focus:ring-red-400"
              : "border-slate-300 dark:border-slate-700"
          }`}
          {...rest}
        />

        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={
              showPassword
                ? "Masquer le mot de passe"
                : "Afficher le mot de passe"
            }
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none dark:hover:text-slate-200"
          >
            <Icon
              name={showPassword ? "eye-off" : "eye"}
              className="h-4 w-4"
            />
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

/** Zone de texte multiligne. */
export function Textarea({
  label,
  id,
  name,
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
        name={name || fieldId}
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
  name,
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
        name={name || fieldId}
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
