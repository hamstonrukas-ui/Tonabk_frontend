// Les trajets d'expédition de colis. Pour modifier un itinéraire, une étape ou ajouter des informations,
// changez ce fichier : la carte et les pages se mettent à jour toutes seules.
//
// points : de l'origine à la destination finale (lat / lng = position réelle de la ville).
//   role (facultatif) : "Départ", "Escale" ou "Arrivée". Sans role : premier = Départ, dernier = Arrivée, les autres = Escale.
//   lointain (facultatif) : true pour un point très éloigné (la Chine) : il est placé au bord de la carte.
//   mode (facultatif) : comment le colis voyage jusqu'à ce point (ex. "Bateau", "Route", "Avion").
// infos : les renseignements à afficher sous la carte, par exemple
//   { titre: "Délais", texte: "10 à 15 jours" }, { titre: "Tarifs", texte: "…" }
//   (liste vide = la page affiche « Informations bientôt disponibles »).
//
// ⚠️ Les itinéraires ci-dessous sont INDICATIFS : corrigez les escales selon votre vrai circuit.

export const NUMERO_WHATSAPP_EXPEDITION = "243855841999";

const INFOS_CHINE = [
  {
    titre: "Comment ça marche ?",
    texte: "Vous voulez acheter des marchandises en Chine ?\n1. Choisissez vos produits et contactez le vendeur sur Alibaba.\n2. Faites votre achat.\n3. Informez Tona Company sur WhatsApp : nous vous donnons l'adresse de notre entrepôt en Chine, où le vendeur doit livrer vos achats.\n4. Nous nous occupons ensuite de l'expédition de vos colis jusqu'à vous.",
  },
  {
    titre: "Choisissez votre transport",
    texte: "✈️ Avion express : 4 à 6 jours\n✈️ Avion normal : 1 à 3 semaines\n🚢 Bateau : 45 à 60 jours (le moins cher)",
  },
  {
    titre: "Si vous choisissez le bateau",
    texte: "Vos colis arrivent d'abord au port de Dar es Salaam ou de Mombasa. De là, ils partent vers Uvira ou vers Goma.",
  },
  {
    titre: "N.B",
    texte: "Nous vous informons en temps réel de l'avancée de votre colis, jusqu'à son arrivée.",
  },
];

