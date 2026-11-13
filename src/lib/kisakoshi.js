// Outils communs aux Kisakoshi (les valises)
const CLE_VUES = "tonabk_kisakoshi_vues";

export function lireVues() {
  try {
    const brut = JSON.parse(localStorage.getItem(CLE_VUES) || "[]");
    return new Set(Array.isArray(brut) ? brut : []);
  } catch {
    return new Set();
  }
}

export function marquerVue(id) {
  try {
    const vues = [...lireVues()];
    if (!vues.includes(id)) vues.push(id);
    localStorage.setItem(CLE_VUES, JSON.stringify(vues.slice(-300)));
  } catch { /* stockage indisponible : sans conséquence */ }
}

export function formaterPrix(prix, devise) {
  return `${Number(prix).toLocaleString("fr-FR")} ${devise}`;
}

export function ilYa(iso) {
  const min = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.floor(h / 24);
  return `il y a ${j} jour${j > 1 ? "s" : ""}`;
}

export function tempsAvantExpiration(iso) {
  const min = Math.floor((new Date(iso).getTime() - Date.now()) / 60000);
  if (min <= 0) return "expiré";
  if (min < 60) return `expire dans ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `expire dans ${h} h`;
  const j = Math.floor(h / 24);
  return `expire dans ${j} jour${j > 1 ? "s" : ""}`;
}

// « Livre-moi » sur un Kisakoshi : ouvre WhatsApp de la boutique qui propose la valise.
// Le lien joint affiche la première photo dans la conversation.
export function ouvrirLivreMoi(item, apiUrl) {
  const numero = (item.telephone || "").replace(/\D/g, "");
  if (!numero) {
    alert("Cette boutique n'a pas encore de numéro WhatsApp renseigné.");
    return;
  }
  const message =
    `Bonjour, je veux ce Kisakoshi vu sur TonaBk : ${item.contenu} à ${formaterPrix(item.prix, item.devise)}.` +
    `\n${apiUrl}/partage/kisakoshi/${item.id}?v=${Date.now()}`;
  window.open(`https://wa.me/${numero}?text=${encodeURIComponent(message)}`, "_blank");
}
