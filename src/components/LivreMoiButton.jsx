import { Truck } from "lucide-react";
import { API_URL } from "../lib/api";

const NUMERO_SERVICE = "243855841999";
const fmt = (n, devise = "USD") => Number(n).toLocaleString("fr-FR") + " " + devise;

// Bouton visible partout où un produit est affiché en détail.
// "produit" = { produit_id?, solde_id?, boutique_id?, nom_produit, prix, devise }
// Clic : on crée un brouillon de commande (retrouvé dans Menu > Commandes) puis on
// ouvre WhatsApp avec le service client pour discuter et conclure.
export default function LivreMoiButton({ produit }) {
  const commander = async () => {
    // Fenêtre ouverte tout de suite (sinon le téléphone bloque l'ouverture après l'appel réseau)
    const fenetre = window.open("", "_blank");
    let ref = "";
    try {
      const res = await fetch(`${API_URL}/api/livraisons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(produit),
      });
      if (res.ok) {
        const { id } = await res.json();
        ref = id.slice(0, 8);
        try {
          const anciennes = JSON.parse(localStorage.getItem("tonabk_commandes") || "[]");
          localStorage.setItem("tonabk_commandes", JSON.stringify([id, ...anciennes]));
        } catch {}
      }
    } catch {}

    const message =
      `Bonjour, je veux me faire livrer à la maison : "${produit.nom_produit}" (${fmt(produit.prix, produit.devise)}).` +
      (ref ? ` Réf. commande : ${ref}` : "");
    const url = `https://wa.me/${NUMERO_SERVICE}?text=${encodeURIComponent(message)}`;
    if (fenetre) fenetre.location.href = url;
    else window.location.href = url;
  };

  return (
    <button
      onClick={commander}
      className="w-full mt-3 flex items-center justify-center gap-2 bg-[#1B1B1B] text-white text-sm font-extrabold rounded-lg py-3.5"
    >
      <Truck size={18} className="text-[#F5720C]" /> Livre-moi à la maison
    </button>
  );
}
