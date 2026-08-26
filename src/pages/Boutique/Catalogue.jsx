import { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { Star, Share2, Bell, BellRing } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { supabase } from "../../lib/supabaseClient";
import { API_URL, SITE_URL } from "../../lib/api";
import { useCachedData } from "../../lib/useCachedData";

const fmt = (n, devise = "USD") => n.toLocaleString("fr-FR") + " " + devise;

export default function Catalogue() {
  const { boutiqueId } = useOutletContext();
  const { data: produitsData } = useCachedData(
    `produits_boutique_${boutiqueId}`,
    `${API_URL}/api/produits?boutique_id=${boutiqueId}`,
    {},
    [boutiqueId]
  );
  const produits = produitsData || [];

  const [abonne, setAbonne] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    async function verifierAbonnement() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(`${API_URL}/api/boutiques/${boutiqueId}/est-abonne`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) setAbonne((await res.json()).abonne);
    }
    verifierAbonnement();
  }, [boutiqueId]);

  const toggleAbonnement = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("Connectez-vous pour vous abonner à cette boutique");
      return;
    }
    const headers = { Authorization: `Bearer ${session.access_token}` };

    if (abonne) {
      await fetch(`${API_URL}/api/boutiques/${boutiqueId}/abonner`, { method: "DELETE", headers });
      setAbonne(false);
    } else {
      await fetch(`${API_URL}/api/boutiques/${boutiqueId}/abonner`, { method: "POST", headers });
      setAbonne(true);
    }
  };

  const shareProduct = async (p) => {
    const texte = `Regarde ce produit sur TonaBk : ${p.nom} — ${fmt(p.prix, p.devise)}`;
    const url = `${SITE_URL}/boutique/produit/${p.id}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: p.nom, text: texte, url });
      } catch {
        // Partage annulé par l'utilisateur
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${texte}. ${url}`)}`, "_blank");
    }
  };

  return (
    <div>
      <button
        onClick={toggleAbonnement}
        className={`w-full flex items-center justify-center gap-2 text-sm font-semibold rounded-xl py-2.5 mb-3 ${
          abonne ? "bg-[#FFF1E4] text-[#C9560A]" : "bg-[#1B1B1B] text-white"
        }`}
      >
        {abonne ? <BellRing size={15} /> : <Bell size={15} />}
        {abonne ? "Abonné aux nouveautés" : "S'abonner aux nouveautés de cette boutique"}
      </button>

      <div className="bg-gradient-to-r from-[#FFEDE0] to-[#FFF6EE] border border-[#FFD3AC] rounded-xl p-3 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <div>
            <p className="text-sm font-extrabold text-[#C9560A]">Vente flash</p>
            <p className="text-[10px] text-gray-500">Offres du jour</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {produits.map((p) => (
          <div key={p.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
            <Link to={`/boutique/produit/${p.id}`}>
              <div className="bg-[#F6F6F6] h-24 flex items-center justify-center text-3xl relative">
                {p.photo_url ? <img src={p.photo_thumb_url || p.photo_url} alt={p.nom} className="w-full h-full object-cover" /> : "📦"}
                <span
                  className={`absolute top-1.5 left-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded ${
                    p.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                  }`}
                >
                  {p.stock > 0 ? `${p.stock} en stock` : "Rupture"}
                </span>
              </div>
              <div className="px-2.5 pt-2.5">
                <p className="text-[11.5px] text-gray-800 font-medium leading-tight h-8 overflow-hidden">{p.nom}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star size={10} fill="#FFB400" className="text-[#FFB400]" />
                  <span className="text-[9px] text-gray-400">({p.avis || 0})</span>
                </div>
                <p className="text-sm font-extrabold text-[#1B1B1B] mt-1">{fmt(p.prix, p.devise)}</p>
                <p className="text-[9px] font-semibold text-[#F5720C] mt-0.5">Voir détails →</p>
              </div>
            </Link>
            <div className="px-2.5 pb-2.5">
              <div className="flex gap-1.5 mt-2">
                <button
                  onClick={() => addToCart(p.id)}
                  disabled={p.stock === 0}
                  className="flex-1 bg-[#F5720C] text-white text-[11px] font-semibold rounded-md py-1.5 disabled:bg-gray-300"
                >
                  {p.stock === 0 ? "Indisponible" : "Ajouter"}
                </button>
                <button onClick={() => shareProduct(p)} className="border border-gray-200 rounded-md px-2">
                  <Share2 size={13} className="text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {produits.length === 0 && (
          <p className="col-span-2 text-center text-sm text-gray-400 py-10">Aucun produit publié pour l'instant</p>
        )}
      </div>
    </div>
  );
}
