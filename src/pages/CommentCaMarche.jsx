import { Link } from "react-router-dom";
import { ArrowLeft, Building2, Store, Search } from "lucide-react";

export default function CommentCaMarche() {
  return (
    <div>
      <div className="bg-[#F5720C] px-4 pt-4 pb-6">
        <Link to="/" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mb-3">
          <ArrowLeft size={16} className="text-white" />
        </Link>
        <h1 className="text-xl font-extrabold text-white mb-1.5">Comment fonctionne TonaBk</h1>
        <p className="text-[12.5px] text-white/80 leading-relaxed">
          Trois façons simples d'utiliser TonaBk : louer une maison, acheter dans une boutique, ou
          demander ce que vous ne trouvez pas.
        </p>
      </div>

      <div className="p-3 space-y-3">
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Building2 size={16} className="text-[#F5720C]" />
            <p className="text-sm font-bold text-[#1B1B1B]">Location de maisons</p>
          </div>
          <p className="text-[12.5px] text-gray-600 leading-relaxed">
            Parcourez les maisons disponibles à Bukavu, filtrez par quartier et par prix, puis
            contactez directement le propriétaire ou l'agent. Vous pouvez aussi publier votre propre
            maison à louer en quelques minutes.
          </p>
        </div>

        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Store size={16} className="text-[#F5720C]" />
            <p className="text-sm font-bold text-[#1B1B1B]">Boutiques en ligne</p>
          </div>
          <p className="text-[12.5px] text-gray-600 leading-relaxed">
            Créez gratuitement votre boutique, ajoutez vos produits avec photos et prix, et vendez
            directement sur WhatsApp. Les acheteurs peuvent parcourir votre catalogue, ajouter des
            produits au panier, ou vous contacter directement pour acheter.
          </p>
        </div>

        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Search size={16} className="text-[#F5720C]" />
            <p className="text-sm font-bold text-[#1B1B1B]">Requêtes</p>
          </div>
          <p className="text-[12.5px] text-gray-600 leading-relaxed">
            Vous cherchez un produit ou un service que vous ne trouvez pas sur TonaBk ? Publiez une
            requête décrivant ce dont vous avez besoin, et les boutiques ou particuliers intéressés
            pourront vous répondre directement.
          </p>
        </div>
      </div>
    </div>
  );
}
