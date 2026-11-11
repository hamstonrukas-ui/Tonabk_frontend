import { useState, useEffect, useRef } from "react";

const PREFIX = "tonabk_cache_";
const DELAI_MAX_MS = 8000;
const DELAI_RELANCE_MS = 20000; // 2e essai, plus patient (serveur qui se réveille, réseau lent)
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
  const actif = !!key && !!url;
  const cacheKey = PREFIX + (key || "desactive");
  const cache = lireCache(cacheKey);

  const [data, setData] = useState(cache?.data ?? null);
  const [loading, setLoading] = useState(!cache);
  const [revalidating, setRevalidating] = useState(!!cache);
  const [erreur, setErreur] = useState(null);
  const [tentative, setTentative] = useState(0); // incrémenté par recharger()
  const optionsRef = useRef(options);
  optionsRef.current = options;

  function revalider(silencieux) {
    const c = lireCache(cacheKey);
    // Une liste vide gardée en cache n'est pas une information fiable : elle ne cache pas une erreur
    const cacheUtile = !!c && !(Array.isArray(c.data) && c.data.length === 0);

    if (!silencieux) {
      setErreur(null);
      if (c) {
        setData(c.data);
        setLoading(false);
        setRevalidating(true);
      } else {
        setData(null); // on n'affiche pas les données d'une autre page/boutique pendant le chargement
        setLoading(true);
        setRevalidating(false);
      }
    } else {
      setRevalidating(true);
    }

    let annule = false;
    let controller = null;
    let minuteur = null;

    const tenter = (delai, derniereChance) => {
      controller = new AbortController();
      minuteur = setTimeout(() => controller.abort(), delai);
      return fetch(url, { ...optionsRef.current, signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error("Réponse serveur invalide");
          return res.json();
        })
        .then((freshData) => {
          clearTimeout(minuteur);
          if (annule) return;
          ecrireCache(cacheKey, freshData);
          setData(freshData);
          setErreur(null);
        })
        .catch(() => {
          clearTimeout(minuteur);
          if (annule) return;
          // Sans données utiles à montrer : 2e essai plus patient avant de signaler un problème
          if (!cacheUtile && !derniereChance) return tenter(DELAI_RELANCE_MS, true);
          if (!cacheUtile) setErreur("Impossible de charger les données");
        });
    };

    tenter(DELAI_MAX_MS, false).finally(() => {
      if (annule) return;
      setLoading(false);
      setRevalidating(false);
    });

    return () => {
      annule = true;
      clearTimeout(minuteur);
      controller?.abort();
    };
  }

  useEffect(() => {
    if (!actif) {
      setData(null);
      setLoading(false);
      setRevalidating(false);
      return;
    }
    const annuler = revalider(false);

    const surRevalidationGlobale = () => revalider(true);
    window.addEventListener(EVENEMENT_REVALIDATION, surRevalidationGlobale);

    return () => {
      annuler && annuler();
      window.removeEventListener(EVENEMENT_REVALIDATION, surRevalidationGlobale);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, url, tentative, ...deps]);

  const recharger = () => setTentative((t) => t + 1);

  return { data, loading, revalidating, erreur, recharger };
}
