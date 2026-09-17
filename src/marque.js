// Détecte la marque et la ville par défaut selon le nom de domaine utilisé.
// Une seule app, une seule base de données — juste une présentation différente.

const MARQUES = {
  "tona2go.com": { nom: "Tona2Go", ville: "Goma", autreMarque: "TonaBk", autreDomaine: "https://tonabk.com" },
  "www.tona2go.com": { nom: "Tona2Go", ville: "Goma", autreMarque: "TonaBk", autreDomaine: "https://tonabk.com" },
};

const DEFAUT = { nom: "TonaBk", ville: "Bukavu", autreMarque: "Tona2Go", autreDomaine: "https://tona2go.com" };

export function obtenirMarque() {
  if (typeof window === "undefined") return DEFAUT;
  const hote = window.location.hostname;
  return MARQUES[hote] || DEFAUT;
}
