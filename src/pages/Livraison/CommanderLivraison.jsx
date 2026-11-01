import { useLocation, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import LivreMoiButton from "../../components/LivreMoiButton";

const fmt = (n, devise = "USD") => Number(n).toLocaleString("fr-FR") + " " + devise;

// Page de secours : dans le nouveau parcours, le bouton "Livre-moi à la maison" ouvre
// directement WhatsApp. Cette page n'est plus nécessaire, mais reste compatible si un
// ancien lien ou un ancien App.jsx y renvoie encore.
export default function CommanderLivraison() {
  const { state: produit } = useLocation();
  const navigate = useNavigate();

  if (!produit) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-gray-500 mb-3">Choisissez d'abord un produit à faire livrer.</p>
        <Link to="/" className="text-[#F5720C] font-semibold text-sm">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div className="p-4">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-xs text-gray-500 mb-3">
        <ArrowLeft size={14} /> Retour
      </button>
      <div className="bg-white rounded-xl p-4">
        <p className="text-xs text-gray-400">Vous voulez vous faire livrer</p>
        <p className="text-sm font-extrabold text-[#1B1B1B]">{produit.nom_produit}</p>
        <p className="text-base font-extrabold text-[#F5720C]">{fmt(produit.prix, produit.devise)}</p>
        <p className="text-[11px] text-gray-500 mt-1">💵 Paiement à la livraison, en espèces.</p>
        <LivreMoiButton produit={produit} />
      </div>
    </div>
  );
}
