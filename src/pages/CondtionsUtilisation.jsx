import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { obtenirMarque } from "../lib/marque";

export default function ConditionsUtilisation() {
  const marque = obtenirMarque();
  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-4">
        <Link to="/" className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
          <ArrowLeft size={16} />
        </Link>
        <p className="text-sm font-bold text-[#1B1B1B]">Conditions d'utilisation</p>
      </div>

      <div className="bg-white rounded-xl p-4 mb-3">
        <h1 className="text-lg font-extrabold text-[#1B1B1B] mb-1.5">Conditions d'utilisation</h1>
        <p className="text-[13px] text-gray-500 leading-relaxed">
          Les règles à connaître pour utiliser {marque.nom} en tant qu'acheteur ou vendeur.
        </p>
      </div>

      <div className="bg-white rounded-xl p-4 text-[13px] text-gray-700 leading-relaxed space-y-3">
        <p>
          En utilisant {marque.nom}, vous acceptez les conditions décrites ci-dessous. Merci de les lire
          attentivement.
        </p>

        <p className="font-bold text-[#1B1B1B]">Votre compte</p>
        <p>
          Vous êtes responsable des informations que vous publiez (annonces, produits, boutique) et
          des échanges que vous avez avec les autres utilisateurs. Les informations fournies lors de
          la création de votre compte ou de votre boutique doivent être exactes.
        </p>

        <p className="font-bold text-[#1B1B1B]">Contenu autorisé</p>
        <p>
          Il est interdit de publier des produits ou annonces illégaux, trompeurs, ou qui ne
          correspondent pas à la réalité (photos non conformes, faux prix, fausse localisation).
          {marque.nom} peut retirer tout contenu ne respectant pas ces règles.
        </p>

        <p className="font-bold text-[#1B1B1B]">Transactions</p>
        <p>
          {marque.nom} met en relation acheteurs et vendeurs, mais n'intervient pas directement dans la
          transaction (paiement, livraison, qualité du produit). Chaque transaction se fait sous la
          responsabilité des deux parties concernées.
        </p>

        <p className="font-bold text-[#1B1B1B]">Suspension de compte</p>
        <p>
          {marque.nom} se réserve le droit de suspendre ou supprimer un compte ou une boutique en cas de
          non-respect de ces conditions, de comportement frauduleux ou abusif envers d'autres
          utilisateurs.
        </p>

        <p className="font-bold text-[#1B1B1B]">Modifications</p>
        <p>
          Ces conditions peuvent évoluer avec le temps, notamment pour accompagner l'ajout de
          nouvelles fonctionnalités sur la plateforme.
        </p>

        <p className="text-[11px] text-gray-400 pt-2">
          Pour toute question sur ces conditions, contactez-nous directement via l'application.
        </p>
      </div>
    </div>
  );
}
