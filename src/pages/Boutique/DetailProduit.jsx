import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Share2, Check, ShoppingBag } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { API_URL, SITE_URL } from "../../lib/api";
import { useCachedData } from "../../lib/useCachedData";

const fmt = (n, devise = "USD") => n.toLocaleString("fr-FR") + " " + devise;

export default function DetailProduit() {
  const { id } = useParams();
  const { data: tousLesProduits } = useCachedData("produits_tous", `${API_URL}/api/produits`);
  const produit = (tousLesProduits || []).find((p) => p.id === id);
  const [ajoute, setAjoute] = useState(false);
  const { addToCart } = useCart();

  if (!produit) return <p className="text-center text-sm text-gray-400 py-10">Chargement...</p>;

  const partager = async () => {
    const texte = `Regarde ce produit sur TonaBk : ${produit.nom} — ${fmt(produit.prix, produit.devise)}`;
    const url = `${SITE_URL}/boutique/produit/${produit.id}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: produit.nom, text: texte, url });
      } catch {
        // Partage annulé par l'utilisateur
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${texte}. ${url}`)}`, "_blank");
    }
  };

  const handleAjouter = () => {
    addToCart(produit.id);
    setAjoute(true);
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
        <p className="text-xl font-extrabold text-[#1B1B1B] mt-2">{fmt(produit.prix, produit.devise)}</p>
        <p className={`text-xs mt-1 font-semibold ${produit.stock > 0 ? "text-green-600" : "text-red-500"}`}>
          {produit.stock > 0 ? `${produit.stock} en stock` : "Rupture de stock"}
        </p>

        {produit.description && <p className="text-sm text-gray-600 mt-3">{produit.description}</p>}

        {!ajoute ? (
          <button
            onClick={handleAjouter}
            disabled={produit.stock === 0}
            className="w-full mt-4 bg-[#F5720C] text-white text-sm font-semibold rounded-lg py-3 disabled:bg-gray-300"
          >
            {produit.stock === 0 ? "Rupture de stock" : "Ajouter au panier"}
          </button>
        ) : (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center gap-2 bg-green-50 text-green-700 text-sm font-medium rounded-lg py-3">
              <Check size={16} /> Ajouté au panier
            </div>
            <Link
              to={`/boutique/${produit.boutique_id}/panier`}
              className="w-full flex items-center justify-center gap-2 bg-[#F5720C] text-white text-sm font-semibold rounded-lg py-3"
            >
              <ShoppingBag size={16} /> Voir mon panier
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
