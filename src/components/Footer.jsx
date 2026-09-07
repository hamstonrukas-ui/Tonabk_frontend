import { Link } from "react-router-dom";

export default function Footer() {
  const annee = new Date().getFullYear();

  return (
    <div className="px-4 py-6 mt-4 border-t border-gray-200 text-center">
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mb-3">
        <Link to="/a-propos" className="text-[11px] font-semibold text-gray-500">
          Qui sommes-nous
        </Link>
        <Link to="/comment-ca-marche" className="text-[11px] font-semibold text-gray-500">
          Comment fonctionne TonaBk
        </Link>
        <Link to="/confidentialite" className="text-[11px] font-semibold text-gray-500">
          Politique de confidentialité
        </Link>
      </div>
      <p className="text-[10.5px] text-gray-400">© {annee} TonaBk — Tous droits réservés</p>
    </div>
  );
}
