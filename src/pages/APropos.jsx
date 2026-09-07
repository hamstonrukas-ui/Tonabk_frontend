import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function APropos() {
  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-4">
        <Link to="/" className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
          <ArrowLeft size={16} />
        </Link>
        <p className="text-sm font-bold text-[#1B1B1B]">Qui sommes-nous</p>
      </div>

      <div className="bg-white rounded-xl p-4 text-[13px] text-gray-700 leading-relaxed space-y-3">
        <p>
          <b>TonaBk</b> est le grand marché numérique de Bukavu. Notre mission est simple : rassembler,
          au même endroit, les maisons à louer, les boutiques locales et les demandes des habitants,
          pour que trouver ou vendre quelque chose à Bukavu devienne plus rapide et plus fiable.
        </p>
        <p>
          Nous connectons directement les propriétaires, les commerçants et les acheteurs, sans
          intermédiaire compliqué. Chaque boutique et chaque annonce sur TonaBk est gérée par de vrais
          habitants de la ville, pour la communauté de Bukavu.
        </p>
        <p>
          Notre équipe travaille chaque jour pour améliorer la plateforme et répondre au mieux aux
          réalités locales : connexion internet limitée, coupures d'électricité, besoin de simplicité.
          TonaBk est pensé et construit pour Bukavu, par des gens de Bukavu.
        </p>
      </div>
    </div>
  );
}
