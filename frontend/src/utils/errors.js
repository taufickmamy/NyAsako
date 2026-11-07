/**
 * Gestion centralisée des erreurs HTTP.
 * Chaque code est traduit en message explicite en français.
 */

export const HTTP_ERROR_MESSAGES = {
  400: "Les données envoyées sont invalides. Vérifiez le formulaire.",
  401: "Votre session a expiré. Veuillez vous reconnecter.",
  403: "Vous n'avez pas les permissions nécessaires pour cette action.",
  404: "La ressource demandée est introuvable.",
  409: "Cette action entre en conflit avec des données existantes.",
  422: "Les données envoyées ne peuvent pas être traitées.",
  500: "Une erreur interne est survenue. Réessayez plus tard.",
  502: "Le serveur est momentanément indisponible.",
  503: "Le service est momentanément indisponible.",
};

/** Extrait le meilleur message possible d'une erreur Axios / JavaScript. */
export function getErrorMessage(err) {
  if (err?.userMessage) return err.userMessage;

  if (err?.response) {
    const data = err.response.data;
    if (typeof data === "string" && data.trim()) return data;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return data.errors.map((e) => e.message || e).join(" ");
    }
    return HTTP_ERROR_MESSAGES[err.response.status] || `Erreur ${err.response.status}.`;
  }

  if (err?.code === "ECONNABORTED") {
    return "La requête a expiré. Vérifiez votre connexion.";
  }

  return "Impossible de joindre le serveur. Vérifiez qu'il est démarré.";
}

/** Vrai si l'erreur correspond à une session expirée / un jeton invalide. */
export function isSessionError(err) {
  const status = err?.response?.status;
  const message = String(
    err?.response?.data?.message || err?.response?.data?.error || ""
  );
  return (
    status === 401 ||
    (status === 403 && /jeton|token|expir/i.test(message))
  );
}
