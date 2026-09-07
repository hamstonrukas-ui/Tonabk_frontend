import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Confidentialite() {
  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-4">
        <Link to="/" className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
          <ArrowLeft size={16} />
        </Link>
        <p className="text-sm font-bold text-[#1B1B1B]">Politique de confidentialité</p>
      </div>

      <div className="bg-white rounded-xl p-4 text-[13px] text-gray-700 leading-relaxed space-y-3">
        <p>
          Cette politique explique quelles informations TonaBk collecte lorsque vous utilisez la
          plateforme, et comment nous les utilisons.
        </p>

        <p className="font-bold text-[#1B1B1B]">Informations que nous collectons</p>
        <p>
          Lorsque vous créez un compte, une boutique ou une annonce, nous collectons : votre nom, votre
          numéro de téléphone, votre adresse e-mail (si fournie), les photos que vous publiez, ainsi que
          le quartier ou la localisation liés à vos annonces.
        </p>

        <p className="font-bold text-[#1B1B1B]">Comment nous utilisons ces informations</p>
        <p>
          Ces informations servent uniquement à faire fonctionner la plateforme : afficher vos annonces,
          permettre aux acheteurs de vous contacter, gérer votre boutique et sécuriser votre compte.
          Nous ne vendons jamais vos informations personnelles à des tiers.
        </p>

        <p className="font-bold text-[#1B1B1B]">Partage des informations</p>
        <p>
          Votre numéro de téléphone est visible par les personnes intéressées par vos produits ou vos
          annonces, afin qu'elles puissent vous contacter directement (par exemple via WhatsApp). C'est
          nécessaire au fonctionnement du service.
        </p>

        <p className="font-bold text-[#1B1B1B]">Vos droits</p>
        <p>
          Vous pouvez à tout moment demander la modification ou la suppression de vos informations et de
          votre compte en nous contactant.
        </p>

        <p className="text-[11px] text-gray-400 pt-2">
          Cette politique peut être mise à jour de temps à autre. Pour toute question, contactez-nous
          directement via l'application.
        </p>
      </div>
    </div>
  );
      }
