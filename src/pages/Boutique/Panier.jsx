import { useEffect, useState } from "react";
import { Plus, Minus, Trash2, MessageCircle } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { API_URL } from "../../lib/api";

const fmt = (n) => n.toLocaleString("fr-FR") + " FC";
const LIVRAISON_GRATUITE_SEUIL = 100000;
const SITE_URL = "tonabk.com";

export default function Panier() {
  const { cart, addToCart, decFromCart, removeFromCart } = useCart();
  const [produits, setProduits] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/produits`).then((r) => r.json()).then(setProduits);
  }, []);

  const cartItems = Object.entries(cart)
    .map(([id, qty]) => ({ product: produits.find((p) => p.id === id), qty }))
    .filter((i) => i.product);

  const total = cartItems.reduce((sum, i) => sum + i.product.prix * i.qty, 0);
  const resteAvantLivraison = Math.max(0, LIVRAISON_GRATUITE_SEUIL - total);
  const progression = Math.min(100, (total / LIVRAISON_GRATUITE_SEUIL) * 100);

  const suggestions = produits.filter((p) => !cart[p.id]).slice(0, 2);

  const sendReminder = () => {
    const msg = `Bonjour, il vous reste des articles dans votre panier chez TonaBk 👀 Total : ${fmt(total)}. Finalisez votre commande ici : ${SITE_URL}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (cartItems.length === 0) {
    return <p className="text-center text-sm text-gray-400 py-10">Votre panier est vide</p>;
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-3">
        <p className="text-xs text-gray-500 mb-1">
          {resteAvantLivraison > 0
            ? `Plus que ${fmt(resteAvantLivraison)} pour la livraison gratuite`
            : "🎉 Livraison gratuite débloquée !"}
        </p>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#F5720C]" style={{ width: `${progression}%` }} />
        </div>
      </div>

      {cartItems.map(({ product, qty }) => (
        <div key={product.id} className="bg-white rounded-xl p-3 flex items-center gap-3">
          <div className="w-14 h-14 bg-[#F6F6F6] rounded-lg flex items-center justify-center text-xl">📦</div>
          <div className="flex-1">
            <p className="text-xs font-medium">{product.nom}</p>
            <p className="text-sm font-extrabold">{fmt(product.prix * qty)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => decFromCart(product.id)}><Minus size={14} /></button>
            <span className="text-sm font-semibold w-4 text-center">{qty}</span>
            <button onClick={() => addToCart(product.id)}><Plus size={14} /></button>
            <button onClick={() => removeFromCart(product.id)} className="ml-1 text-red-400"><Trash2 size={14} /></button>
          </div>
        </div>
      ))}

      {suggestions.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-1.5">Souvent achetés ensemble</p>
          <div className="flex gap-2">
            {suggestions.map((p) => (
              <button key={p.id} onClick={() => addToCart(p.id)} className="bg-white rounded-lg p-2 text-[10px] flex-1">
                {p.nom} — {fmt(p.prix)}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={sendReminder}
        className="w-full flex items-center justify-center gap-2 text-xs font-medium text-white rounded-lg py-2.5 bg-[#25D366]"
      >
        <MessageCircle size={15} /> Rappel WhatsApp (panier abandonné)
      </button>
    </div>
  );
}
