import { API_URL } from "./api";

// Identifiant persistant du visiteur (survit à la fermeture du navigateur,
// contrairement à sessionStorage) — indispensable pour calculer le retour
// des visiteurs et le taux de rétention.
function getVisitorId() {
  let id = localStorage.getItem("tonabk_visitor_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("tonabk_visitor_id", id);
  }
  return id;
}

// Une « visite » = une session de navigateur (se termine à la fermeture de l'onglet)
function getVisiteId() {
  let id = sessionStorage.getItem("tonabk_visite_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("tonabk_visite_id", id);
  }
  return id;
}

function detecterAppareil() {
  const ua = navigator.userAgent || "";
  if (/iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return "tablette";
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return "mobile";
  return "ordinateur";
}

// D'où vient la visite : lien ?utm_source=..., sinon site précédent, sinon accès direct ou app installée
function detecterSource() {
  const cle = "tonabk_source";
  let source = sessionStorage.getItem(cle);
  if (source) return source;

  const params = new URLSearchParams(location.search);
  const marque = (params.get("utm_source") || params.get("src") || "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 30);
  if (marque) {
    source = marque;
  } else {
    let hote = "";
    try { hote = document.referrer ? new URL(document.referrer).hostname.toLowerCase() : ""; } catch { /* ignore */ }
    if (!hote || hote === location.hostname) {
      source = window.matchMedia?.("(display-mode: standalone)").matches ? "app" : "direct";
    } else if (/whatsapp|wa\.me/.test(hote)) source = "whatsapp";
    else if (/facebook|fb\.com|fb\.me/.test(hote)) source = "facebook";
    else if (/tiktok/.test(hote)) source = "tiktok";
    else if (/instagram/.test(hote)) source = "instagram";
    else if (/google/.test(hote)) source = "google";
    else source = "autre";
  }
  sessionStorage.setItem(cle, source);
  return source;
}

const contexte = () => ({
  session_id: getVisitorId(),
  visite_id: getVisiteId(),
  appareil: detecterAppareil(),
  source: detecterSource(),
});

function envoyer(chemin, donnees) {
  fetch(`${API_URL}/api/analytics/${chemin}`, {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(donnees),
  }).catch(() => {});
}

// Page consultée (appelée à chaque changement de page)
export function enregistrerPageVue(chemin) {
  envoyer("evenement", { type: "page_vue", chemin, ...contexte() });
}

// Temps réellement passé à l'écran : on envoie le temps écoulé quand l'onglet se cache, et chaque minute
let suiviDureeDemarre = false;
export function demarrerSuiviDuree() {
  if (suiviDureeDemarre) return;
  suiviDureeDemarre = true;

  let visibleDepuis = document.visibilityState === "visible" ? Date.now() : null;

  const envoyerDuree = () => {
    if (visibleDepuis === null) return;
    const maintenant = Date.now();
    const secondes = Math.round((maintenant - visibleDepuis) / 1000);
    visibleDepuis = document.visibilityState === "visible" ? maintenant : null;
    if (secondes >= 1) envoyer("evenement", { type: "duree", duree_secondes: Math.min(secondes, 1800), ...contexte() });
  };

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") envoyerDuree();
    else visibleDepuis = Date.now();
  });
  window.addEventListener("pagehide", envoyerDuree);
  setInterval(() => { if (document.visibilityState === "visible") envoyerDuree(); }, 60000);
}

// Envoi "silencieux" — on ne bloque jamais l'utilisateur si ça échoue (réseau instable)
export function enregistrerClicWhatsapp(cibleType, cibleId) {
  // keepalive : la requête continue même si le téléphone bascule aussitôt vers WhatsApp.
  // Sans ça, le navigateur l'annule souvent en route et le clic n'est jamais compté.
  fetch(`${API_URL}/api/analytics/clic-whatsapp`, {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cible_type: cibleType,
      cible_id: cibleId,
      session_id: getVisitorId(),
      visite_id: getVisiteId(),
    }),
  }).catch(() => {});
}

// Une visite = une session de navigateur (pas à chaque changement de page).
// cibleType/cibleId permettent de savoir SI la visite concerne une boutique
// précise (ex: "boutique", boutique.id) ou le site en général (valeurs par défaut).
const CLE_SESSION_VISITE = "tonabk_visite_enregistree";

export function enregistrerVisiteSession(cibleType = "site", cibleId = null) {
  const cleUnique = `${CLE_SESSION_VISITE}_${cibleType}_${cibleId ?? "global"}`;
  if (sessionStorage.getItem(cleUnique)) return;
  sessionStorage.setItem(cleUnique, "1");

  fetch(`${API_URL}/api/analytics/visite`, {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cible_type: cibleType,
      cible_id: cibleId,
      ...contexte(),
    }),
  }).catch(() => {});
}
