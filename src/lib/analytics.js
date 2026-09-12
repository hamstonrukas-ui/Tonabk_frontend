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

// Envoi "silencieux" — on ne bloque jamais l'utilisateur si ça échoue (réseau instable)
export function enregistrerClicWhatsapp(cibleType, cibleId) {
  fetch(`${API_URL}/api/analytics/clic-whatsapp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cible_type: cibleType,
      cible_id: cibleId,
      session_id: getVisitorId(),
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cible_type: cibleType,
      cible_id: cibleId,
      session_id: getVisitorId(),
    }),
  }).catch(() => {});
                                         }
