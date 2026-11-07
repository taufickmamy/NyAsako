import { useEffect, useState } from "react";
import { NOTIFY_EVENT } from "../../utils/notifications";
import Icon from "./Icon";

const TOAST_STYLES = {
  success: {
    icon: "check",
    wrapper: "border-emerald-200 bg-white text-emerald-800 dark:border-emerald-500/30 dark:bg-slate-900 dark:text-emerald-300",
    iconWrapper: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  error: {
    icon: "alert",
    wrapper: "border-red-200 bg-white text-red-800 dark:border-red-500/30 dark:bg-slate-900 dark:text-red-300",
    iconWrapper: "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400",
  },
  warning: {
    icon: "warning",
    wrapper: "border-amber-200 bg-white text-amber-800 dark:border-amber-500/30 dark:bg-slate-900 dark:text-amber-300",
    iconWrapper: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  },
  info: {
    icon: "info",
    wrapper: "border-brand-200 bg-white text-brand-800 dark:border-brand-500/30 dark:bg-slate-900 dark:text-brand-300",
    iconWrapper: "bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400",
  },
};

/**
 * Écoute le bus de notifications et affiche les toasts.
 * Doit envelopper l'application (voir main.jsx).
 */
export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleNotify = (event) => {
      const toast = event.detail;
      setToasts((previous) => [...previous, toast]);

      window.setTimeout(() => {
        setToasts((previous) => previous.filter((item) => item.id !== toast.id));
      }, 4500);
    };

    window.addEventListener(NOTIFY_EVENT, handleNotify);
    return () => window.removeEventListener(NOTIFY_EVENT, handleNotify);
  }, []);

  const dismiss = (id) => {
    setToasts((previous) => previous.filter((item) => item.id !== id));
  };

  return (
    <>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-end gap-2 p-4 sm:p-6"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => {
          const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg shadow-slate-900/5 ${style.wrapper}`}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.iconWrapper}`}>
                <Icon name={style.icon} className="h-4 w-4" />
              </span>
              <p className="flex-1 pt-1 text-sm font-medium leading-snug">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Fermer la notification"
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
