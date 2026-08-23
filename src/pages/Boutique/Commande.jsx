import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { API_URL } from "../../lib/api";

const fmt = (n, devise = "USD") => n.toLocaleString("fr-FR") + " " + devise;

export default function Commande() {
  const { boutiqueId, boutique } = useOutletContext();
  const { cart, clearCart } = useCart();
  const [produits, setProduits] = useState([]);
  const [nom, setNom] = useState("");
  const [adresse, setAdresse] = useState("");
  const [source, setSource] = useState("WhatsApp");

  useEffect(() => {
    fetch(`${API_URL}/api/produits?boutique_id=${boutiqueId}`).then((r) => r.json()).then(setProduits);
  }, [boutiqueId]);

  const cartItems = Object.entries(cart)
    .map(([id, qty]) => ({ product: produits.find((p) => p.id === id), qty }))
    .filter((i) => i.product);

  const sousTotauxParDevise = cartItems.reduce((acc, i) => {
    const devise = i.product.devise || "USD";
    acc[devise] = (acc[devise] || 0) + i.product.prix * i.qty;
    return acc;
  }, {});

  const codeParrainage = localStorage.getItem(`parrainage_${boutiqueId}`);

  const buildMessage = () => {
    let msg = `Bonjour, je souhaite commander :%0A`;
    cartItems.forEach((i) => { msg += `- ${i.product.nom} x${i.qty} (${fmt(i.product.prix * i.qty, i.product.devise)})%0A`; });
    msg += `%0ATotal : ${Object.entries(sousTotauxParDevise).map(([d, t]) => fmt(t, d)).join(" + ")}%0A`;
    if (nom.trim()) msg += `%0ANom : ${nom.trim()}%0A`;
    if (adresse.trim()) msg += `Adresse : ${adresse.trim()}%0A`;
    msg += `Connu via : ${source}`;
    if (codeParrainage) msg += `%0ACode de parrainage : ${codeParrainage}`;
    return msg;
  };

  const sendOrder = async () => {
    if (cartItems.length === 0) return;

    if (codeParrainage) {
      try {
        await fetch(`${API_URL}/api/parrainage/enregistrer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: codeParrainage,
            boutique_id: boutiqueId,
            filleul_nom: nom.trim() || "Client",
          }),
        });
      } catch {
        // On n'empêche pas l'envoi de la commande si l'enregistrement échoue
      }
    }

    window.open(`https://wa.me/${boutique?.telephone?.replace(/\D/g, "")}?text=${buildMessage()}`, "_blank");
    clearCart();
  };

  if (cartItems.length === 0) {
    return <p className="text-center text-sm text-gray-400 py-10">Ajoutez des articles à votre panier d'abord</p>;
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-3">
        <p className="text-xs font-semibold mb-2">Récapitulatif</p>
        {cartItems.map((i) => (
          <div key={i.product.id} className="flex justify-between text-xs py-1">
            <span>{i.product.nom} x{i.qty}</span>
            <span className="font-semibold">{fmt(i.product.prix * i.qty, i.product.devise)}</span>
          </div>
        ))}
        <div className="pt-2 border-t border-gray-100 mt-2 space-y-0.5">
          {Object.entries(sousTotauxParDevise).map(([devise, total]) => (
            <div key={devise} className="flex justify-between text-sm font-extrabold">
              <span>Total {devise}</span><span>{fmt(total, devise)}</span>
            </div>
          ))}
        </div>
        {codeParrainage && (
          <p className="text-[11px] text-[#F5720C] mt-2">Code de parrainage appliqué : {codeParrainage}</p>
        )}
      </div>

      <div className="bg-white rounded-xl p-3 space-y-2">
        <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom complet" className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full" />
        <input value={adresse} onChange={(e) => setAdresse(e.target.value)} placeholder="Adresse / quartier" className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full" />
        <select value={source} onChange={(e) => setSource(e.target.value)} className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full">
          <option>WhatsApp</option>
          <option>Facebook / Instagram</option>
          <option>Recommandation d'un ami</option>
          <option>Autre</option>
        </select>
      </div>

      <button
        onClick={sendOrder}
        className="w-full flex items-center justify-center gap-2 text-sm font-medium text-white rounded-lg py-3 bg-[#25D366]"
      >
        <MessageCircle size={18} /> Envoyer la commande sur WhatsApp
      </button>
    </div>
  );
          }
    
