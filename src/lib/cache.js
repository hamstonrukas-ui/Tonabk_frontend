// Utilitaire de "fetch avec cache de secours" — pensé pour une connexion instable.
// Essaie le réseau d'abord ; si ça échoue ou prend trop longtemps, retombe sur
// la dernière version sauvegardée localement plutôt que de casser l'affichage.

const PREFIX = "tonabk_cache_";
const DELAI_MAX_MS = 8000; // au-delà, on considère la connexion trop lente

function lireCache(cacheKey) {
  try {
    const brut = localStorage.getItem(cacheKey);
    if (!brut) return null;
    return JSON.parse(brut);
  } catch {
    return null;
  }
}

function ecrireCache(cacheKey, data) {
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // Stockage plein ou indisponible — on continue sans casser l'app
  }
}

/**
 * @param {string} key - identifiant unique pour ce cache (ex: "produits_accueil")
 * @param {string} url - URL à appeler
 * @param {object} options - options fetch (headers, method...)
 * @returns {Promise<{ data: any, depuisCache: boolean, ageMs?: number }>}
 */
export async function cachedFetch(key, url, options = {}) {
  const cacheKey = PREFIX + key;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DELAI_MAX_MS);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error("Réponse serveur invalide");

    const data = await res.json();
    ecrireCache(cacheKey, data);
    return { data, depuisCache: false };
  } catch (err) {
    clearTimeout(timeout);
    const cache = lireCache(cacheKey);
    if (cache) {
      return { data: cache.data, depuisCache: true, ageMs: Date.now() - cache.ts };
    }
    throw err; // Rien en cache non plus — l'erreur remonte normalement (ex: premier chargement)
  }
}
