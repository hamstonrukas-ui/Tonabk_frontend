import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Share2 } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { API_URL } from "../../lib/api";

const fmt = (n) => n.toLocaleString("fr-FR") + " FC";
const SITE_URL = "tonabk.com";

export default function DetailProduit() {
  const { id } = useParams();
  const [produit, setProduit] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`${API_URL}/api/produits`).then((r) => r.json()).then((data) => {
      setProduit(data.find((p) => p.id === id));
    });
  }, [id]);

  if (!produit) return <p className="text-center text-sm text-gray-400 py-10">Chargement...</p>;

  const partager = () => {
    const msg = `Regarde ce produit sur TonaBk : ${produit.nom} — ${fmt(produit.prix)}. ${SITE_URL}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div>
      <div className="relative h-64 bg-[#F6F6F6]">
        {produit.photo_url ? (
          <img src={produit.photo_url} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
        )}
        <Link to="/boutique" className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
          <ArrowLeft size={18} />
        </Link>
        <button onClick={partager} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
          <Share2 size={16} />
        </button>
      </div>

      <div className="p-4">
        <p className="text-lg font-bold text-[#1B1B1B]">{produit.nom}</p>
        <Link to={`/boutique/${produit.boutique_id}`} className="text-xs text-[#F5720C] font-medium">
          {produit.boutiques?.nom} →
        </Link>
        <p className="text-xl font-extrabold text-[#1B1B1B] mt-2">{fmt(produit.prix)}</p>
        <p className="text-xs text-gray-400 mt-1">{produit.stock > 0 ? `${produit.stock} en stock` : "Rupture de stock"}</p>

        {produit.description && <p className="text-sm text-gray-600 mt-3">{produit.description}</p>}

        <button
          onClick={() => addToCart(produit.id)}
          disabled={produit.stock === 0}
          className="w-full mt-4 bg-[#F5720C] text-white text-sm font-semibold rounded-lg py-3 disabled:bg-gray-300"
        >
          {produit.stock === 0 ? "Rupture de stock" : "Ajouter au panier"}
        </button>
      </div>
    </div>
  );
}
