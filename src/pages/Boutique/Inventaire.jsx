import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Minus, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { API_URL } from "../../lib/api";

const MAX_SUIVIS = 10;

export default function Inventaire() {
  const navigate = useNavigate();
  const [produits, setProduits] = useState(null);
  const [erreur, setErreur] = useState("");
  const [produitOuvert, setProduitOuvert] = useState(null);
  const [mouvements, setMouvements] = useState([]);

  const [type, setType] = useState("achat");
  const [quantite, setQuantite] = useState("");
  const [prixUnitaire, setPrixUnitaire] = useState("");
  const [note, setNote] = useState("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  async function authHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/inscription?redirect=/boutique/inventaire");
      return null;
    }
    return { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` };
  }

  async function charger() {
    const headers = await authHeaders();
    if (!headers) return;

    const controleur = new AbortController();
    const delai = setTimeout(() => controleur.abort(), 15000);

    try {
      const res = await fetch(`${API_URL}/api/inventaire/produits`, { headers, signal: controleur.signal });
      if (res.ok) {
        setProduits(await res.json());
      } else {
        const data = await res.json().catch(() => ({}));
        setErreur(data.error || "Impossible de charger l'inventaire (erreur serveur).");
        setProduits([]);
      }
    } catch (err) {
      setErreur(
        err.name === "AbortError"
          ? "Le serveur met trop de temps à répondre. Réessayez dans un instant."
          : "Impossible de contacter le serveur. Vérifiez votre connexion."
      );
      setProduits([]);
    } finally {
      clearTimeout(delai);
    }
  }

  useEffect(() => { charger(); }, []);

  const nbSuivis = (produits || []).filter((p) => p.inventaire_actif).length;

  const toggleSuivi = async (p) => {
    setErreur("");
    const headers = await authHeaders();
    if (!headers) return;

    const res = await fetch(`${API_URL}/api/inventaire/produits/${p.id}/suivi`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ actif: !p.inventaire_actif }),
    });

    if (res.ok) {
      charger();
    } else {
      const data = await res.json().catch(() => ({}));
      setErreur(data.error || "Échec de l'opération");
    }
  };

  const ouvrirProduit = async (id) => {
    if (produitOuvert === id) { setProduitOuvert(null); return; }
    setProduitOuvert(id);
    setType("achat"); setQuantite(""); setPrixUnitaire(""); setNote("");

    const headers = await authHeaders();
    if (!headers) return;
    const res = await fetch(`${API_URL}/api/inventaire/produits/${id}/mouvements`, { headers });
    if (res.ok) setMouvements(await res.json());
  };

  const ajouterMouvement = async (e, produitId) => {
    e.preventDefault();
    setErreur("");
    if (!quantite || Number(quantite) <= 0) { setErreur("Quantité invalide"); return; }
    setEnvoiEnCours(true);

    const headers = await authHeaders();
    if (!headers) { setEnvoiEnCours(false); return; }

    const res = await fetch(`${API_URL}/api/inventaire/produits/${produitId}/mouvements`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        type,
        quantite: Number(quantite),
        prix_unitaire: prixUnitaire ? Number(prixUnitaire) : null,
        note: note.trim() || null,
      }),
    });

    if (res.ok) {
      setQuantite(""); setPrixUnitaire(""); setNote("");
      await ouvrirProduitRefresh(produitId);
      charger();
    } else {
      const data = await res.json().catch(() => ({}));
      setErreur(data.error || "Échec de l'ajout");
    }
    setEnvoiEnCours(false);
  };

  const ouvrirProduitRefresh = async (id) => {
    const headers = await authHeaders();
    if (!headers) return;
    const res = await fetch(`${API_URL}/api/inventaire/produits/${id}/mouvements`, { headers });
    if (res.ok) setMouvements(await res.json());
  };

  const supprimerMouvement = async (mouvementId, produitId) => {
    const headers = await authHeaders();
    if (!headers) return;
    await fetch(`${API_URL}/api/inventaire/mouvements/${mouvementId}`, { method: "DELETE", headers });
    ouvrirProduitRefresh(produitId);
    charger();
  };

  if (produits === null) return <p className="text-center text-sm text-gray-400 py-10">Chargement...</p>;

  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-1">
        <Link to="/boutique/gerer" className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
          <ArrowLeft size={16} />
        </Link>
        <p className="text-sm font-bold text-[#1B1B1B]">Inventaire</p>
      </div>
      <p className="text-[11px] text-gray-400 mb-3 ml-10">
        {nbSuivis}/{MAX_SUIVIS} produits suivis — carnet interne, invisible des acheteurs
      </p>

      {erreur && <p className="text-xs text-red-500 mb-2">{erreur}</p>}

      <div className="space-y-2">
        {(produits || []).map((p) => (
          <div key={p.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
            <div className="flex items-center gap-2.5 p-2.5">
              <div className="w-10 h-10 rounded-lg bg-[#F6F6F6] flex-shrink-0 overflow-hidden flex items-center justify-center text-lg">
                {p.photo_thumb_url || p.photo_url ? (
                  <img src={p.photo_thumb_url || p.photo_url} className="w-full h-full object-cover" />
                ) : "📦"}
              </div>
              <p className="text-[12.5px] font-medium flex-1 truncate">{p.nom}</p>

              {p.inventaire_actif && (
                <span className="text-[11px] font-bold text-[#F5720C]">{p.quantite_inventaire} en carnet</span>
              )}

              <button
                onClick={() => toggleSuivi(p)}
                className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-full flex-shrink-0 ${
                  p.inventaire_actif ? "bg-gray-100 text-gray-500" : "bg-[#F5720C] text-white"
                }`}
              >
                {p.inventaire_actif ? "Retirer" : "Suivre"}
              </button>

              {p.inventaire_actif && (
                <button onClick={() => ouvrirProduit(p.id)} className="flex-shrink-0">
                  {produitOuvert === p.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>
              )}
            </div>

            {produitOuvert === p.id && (
              <div className="border-t border-gray-100 p-2.5">
                <form onSubmit={(e) => ajouterMouvement(e, p.id)} className="space-y-1.5 mb-3">
                  <div className="flex gap-1.5">
                    <button type="button" onClick={() => setType("achat")}
                      className={`flex-1 flex items-center justify-center gap-1 text-[11px] font-semibold rounded-md py-1.5 ${
                        type === "achat" ? "bg-[#F5720C] text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                      <Plus size={11} /> Achat
                    </button>
                    <button type="button" onClick={() => setType("vente")}
                      className={`flex-1 flex items-center justify-center gap-1 text-[11px] font-semibold rounded-md py-1.5 ${
                        type === "vente" ? "bg-[#1B1B1B] text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                      <Minus size={11} /> Vente
                    </button>
                  </div>
                  <div className="flex gap-1.5">
                    <input value={quantite} onChange={(e) => setQuantite(e.target.value)} type="number" placeholder="Quantité" required
                      className="border border-gray-200 rounded-md px-2 py-1.5 text-xs w-full" />
                    <input value={prixUnitaire} onChange={(e) => setPrixUnitaire(e.target.value)} type="number" placeholder="Prix unitaire"
                      className="border border-gray-200 rounded-md px-2 py-1.5 text-xs w-full" />
                  </div>
                  <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optionnel)"
                    className="border border-gray-200 rounded-md px-2 py-1.5 text-xs w-full" />
                  <button type="submit" disabled={envoiEnCours}
                    className="w-full bg-[#1B1B1B] text-white text-xs font-semibold rounded-md py-2">
                    {envoiEnCours ? "..." : "Enregistrer"}
                  </button>
                </form>

                <p className="text-[10px] font-semibold text-gray-400 mb-1.5">Historique</p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {mouvements.map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-[11px]">
                      <span className={m.type === "achat" ? "text-[#F5720C] font-semibold" : "text-[#1B1B1B] font-semibold"}>
                        {m.type === "achat" ? "+" : "-"}{m.quantite} {m.type === "achat" ? "achat" : "vente"}
                        {m.prix_unitaire ? ` — ${m.prix_unitaire} ${m.devise}/u` : ""}
                      </span>
                      <button onClick={() => supprimerMouvement(m.id, p.id)}>
                        <Trash2 size={12} className="text-gray-300" />
                      </button>
                    </div>
                  ))}
                  {mouvements.length === 0 && <p className="text-[11px] text-gray-300">Aucun mouvement pour l'instant</p>}
                </div>
              </div>
            )}
          </div>
        ))}

        {(produits || []).length === 0 && (
          <p className="text-center text-sm text-gray-400 py-10">Aucun produit dans votre boutique pour l'instant</p>
        )}
      </div>
    </div>
  );
      }
        
