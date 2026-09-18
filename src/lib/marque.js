// Détecte la marque et la ville par défaut selon le nom de domaine utilisé.
// Une seule app, une seule base de données — juste une présentation différente.
// prefixe/suffixe : découpage exact du logo pour le style "Tona[Bk]" / "Tona[2Go]"
// (une simple découpe des 2 derniers caractères ne marche pas pour "2Go").

const MARQUES = {
  "tona2go.com": { nom: "Tona2go", prefixe: "Tona", suffixe: "2go", ville: "Goma", autreMarque: "TonaBk", autreDomaine: "https://tonabk.com" },
  "www.tona2go.com": { nom: "Tona2go", prefixe: "Tona", suffixe: "2go", ville: "Goma", autreMarque: "TonaBk", autreDomaine: "https://tonabk.com" },
};

const DEFAUT = { nom: "TonaBk", prefixe: "Tona", suffixe: "Bk", ville: "Bukavu", autreMarque: "Tona2go", autreDomaine: "https://tona2go.com" };

export function obtenirMarque() {
  if (typeof window === "undefined") return DEFAUT;
  const hote = window.location.hostname;
  return MARQUES[hote] || DEFAUT;
}
