// Sensibilisation terrain : retient quel agent a fait venir la personne (adresse tonabk.com/<code>)
// et compte ses actions (installation, WhatsApp, Livre-moi, colis). Anonyme : aucun nom, aucun numéro.
import { API_URL } from "./api";

const CLE_AGENT = "tonabk_agent";
const CLE_VISITEUR = "tonabk_visiteur";
const lire = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const ecrire = (k, v) => { try { localStorage.setItem(k, v); } catch {} };

export function agentActuel() {
  return lire(CLE_AGENT);
}
export function retenirAgent(code) {
  ecrire(CLE_AGENT, code);
}
export function idVisiteur() {
  let id = lire(CLE_VISITEUR);
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`);
    ecrire(CLE_VISITEUR, id);
  }
  return id;
}

// --- Identification du téléphone (marque, modèle, empreinte) : empêche de gonfler les chiffres ---
function marqueDepuis(ua, modele) {
  const t = `${modele || ""} ${ua}`;
  if (/iPhone|iPad/i.test(ua)) return "Apple";
  if (/SM-|SAMSUNG|Galaxy/i.test(t)) return "Samsung";
  if (/TECNO/i.test(t)) return "Tecno";
  if (/Infinix/i.test(t)) return "Infinix";
  if (/itel/i.test(t)) return "itel";
  if (/Redmi|Xiaomi|POCO|\bM\d{4}[A-Z0-9]+/i.test(t)) return "Xiaomi";
  if (/HUAWEI|HONOR|\bHRY|\bLLD|\bJSN/i.test(t)) return "Huawei/Honor";
  if (/OPPO|CPH\d/i.test(t)) return "Oppo";
  if (/vivo/i.test(t)) return "Vivo";
  if (/realme|RMX/i.test(t)) return "Realme";
  if (/OnePlus/i.test(t)) return "OnePlus";
  if (/Pixel/i.test(t)) return "Google";
  if (/Android/i.test(ua)) return "Android (autre)";
  return "Ordinateur";
}
let appareilCache = null;
async function appareil() {
  if (appareilCache) return appareilCache;
  const ua = navigator.userAgent || "";
  let modele = "";
  try {
    const h = await navigator.userAgentData?.getHighEntropyValues?.(["model", "platformVersion"]);
    modele = h?.model || "";
  } catch {}
  if (!modele) { const m = ua.match(/;\s*([^;)]+?)\s+Build/) || ua.match(/Android[^;]*;\s*([^;)]+)\)/); modele = m ? m[1].trim() : (/iPhone/.test(ua) ? "iPhone" : ""); }
  const ecran = `${screen.width}x${screen.height}@${window.devicePixelRatio || 1}`;
  const brut = [modele, ecran, navigator.hardwareConcurrency || "", navigator.deviceMemory || "", navigator.platform || "",
    Intl.DateTimeFormat().resolvedOptions().timeZone || "", navigator.language || "", screen.colorDepth || ""].join("|");
  let empreinte = "";
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(brut));
    empreinte = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
  } catch {}
  appareilCache = { marque: marqueDepuis(ua, modele), modele: modele.slice(0, 60), ecran, empreinte };
  return appareilCache;
}

// type : visite | installation | whatsapp | livraison | colis — renvoie true si l'adresse est connue
export async function noterEvenement(type, code = agentActuel()) {
  if (!code) return false;
  // Une seule fois par personne et par type (une visite par jour) : on mesure des personnes, pas des clics
  const marque = `tonabk_evt_${type}_${code}`;
  const jour = new Date().toISOString().slice(0, 10);
  if (lire(marque) === (type === "visite" ? jour : "1")) return true;
  try {
    const r = await fetch(`${API_URL}/api/sensibilisation/evenement`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, type, visiteur: idVisiteur(), ...(await appareil()) }),
    });
    if (r.status === 404) { try { localStorage.removeItem(CLE_AGENT); } catch {} return false; }
    if (r.ok) ecrire(marque, type === "visite" ? jour : "1");
    return r.ok;
  } catch { return false; }
}

// Écoutes globales (chargées une fois au démarrage de l'app)
if (typeof window !== "undefined" && !window.__tonabkAgent) {
  window.__tonabkAgent = true;
  window.addEventListener("appinstalled", () => { noterEvenement("installation"); });
  // Contact WhatsApp avec un numéro précis (hors simples partages "wa.me/?text=")
  const ouvrir = window.open;
  window.open = function (url, ...reste) {
    try { if (/wa\.me\/\d/.test(String(url))) noterEvenement("whatsapp"); } catch {}
    return ouvrir.call(window, url, ...reste);
  };
}
