/**
 * L'API peut renvoyer les listes sous plusieurs formes :
 *   [ ... ]  |  { projects: [...] }  |  { data: [...] }
 * Ces helpers uniformisent la lecture des réponses.
 */

export function unwrapList(data, key) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export function unwrapOne(data, key) {
  if (data?.[key]) return data[key];
  if (data?.data) return data.data;
  return data;
}