export const EXPEDITIONS = [
  {
    id: "chine-rdc",
    titre: "Chine → RDC",
    sous_titre: "Via Mombasa et l'Ouganda, jusqu'à Goma",
    emoji: "🚢",
    points: [
      // lointain : true = la Chine est placée au bord de la carte, dans sa direction réelle
      { nom: "Chine", pays: "Guangzhou", lat: 23.13, lng: 113.26, role: "Départ", lointain: true },
      { nom: "Mombasa", pays: "Kenya", lat: -4.04, lng: 39.67, role: "Escale", mode: "Bateau" },
      { nom: "Kampala", pays: "Ouganda", lat: 0.35, lng: 32.58, role: "Escale", mode: "Route" },
      { nom: "Goma", pays: "RDC", lat: -1.68, lng: 29.22, role: "Arrivée", mode: "Route" },
    ],
    infos: INFOS_CHINE,
  },
  {
    id: "chine-uvira",
    titre: "Chine → Uvira",
    sous_titre: "Via Dar es Salaam et le Burundi",
    emoji: "🚢",
    points: [
      { nom: "Chine", pays: "Guangzhou", lat: 23.13, lng: 113.26, role: "Départ", lointain: true },
      { nom: "Dar es Salaam", pays: "Tanzanie", lat: -6.79, lng: 39.21, role: "Escale", mode: "Bateau" },
      { nom: "Bujumbura", pays: "Burundi", lat: -3.38, lng: 29.36, role: "Escale", mode: "Route" },
      { nom: "Uvira", pays: "RDC", lat: -3.40, lng: 29.14, role: "Arrivée", mode: "Route" },
    ],
    infos: INFOS_CHINE,
  },
  {
    id: "kivu-kalemie",
    titre: "Bukavu, Goma, Burundi → Kalemie",
    sous_titre: "Vers Kalemie par Uvira et le lac Tanganyika",
    emoji: "⛴️",
    points: [
      { nom: "Goma", pays: "RDC", lat: -1.68, lng: 29.22, role: "Départ" },
      { nom: "Bukavu", pays: "RDC", lat: -2.51, lng: 28.86, role: "Départ", mode: "Route" },
      { nom: "Bujumbura", pays: "Burundi", lat: -3.38, lng: 29.36, role: "Départ", mode: "Route" },
      { nom: "Uvira", pays: "RDC", lat: -3.40, lng: 29.14, role: "Escale", mode: "Route" },
      { nom: "Kalemie", pays: "RDC", lat: -5.93, lng: 29.19, role: "Arrivée", mode: "Bateau" },
    ],
    infos: [
      {
        titre: "Comment ça marche ?",
        texte: "Vous avez des colis à Bukavu, à Goma ou au Burundi ?\n1. Contactez Tona Company sur WhatsApp.\n2. Nous rassemblons vos colis et les chargeons dans une voiture vers Uvira.\n3. À Uvira, les colis embarquent sur un bateau vers Kalemie.\n4. Nous vous livrons à votre adresse à Kalemie.",
      },
      { titre: "Frais de dédouanement", texte: "Les frais de dédouanement sont inclus." },
    ],
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
    infos: [
      {
        titre: "Comment ça marche ?",
        texte: "Vous avez des marchandises à Bukavu ou à Goma ?\n1. Contactez Tona Company sur WhatsApp et donnez-nous l'adresse où se trouvent vos marchandises.\n2. Notre équipe vient les récupérer et prépare vos colis.\n3. Les colis partent en voiture vers Uvira, puis changent de voiture pour aller au Burundi.\n4. Au Burundi, nous vous livrons à votre adresse.",
      },
    ],
  },
  {
    id: "kivu-lubumbashi",
    titre: "Bukavu, Goma, Burundi → Lubumbashi",
    sous_titre: "Du Kivu vers le Katanga",
    emoji: "🚛",
    points: [
      { nom: "Goma", pays: "RDC", lat: -1.68, lng: 29.22, role: "Départ" },
      { nom: "Bukavu", pays: "RDC", lat: -2.51, lng: 28.86, role: "Départ", mode: "Route" },
      { nom: "Bujumbura", pays: "Burundi", lat: -3.38, lng: 29.36, role: "Départ", mode: "Route" },
      { nom: "Uvira", pays: "RDC", lat: -3.40, lng: 29.14, role: "Escale", mode: "Route" },
      { nom: "Kalemie", pays: "RDC", lat: -5.93, lng: 29.19, role: "Escale", mode: "Bateau" },
      { nom: "Lubumbashi", pays: "RDC", lat: -11.66, lng: 27.48, role: "Arrivée", mode: "Bateau ou route" },
    ],
    infos: [
      {
        titre: "Comment ça marche ?",
        texte: "Vous avez des colis à Bukavu, à Goma ou au Burundi ?\n1. Contactez Tona Company sur WhatsApp.\n2. Nous rassemblons vos colis et les chargeons dans une voiture vers Uvira.\n3. À Uvira, les colis embarquent sur un bateau vers Kalemie.\n4. De Kalemie, nous transportons vos colis jusqu'à Lubumbashi, par bateau ou par voiture, selon votre choix.\n5. Nous vous livrons à votre adresse à Lubumbashi.",
      },
      { titre: "Frais de dédouanement", texte: "Les frais de dédouanement sont inclus." },
    ],
  },
];

export const trouverExpedition = (id) => EXPEDITIONS.find((e) => e.id === id) || null;

export function roleDuPoint(points, i) {
  return points[i].role || (i === 0 ? "Départ" : i === points.length - 1 ? "Arrivée" : "Escale");
}
