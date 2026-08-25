import { useOutletContext } from "react-router-dom";
import { Plus, Minus, Trash2, MessageCircle } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { API_URL } from "../../lib/api";
import { useCachedData } from "../../lib/useCachedData";

const fmt = (n, devise = "USD") => n.toLocaleString("fr-FR") + " " + devise;

export default function Panier() {
  const { boutiqueId } = useOutletContext();
  const { cart, addToCart, decFromCart, removeFromCart } = useCart();
  const { data: produitsData } = useCachedData(
    `produits_boutique_${boutiqueId}`,
    `${API_URL}/api/produits?boutique_id=${boutiqueId}`,
    {},
    [boutiqueId]
  );
  const produits = produitsData || [];

  const cartItems = Object.entries(cart)
    .map(([id, qty]) => ({ product: produits.find((p) => p.id === id), qty }))
    .filter((i) => i.product);

  // Sous-totaux séparés par devise, au cas où le panier contient des produits en USD et CDF
  const sousTotauxParDevise = cartItems.reduce((acc, i) => {
    const devise = i.product.devise || "USD";
    acc[devise] = (acc[devise] || 0) + i.product.prix * i.qty;
    return acc;
  }, {});

  const suggestions = produits.filter((p) => !cart[p.id]).slice(0, 2);

  const sendReminder = () => {
    const totalTexte = Object.entries(sousTotauxParDevise).map(([d, t]) => fmt(t, d)).join(" + ");
    const msg = `Bonjour, il vous reste des articles dans votre panier chez TonaBk 👀 Total : ${totalTexte}. Finalisez votre commande.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (cartItems.length === 0) {
    return <p className="text-center text-sm text-gray-400 py-10">Votre panier est vide</p>;
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-3">
        <p className="text-xs font-semibold mb-1">Total</p>
        {Object.entries(sousTotauxParDevise).map(([devise, total]) => (
          <p key={devise} className="text-sm font-extrabold text-[#1B1B1B]">{fmt(total, devise)}</p>
        ))}
      </div>

      {cartItems.map(({ product, qty }) => (
        <div key={product.id} className="bg-white rounded-xl p-3 flex items-center gap-3">
          <div className="w-14 h-14 bg-[#F6F6F6] rounded-lg flex items-center justify-center text-xl">📦</div>
          <div className="flex-1">
            <p className="text-xs font-medium">{product.nom}</p>
            <p className="text-sm font-extrabold">{fmt(product.prix * qty, product.devise)}</p>
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
                {p.nom} — {fmt(p.prix, p.devise)}
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
