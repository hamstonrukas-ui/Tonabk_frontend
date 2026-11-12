// Outils communs aux nouveautés (statuts de 48 h)
const CLE_VUES = "tonabk_nouveautes_vues";

export function lireVues() {
  try {
    const brut = JSON.parse(localStorage.getItem(CLE_VUES) || "[]");
    return new Set(Array.isArray(brut) ? brut : []);
  } catch {
    return new Set();
  }
}

// Mémorise une nouveauté comme vue ; on ne garde que les 300 dernières pour ne pas grossir sans fin
export function marquerVue(id) {
  try {
    const vues = [...lireVues()];
    if (!vues.includes(id)) vues.push(id);
    localStorage.setItem(CLE_VUES, JSON.stringify(vues.slice(-300)));
  } catch { /* stockage indisponible : sans conséquence */ }
}

export function ilYa(iso) {
  const min = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  return `il y a ${h} h`;
}

export function tempsAvantExpiration(iso) {
  const min = Math.floor((new Date(iso).getTime() - Date.now()) / 60000);
  if (min <= 0) return "expirée";
  if (min < 60) return `expire dans ${min} min`;
  return `expire dans ${Math.floor(min / 60)} h`;
}
