export function getErrorMessage(err) {
  if (err.response) {
    const d = err.response.data;
    return (
      d?.message ||
      d?.error ||
      (typeof d === "string" ? d : `Erreur ${err.response.status}`)
    );
  }
  return "Impossible de joindre le serveur.";
}