import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Star, Share2 } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { API_URL } from "../../lib/api";

const fmt = (n) => n.toLocaleString("fr-FR") + " FC";
const SITE_URL = "tonabk.com";

export default function Catalogue() {
  const { boutiqueId } = useOutletContext();
  const [produits, setProduits] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`${API_URL}/api/produits?boutique_id=${boutiqueId}`)
      .then((r) => r.json())
      .then(setProduits)
      .catch(console.error);
  }, [boutiqueId]);

  const shareProduct = (p) => {
    const msg = `Regarde ce produit sur TonaBk : ${p.nom} — ${fmt(p.prix)}. ${SITE_URL}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div>
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
            <div className="bg-[#F6F6F6] h-24 flex items-center justify-center text-3xl">
              {p.photo_url ? <img src={p.photo_thumb_url || p.photo_url} alt={p.nom} className="w-full h-full object-cover" /> : "📦"}
            </div>
            <div className="p-2.5">
              <p className="text-[11.5px] text-gray-800 font-medium leading-tight h-8 overflow-hidden">{p.nom}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star size={10} fill="#FFB400" className="text-[#FFB400]" />
                <span className="text-[9px] text-gray-400">({p.avis || 0})</span>
              </div>
              <p className="text-sm font-extrabold text-[#1B1B1B] mt-1">{fmt(p.prix)}</p>
              <div className="flex gap-1.5 mt-2">
                <button
                  onClick={() => addToCart(p.id)}
                  className="flex-1 bg-[#F5720C] text-white text-[11px] font-semibold rounded-md py-1.5"
                >
                  Ajouter
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
                                       
