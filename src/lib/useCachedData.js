import { useState, useEffect, useRef } from "react";

const PREFIX = "tonabk_cache_";
const DELAI_MAX_MS = 8000;

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
 * Hook "cache d'abord, réseau en silence derrière" (stale-while-revalidate).
 * Affiche instantanément la dernière version connue (si elle existe), puis
 * rafraîchit discrètement dès que le réseau répond — sans jamais bloquer
 * l'affichage sur une connexion lente ou instable.
 *
 * @param {string} key - identifiant unique du cache (ex: "produits_accueil")
 * @param {string} url - URL à appeler
 * @param {object} options - options fetch (headers...)
 * @param {any[]} deps - dépendances qui déclenchent un nouveau chargement (ex: [boutiqueId])
 */
export function useCachedData(key, url, options = {}, deps = []) {
  const cacheKey = PREFIX + key;
  const cache = lireCache(cacheKey);

  const [data, setData] = useState(cache?.data ?? null);
  const [loading, setLoading] = useState(!cache);
  const [revalidating, setRevalidating] = useState(!!cache);
  const [erreur, setErreur] = useState(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const c = lireCache(cacheKey);
    if (c) {
      setData(c.data);
      setLoading(false);
      setRevalidating(true);
    } else {
      setLoading(true);
      setRevalidating(false);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DELAI_MAX_MS);

    fetch(url, { ...optionsRef.current, signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Réponse serveur invalide");
        return res.json();
      })
      .then((freshData) => {
        clearTimeout(timeout);
        ecrireCache(cacheKey, freshData);
        setData(freshData);
        setErreur(null);
      })
      .catch(() => {
        clearTimeout(timeout);
        if (!c) setErreur("Impossible de charger les données");
      })
      .finally(() => {
        setLoading(false);
        setRevalidating(false);
      });

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, url, ...deps]);

  return { data, loading, revalidating, erreur };
}
