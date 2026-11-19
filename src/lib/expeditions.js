// Les 4 trajets d'expédition de colis. Pour modifier un itinéraire, une étape ou ajouter des informations,
// changez ce fichier : la carte et les pages se mettent à jour toutes seules.
//
// points : de l'origine à la destination finale (lat / lng = position réelle de la ville).
//   role (facultatif) : "Départ", "Escale" ou "Arrivée". Sans role : premier = Départ, dernier = Arrivée, les autres = Escale.
//   mode (facultatif) : comment le colis voyage jusqu'à ce point (ex. "Bateau", "Route", "Avion").
// infos : les renseignements à afficher sous la carte, par exemple
//   { titre: "Délais", texte: "10 à 15 jours" }, { titre: "Tarifs", texte: "…" }
//   (liste vide = la page affiche « Informations bientôt disponibles »).
//
// ⚠️ Les itinéraires ci-dessous sont INDICATIFS : corrigez les escales selon votre vrai circuit.

export const NUMERO_WHATSAPP_EXPEDITION = "243855841999";

export const EXPEDITIONS = [
  {
    id: "chine-rdc",
    titre: "Chine → RDC",
    sous_titre: "Vos achats de Chine jusqu'au Kivu",
    emoji: "🚢",
    points: [
      { nom: "Guangzhou", pays: "Chine", lat: 23.13, lng: 113.26, role: "Départ" },
      { nom: "Dar es Salaam", pays: "Tanzanie", lat: -6.79, lng: 39.21, role: "Escale", mode: "Bateau" },
      { nom: "Kigali", pays: "Rwanda", lat: -1.94, lng: 30.06, role: "Escale", mode: "Route" },
      { nom: "Goma", pays: "RDC", lat: -1.68, lng: 29.22, role: "Arrivée", mode: "Route" },
    ],
    infos: [],
  },
  {
    id: "kivu-uvira-kalemie",
    titre: "Bukavu, Goma → Uvira, Kalemie",
    sous_titre: "Du Nord-Kivu vers le lac Tanganyika",
    emoji: "🚚",
    points: [
      { nom: "Goma", pays: "RDC", lat: -1.68, lng: 29.22, role: "Départ" },
      { nom: "Bukavu", pays: "RDC", lat: -2.51, lng: 28.86, role: "Départ", mode: "Route" },
      { nom: "Uvira", pays: "RDC", lat: -3.40, lng: 29.14, role: "Arrivée", mode: "Route" },
      { nom: "Kalemie", pays: "RDC", lat: -5.93, lng: 29.19, role: "Arrivée", mode: "Bateau" },
    ],
    infos: [],
  },
  {
    id: "kivu-burundi",
    titre: "Bukavu, Goma → Burundi",
    sous_titre: "Vers Bujumbura et le Burundi",
    emoji: "🚐",
    points: [
      { nom: "Goma", pays: "RDC", lat: -1.68, lng: 29.22, role: "Départ" },
      { nom: "Bukavu", pays: "RDC", lat: -2.51, lng: 28.86, role: "Départ", mode: "Route" },
      { nom: "Uvira", pays: "RDC", lat: -3.40, lng: 29.14, role: "Escale", mode: "Route" },
      { nom: "Bujumbura", pays: "Burundi", lat: -3.38, lng: 29.36, role: "Arrivée", mode: "Route" },
    ],
    infos: [],
  },
  {
    id: "kivu-lubumbashi",
    titre: "Bukavu, Goma → Lubumbashi",
    sous_titre: "Du Kivu vers le Katanga",
    emoji: "🚛",
    points: [
      { nom: "Goma", pays: "RDC", lat: -1.68, lng: 29.22, role: "Départ" },
      { nom: "Bukavu", pays: "RDC", lat: -2.51, lng: 28.86, role: "Départ", mode: "Route" },
      { nom: "Uvira", pays: "RDC", lat: -3.40, lng: 29.14, role: "Escale", mode: "Route" },
      { nom: "Kalemie", pays: "RDC", lat: -5.93, lng: 29.19, role: "Escale", mode: "Bateau" },
      { nom: "Lubumbashi", pays: "RDC", lat: -11.66, lng: 27.48, role: "Arrivée", mode: "Route" },
    ],
    infos: [],
  },
];

export const trouverExpedition = (id) => EXPEDITIONS.find((e) => e.id === id) || null;

export function roleDuPoint(points, i) {
  return points[i].role || (i === 0 ? "Départ" : i === points.length - 1 ? "Arrivée" : "Escale");
}
