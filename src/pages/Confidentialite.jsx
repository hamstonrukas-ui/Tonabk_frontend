import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Confidentialite() {
  return (
    <div>
      <div className="bg-[#F5720C] px-4 pt-4 pb-6">
        <Link to="/" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mb-3">
          <ArrowLeft size={16} className="text-white" />
        </Link>
        <h1 className="text-xl font-extrabold text-white mb-1.5">Politique de confidentialité</h1>
        <p className="text-[12.5px] text-white/80 leading-relaxed">
          Ce que TonaBk collecte comme informations, et comment nous les utilisons pour faire
          fonctionner la plateforme.
        </p>
      </div>

      <div className="p-3">
        <div className="bg-white rounded-xl p-4 text-[13px] text-gray-700 leading-relaxed space-y-3">
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
    </div>
  );
}
