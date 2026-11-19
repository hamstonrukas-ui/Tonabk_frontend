// Les trajets d'expédition de colis. Pour modifier un itinéraire, une étape ou les informations,
// changez ce fichier : la carte et les pages se mettent à jour toutes seules.
//
// Chaque trajet a une ou plusieurs CARTES (variantes). S'il y en a plusieurs, la page affiche des onglets pour choisir.
//   variantes : [{ nom, icone, points: [...] }]
// points : de l'origine à la destination finale (lat / lng = position réelle de la ville).
//   role (facultatif) : "Départ", "Escale" ou "Arrivée". Sans role : premier = Départ, dernier = Arrivée, les autres = Escale.
//   lointain (facultatif) : true pour un point très éloigné (la Chine) : il est placé au bord de la carte.
//   mode (facultatif) : comment le colis voyage jusqu'à ce point (ex. "Bateau", "Route", "Avion").
// infos : les renseignements affichés sous la carte : { titre: "Délais", texte: "10 à 15 jours" }
//   (liste vide = la page affiche « Informations bientôt disponibles »).

export const NUMERO_WHATSAPP_EXPEDITION = "243855841999";

const CHINE = { nom: "Chine", pays: "Guangzhou", lat: 23.13, lng: 113.26, role: "Départ", lointain: true };
const GOMA = { nom: "Goma", pays: "RDC", lat: -1.68, lng: 29.22 };
const BUKAVU = { nom: "Bukavu", pays: "RDC", lat: -2.51, lng: 28.86 };
const BUJUMBURA = { nom: "Bujumbura", pays: "Burundi", lat: -3.38, lng: 29.36 };
const UVIRA = { nom: "Uvira", pays: "RDC", lat: -3.40, lng: 29.14 };
const KALEMIE = { nom: "Kalemie", pays: "RDC", lat: -5.93, lng: 29.19 };
const LUBUMBASHI = { nom: "Lubumbashi", pays: "RDC", lat: -11.66, lng: 27.48 };

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

const INFOS_KALEMIE = [
  {
    titre: "Comment ça marche ?",
    texte: "Vous avez des colis à Bukavu, à Goma ou au Burundi ?\n1. Contactez Tona Company sur WhatsApp.\n2. Nous rassemblons vos colis et les chargeons dans une voiture vers Uvira.\n3. À Uvira, les colis embarquent sur un bateau vers Kalemie.\n4. Nous vous livrons à votre adresse à Kalemie.",
  },
  { titre: "Frais de dédouanement", texte: "Les frais de dédouanement sont inclus." },
];

const INFOS_LUBUMBASHI = [
  {
    titre: "Comment ça marche ?",
    texte: "Vous avez des colis à Bukavu, à Goma ou au Burundi ?\n1. Contactez Tona Company sur WhatsApp.\n2. Nous rassemblons vos colis et les chargeons dans une voiture vers Uvira.\n3. À Uvira, les colis embarquent sur un bateau vers Kalemie.\n4. De Kalemie, nous transportons vos colis jusqu'à Lubumbashi, par bateau ou par voiture, selon votre choix.\n5. Nous vous livrons à votre adresse à Lubumbashi.",
  },
  { titre: "Frais de dédouanement", texte: "Les frais de dédouanement sont inclus." },
];

