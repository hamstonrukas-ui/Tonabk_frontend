// src/admin/AdminClassement.jsx — accessible sur /admin/classement (admin uniquement)
// L'admin choisit une catégorie, coche des articles, choisit une sous-catégorie (+ type) et les range.
// Les articles déjà rangés disparaissent de la liste « À ranger ».
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { API_URL } from "../lib/api";
import { useCachedData } from "../lib/useCachedData";
import ChoixSousCategorie from "../components/ChoixSousCategorie";

const PAR_PAGE = 60;

async function enTetes() {
  const { data: { session } } = await supabase.auth.getSession();
  return { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` };
}

export default function AdminClassement() {
  const { data: categoriesData } = useCachedData("categories", `${API_URL}/api/categories`);
  const categories = categoriesData || [];

  const [categorieId, setCategorieId] = useState(null);
  const [mode, setMode] = useState("a_ranger"); // a_ranger | ranges
  const [produits, setProduits] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selection, setSelection] = useState(() => new Set());
  const [cible, setCible] = useState("");
  const [chargement, setChargement] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  // Sous-catégories (même clé de cache que ChoixSousCategorie) pour afficher le nom de la cible
  const { data: sousCatData } = useCachedData(
    categorieId ? `sous_categories_${categorieId}` : null,
    categorieId ? `${API_URL}/api/sous-categories?categorie_id=${encodeURIComponent(categorieId)}` : null
  );
  const sousCategories = Array.isArray(sousCatData) ? sousCatData : [];
  const noeudCible = sousCategories.find((s) => s.id === cible) || null;
  const parentCible = noeudCible?.parent_id ? sousCategories.find((s) => s.id === noeudCible.parent_id) : null;
  const nomCible = noeudCible ? (parentCible ? `${parentCible.nom} › ${noeudCible.nom}` : noeudCible.nom) : "";

  // Première catégorie sélectionnée par défaut
  useEffect(() => {
    if (!categorieId && categories.length > 0) setCategorieId(categories[0].id);
  }, [categories, categorieId]);

  const charger = useCallback(
    async (p = 1) => {
      if (!categorieId) return;
      setChargement(true);
      setErreur("");
      try {
        const res = await fetch(
          `${API_URL}/api/admin-classement/produits?categorie_id=${encodeURIComponent(categorieId)}&statut=${mode}&page=${p}&limit=${PAR_PAGE}`,
          { headers: await enTetes() }
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Impossible de charger les articles");
        setProduits((prev) => (p === 1 ? data.data : [...prev, ...data.data]));
        setTotal(data.total);
        setPage(p);
      } catch (err) {
        setErreur(err.message);
      } finally {
        setChargement(false);
      }
    },
    [categorieId, mode]
  );

  // Changement de catégorie ou de mode : on repart de zéro
  useEffect(() => {
    setSelection(new Set());
    setCible("");
    setMessage("");
    setProduits([]);
    charger(1);
  }, [charger]);

  const basculer = (id) =>
    setSelection((prev) => {
      const suivant = new Set(prev);
      if (suivant.has(id)) suivant.delete(id);
      else suivant.add(id);
      return suivant;
    });

  const toutSelectionner = () =>
    setSelection((prev) => (prev.size === produits.length ? new Set() : new Set(produits.map((p) => p.id))));

  const classer = async (sousCategorieId) => {
    if (selection.size === 0) return;
    setEnCours(true);
    setErreur("");
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/api/admin-classement/classer`, {
        method: "POST",
        headers: await enTetes(),
        body: JSON.stringify({ produit_ids: [...selection], sous_categorie_id: sousCategorieId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Échec du classement");
      setMessage(
        sousCategorieId
          ? `${data.modifies} article(s) rangé(s) dans « ${nomCible} ».`
          : `${data.modifies} article(s) remis dans « À ranger ».`
      );
      setSelection(new Set());
      await charger(1);
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnCours(false);
    }
  };

  const chip = (actif) =>
    `flex-shrink-0 whitespace-nowrap text-xs font-bold px-3.5 py-1.5 rounded-full ${
      actif ? "bg-[#F5720C] text-white" : "bg-white text-[#1B1B1B] border border-gray-200"
    }`;

  return (
    <div className="p-3 space-y-3">
      <h1 className="text-base font-extrabold text-[#1B1B1B]">Classer les articles</h1>

      {/* Catégorie */}
      <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((c) => (
          <button key={c.id} onClick={() => setCategorieId(c.id)} className={chip(categorieId === c.id)}>
            {c.nom}
          </button>
        ))}
      </div>

      {/* À ranger / Déjà rangés */}
      <div className="flex gap-2">
        <button onClick={() => setMode("a_ranger")} className={chip(mode === "a_ranger")}>À ranger</button>
        <button onClick={() => setMode("ranges")} className={chip(mode === "ranges")}>Déjà rangés</button>
        <span className="text-[11px] text-gray-500 self-center ml-auto">{total} article(s)</span>
      </div>

      {/* Destination */}
      <div className="bg-white rounded-xl p-3 space-y-2">
        <p className="text-[11px] text-gray-500">Ranger les articles cochés dans :</p>
        <ChoixSousCategorie categorieId={categorieId} value={cible} onChange={setCible} />
        {sousCategories.length === 0 && categorieId && (
          <p className="text-[11px] text-gray-400">Cette catégorie n'a pas encore de sous-catégories.</p>
        )}
      </div>

      {message && <p className="text-xs text-green-600">{message}</p>}
      {erreur && <p className="text-xs text-red-500">{erreur}</p>}

      {/* Barre d'action */}
      <div className="sticky top-0 z-10 bg-[#F3F3F3] py-2 flex items-center gap-2">
        <button onClick={toutSelectionner} className="text-xs font-semibold text-[#F5720C] flex-shrink-0">
          {selection.size === produits.length && produits.length > 0 ? "Tout décocher" : "Tout cocher"}
        </button>
        <span className="text-[11px] text-gray-500 flex-shrink-0">{selection.size} coché(s)</span>
        <button
          onClick={() => classer(cible)}
          disabled={enCours || selection.size === 0 || !cible}
          className="ml-auto bg-[#F5720C] text-white text-xs font-semibold rounded-md px-3 py-2 disabled:opacity-40 truncate max-w-[55%]"
        >
          {enCours ? "Classement..." : cible ? `Ranger dans ${nomCible}` : "Choisir une destination"}
        </button>
      </div>
      {mode === "ranges" && selection.size > 0 && (
        <button
          onClick={() => classer(null)}
          disabled={enCours}
          className="text-xs font-semibold text-red-500 disabled:opacity-40"
        >
          Remettre les {selection.size} article(s) cochés dans « À ranger »
        </button>
      )}

      {/* Articles */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {produits.map((p) => {
          const coche = selection.has(p.id);
          return (
            <button
              key={p.id}
              onClick={() => basculer(p.id)}
              className={`relative bg-white rounded-xl overflow-hidden shadow-sm text-left ${
                coche ? "ring-2 ring-[#F5720C]" : ""
              }`}
            >
              {p.photo_thumb_url || p.photo_url ? (
                <img src={p.photo_thumb_url || p.photo_url} alt="" loading="lazy" className="w-full aspect-square object-cover" />
              ) : (
                <div className="w-full aspect-square bg-gray-100" />
              )}
              {coche && (
                <span className="absolute top-1 right-1 bg-[#F5720C] text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  ✓
                </span>
              )}
              <div className="p-1.5">
                <p className="text-[11px] font-semibold text-[#1B1B1B] truncate">{p.nom}</p>
                <p className="text-[10px] text-gray-400 truncate">{p.boutiques?.nom}</p>
                {mode === "ranges" && p.sous_categories?.nom && (
                  <p className="text-[10px] text-[#F5720C] truncate">{p.sous_categories.nom}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {!chargement && produits.length === 0 && !erreur && (
        <p className="text-center text-xs text-gray-400 py-8">
          {mode === "a_ranger" ? "Tous les articles de cette catégorie sont rangés. 🎉" : "Aucun article rangé pour le moment."}
        </p>
      )}
      {chargement && <p className="text-center text-xs text-gray-400 py-4">Chargement...</p>}
      {!chargement && produits.length < total && (
        <button
          onClick={() => charger(page + 1)}
          className="w-full bg-white border border-gray-200 text-xs font-semibold rounded-md py-2.5"
        >
          Charger plus ({total - produits.length} restants)
        </button>
      )}
    </div>
  );
}
