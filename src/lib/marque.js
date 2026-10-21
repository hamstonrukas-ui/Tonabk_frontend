// Gère la marque/ville affichée. Trois façons de la déterminer, dans cet ordre :
//  1. Choix mémorisé sur l'appareil (l'utilisateur a utilisé le sélecteur de ville)
//  2. Paramètre ?marque=... dans l'URL de lancement (utilisé par chaque appli
//     Android installée — TonaBk, Tona2go... — pour donner sa ville par défaut
//     au tout premier lancement, avant mémorisation)
//  3. Nom de domaine (visite depuis un navigateur classique)
// Une seule app, une seule base de données — juste une présentation différente.

const CLE_STOCKAGE = "tonabk_ville_choisie";

export const VILLES = {
  bukavu: { cle: "bukavu", nom: "TonaBk", prefixe: "Tona", suffixe: "Bk", ville: "Bukavu" },
  goma: { cle: "goma", nom: "Tona2go", prefixe: "Tona", suffixe: "2go", ville: "Goma" },
};

const CLE_PAR_HOTE = {
  "tona2go.com": "goma",
  "www.tona2go.com": "goma",
  "tonabk.com": "bukavu",
  "www.tonabk.com": "bukavu",
};

function cleDepuisHote() {
  if (typeof window === "undefined") return "bukavu";
  return CLE_PAR_HOTE[window.location.hostname] || "bukavu";
}

function cleDepuisParametreUrl() {
  if (typeof window === "undefined") return null;
  const valeur = new URLSearchParams(window.location.search).get("marque");
  return valeur && VILLES[valeur] ? valeur : null;
}

function cleMemorisee() {
  if (typeof window === "undefined") return null;
  try {
    const valeur = localStorage.getItem(CLE_STOCKAGE);
    return valeur && VILLES[valeur] ? valeur : null;
  } catch {
    return null;
  }
}

export function obtenirMarque() {
  const memorisee = cleMemorisee();
  const depuisUrl = cleDepuisParametreUrl();
  const cle = memorisee || depuisUrl || cleDepuisHote();

  if (!memorisee && depuisUrl) {
    try { localStorage.setItem(CLE_STOCKAGE, depuisUrl); } catch {}
  }

  const marque = VILLES[cle] || VILLES.bukavu;
  const autre = Object.values(VILLES).find((v) => v.cle !== marque.cle);
  return { ...marque, autreMarque: autre?.nom, autreVilleCle: autre?.cle };
}

// Change la ville affichée et la mémorise sur l'appareil. Ne quitte JAMAIS le
// domaine actuel — reste toujours sur place.
export function changerDeVille(cle) {
  if (!VILLES[cle]) return;
  try { localStorage.setItem(CLE_STOCKAGE, cle); } catch {}
  window.location.href = "/";
}

export function listeVilles() {
  return Object.values(VILLES);
}
