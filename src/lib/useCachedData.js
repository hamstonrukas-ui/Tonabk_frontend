import { useState, useEffect, useRef } from "react";

const PREFIX = "tonabk_cache_";
const DELAI_MAX_MS = 8000;
const EVENEMENT_REVALIDATION = "tonabk:revalidate";

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
 * Affiche instantanément la dernière version connue, puis rafraîchit
 * discrètement au montage ET chaque fois qu'un rafraîchissement global
 * est déclenché (3s après l'ouverture de l'app, ou au retour de connexion).
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

  function revalider(silencieux) {
    const c = lireCache(cacheKey);
    if (!silencieux) {
      if (c) {
        setData(c.data);
        setLoading(false);
        setRevalidating(true);
      } else {
        setLoading(true);
        setRevalidating(false);
      }
    } else {
      setRevalidating(true);
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
  }

  useEffect(() => {
    const annuler = revalider(false);

    const surRevalidationGlobale = () => revalider(true);
    window.addEventListener(EVENEMENT_REVALIDATION, surRevalidationGlobale);

    return () => {
      annuler && annuler();
      window.removeEventListener(EVENEMENT_REVALIDATION, surRevalidationGlobale);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, url, ...deps]);

  return { data, loading, revalidating, erreur };
}
  
