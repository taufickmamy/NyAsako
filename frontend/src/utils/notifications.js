/**
 * Bus d'événements léger pour les notifications.
 * Permet à l'intercepteur Axios (hors composant React) de déclencher
 * des toasts sans coupler la couche réseau à React.
 */

export const NOTIFY_EVENT = "nyasako:notify";

let counter = 0;

export function notify(type, message) {
  if (typeof window === "undefined" || !message) return;
  window.dispatchEvent(
    new CustomEvent(NOTIFY_EVENT, {
      detail: { id: `toast-${Date.now()}-${counter++}`, type, message },
    })
  );
}

notify.success = (message) => notify("success", message);
notify.error = (message) => notify("error", message);
notify.warning = (message) => notify("warning", message);
notify.info = (message) => notify("info", message);
