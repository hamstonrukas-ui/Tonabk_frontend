// Textes du guide de bienvenue (3 écrans). Pour changer un texte, modifiez-le ici.
export const ECRANS_GUIDE = [
  { n: "1", icone: "🛍️", titre: "Choisissez un rayon", texte: "Chemises, robes, souliers… Touchez une catégorie, puis le type de produit qui vous intéresse." },
  { n: "2", icone: "💬", titre: "Écrivez au vendeur", texte: "Touchez un article, puis le bouton WhatsApp pour parler au vendeur. Ou touchez « Livre-moi » : on vous livre à la maison." },
  { n: "3", icone: "🔎", titre: "Vous ne trouvez pas ?", texte: "Dites-nous ce que vous cherchez avec le bouton « Demander » : on le cherche pour vous." },
];

export const PHRASE_RASSURANCE = "Aucun compte nécessaire pour parcourir et écrire au vendeur.";

const CLE_VU = "tonabk_guide_vu";
export function guideVu() {
  try { return localStorage.getItem(CLE_VU) === "1"; } catch { return true; } // stockage bloqué : on n'insiste pas
}
export function marquerGuideVu() {
  try { localStorage.setItem(CLE_VU, "1"); } catch { /* pas grave */ }
}

// ---- Aide de chaque page : petite carte affichée la 1re fois, puis bouton « ? » ----
export const AIDES = {
  accueil: "Touchez une catégorie en haut (Habillement, Smartphones…), puis le type de produit. Touchez un article pour le voir. Le bouton « Voir en mode TikTok » fait défiler les produits comme une vidéo. Le bouton rond orange rafraîchit la page.",
  rayon: "Voici les articles de ce rayon. Touchez « Voir en mode TikTok » pour les faire défiler, ou « Partager » pour envoyer ce rayon à un ami sur WhatsApp.",
  produit: "Glissez la photo pour en voir d'autres. Touchez « WhatsApp » pour écrire au vendeur, ou « Livre-moi à la maison » pour qu'on vous livre. Le bouton vert en haut à droite partage ce produit.",
  boutiques: "Choisissez une catégorie pour voir les boutiques, puis touchez une boutique pour voir tous ses articles.",
  boutique: "Voici le catalogue de cette boutique. Touchez un article pour le voir de plus près et écrire au vendeur.",
  soldes: "Ce sont les offres du moment à prix réduit. Touchez une offre pour voir les photos et le prix, puis contactez-nous pour l'avoir.",
  mali_mupya: "Ce sont les nouveautés publiées par les boutiques, visibles 48 heures. Touchez une photo pour la voir en grand, glissez pour voir les suivantes, et touchez « Livre-moi » pour commander.",
  kisakoshi: "Un Kisakoshi, c'est une valise : plusieurs articles ensemble pour un seul prix. Touchez-en un pour voir les photos et contacter le vendeur.",
  requete: "Vous cherchez un produit introuvable ? Décrivez-le ici : des vendeurs pourront vous répondre.",
  location: "Trouvez une maison à louer par quartier. Touchez une maison pour voir les photos et contacter le propriétaire.",
  commandes: "Vous retrouvez ici vos demandes de livraison. Touchez-en une pour reprendre la conversation sur WhatsApp.",
  panier: "Vérifiez vos articles puis envoyez votre commande.",
  expeditions: "Choisissez votre trajet pour voir sur la carte le chemin que suit votre colis, puis lisez les informations. Touchez le bouton vert pour nous écrire sur WhatsApp et expédier.",
};

// Quelle aide pour quelle page ? (null = pas d'aide)
export function idAide(pathname, search = "") {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (p === "/") return new URLSearchParams(search).get("sc") ? "rayon" : "accueil";
  if (p === "/boutique" || p === "/boutique/populaires" || p.startsWith("/boutique/categorie/")) return "boutiques";
  if (p.startsWith("/boutique/produit/")) return "produit";
  if (/^\/boutique\/(creer|gerer|inventaire|recherche|acceder)$/.test(p)) return null;
  if (/^\/boutique\/[^/]+\/(panier|commande)$/.test(p)) return "panier";
  if (/^\/boutique\/[^/]+$/.test(p)) return "boutique";
  if (p === "/soldes" || p.startsWith("/soldes/")) return "soldes";
  if (p === "/nouveautes") return "mali_mupya";
  if (p === "/kisakoshi") return "kisakoshi";
  if (p === "/requete") return "requete";
  if (p === "/location") return "location";
  if (p === "/mes-commandes") return "commandes";
  if (p === "/expeditions" || p.startsWith("/expeditions/")) return "expeditions";
  return null;
}

const CLE_AIDE = "tonabk_aide_vue_";
export function aideVue(id) {
  try { return localStorage.getItem(CLE_AIDE + id) === "1"; } catch { return true; }
}
export function marquerAideVue(id) {
  try { localStorage.setItem(CLE_AIDE + id, "1"); } catch { /* pas grave */ }
}