export const EXPEDITIONS = [
  {
    id: "chine-rdc",
    titre: "Chine → RDC",
    sous_titre: "3 itinéraires : 2 par bateau, 1 par avion",
    emoji: "🚢",
    variantes: [
      {
        nom: "Bateau · Dar es Salaam → Uvira", icone: "🚢",
        points: [
          CHINE,
          { nom: "Dar es Salaam", pays: "Tanzanie", lat: -6.79, lng: 39.21, role: "Escale", mode: "Bateau" },
          { ...BUJUMBURA, role: "Escale", mode: "Route" },
          { ...UVIRA, role: "Arrivée", mode: "Route" },
        ],
      },
      {
        nom: "Bateau · Mombasa → Goma", icone: "🚢",
        points: [
          CHINE,
          { nom: "Mombasa", pays: "Kenya", lat: -4.04, lng: 39.67, role: "Escale", mode: "Bateau" },
          { nom: "Kampala", pays: "Ouganda", lat: 0.35, lng: 32.58, role: "Escale", mode: "Route" },
          { ...GOMA, role: "Arrivée", mode: "Route" },
        ],
      },
      {
        nom: "Avion · Addis-Abeba → Goma", icone: "✈️",
        points: [
          CHINE,
          { nom: "Addis-Abeba", pays: "Éthiopie", lat: 9.03, lng: 38.74, role: "Escale", mode: "Avion" },
          { nom: "Kampala", pays: "Ouganda", lat: 0.35, lng: 32.58, role: "Escale", mode: "Avion" },
          { ...GOMA, role: "Arrivée", mode: "Route" },
        ],
      },
    ],
    infos: INFOS_CHINE,
  },
  {
    id: "kivu-kalemie",
    titre: "Bukavu, Goma, Burundi → Kalemie",
    sous_titre: "2 itinéraires : depuis le Kivu ou depuis le Burundi",
    emoji: "⛴️",
    variantes: [
      {
        nom: "Depuis Bukavu et Goma", icone: "🚚",
        points: [
          { ...GOMA, role: "Départ" },
          { ...BUKAVU, role: "Départ", mode: "Route" },
          { ...UVIRA, role: "Escale", mode: "Route" },
          { ...KALEMIE, role: "Arrivée", mode: "Bateau" },
        ],
      },
      {
        nom: "Depuis le Burundi", icone: "🚚",
        points: [
          { ...BUJUMBURA, role: "Départ" },
          { ...UVIRA, role: "Escale", mode: "Route" },
          { ...KALEMIE, role: "Arrivée", mode: "Bateau" },
        ],
      },
    ],
    infos: INFOS_KALEMIE,
  },
  {
    id: "kivu-burundi",
    titre: "Bukavu, Goma → Burundi",
    sous_titre: "Vers Bujumbura et le Burundi",
    emoji: "🚐",
    variantes: [
      {
        nom: "Bukavu, Goma → Burundi", icone: "🚐",
        points: [
          { ...GOMA, role: "Départ" },
          { ...BUKAVU, role: "Départ", mode: "Route" },
          { ...UVIRA, role: "Escale", mode: "Route" },
          { ...BUJUMBURA, role: "Arrivée", mode: "Route" },
        ],
      },
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
    sous_titre: "2 itinéraires : depuis le Kivu ou depuis le Burundi",
    emoji: "🚛",
    variantes: [
      {
        nom: "Depuis Bukavu et Goma", icone: "🚚",
        points: [
          { ...GOMA, role: "Départ" },
          { ...BUKAVU, role: "Départ", mode: "Route" },
          { ...UVIRA, role: "Escale", mode: "Route" },
          { ...KALEMIE, role: "Escale", mode: "Bateau" },
          { ...LUBUMBASHI, role: "Arrivée", mode: "Bateau ou route" },
        ],
      },
      {
        nom: "Depuis le Burundi", icone: "🚚",
        points: [
          { ...BUJUMBURA, role: "Départ" },
          { ...UVIRA, role: "Escale", mode: "Route" },
          { ...KALEMIE, role: "Escale", mode: "Bateau" },
          { ...LUBUMBASHI, role: "Arrivée", mode: "Bateau ou route" },
        ],
      },
    ],
    infos: INFOS_LUBUMBASHI,
  },
];

export const trouverExpedition = (id) => EXPEDITIONS.find((e) => e.id === id) || null;

export function roleDuPoint(points, i) {
  return points[i].role || (i === 0 ? "Départ" : i === points.length - 1 ? "Arrivée" : "Escale");
}
