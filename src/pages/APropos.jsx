import { Link } from "react-router-dom";
import { ArrowLeft, Mail, MessageCircle } from "lucide-react";

export default function APropos() {
  return (
    <div>
      <div className="bg-[#F5720C] px-4 pt-4 pb-6">
        <Link to="/" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mb-3">
          <ArrowLeft size={16} className="text-white" />
        </Link>
        <h1 className="text-xl font-extrabold text-white mb-1.5">Qui sommes-nous ?</h1>
        <p className="text-[12.5px] text-white/80 leading-relaxed">
          Tona Company — Des solutions technologiques pour l'Afrique.
        </p>
      </div>

      <div className="p-3">
        <div className="bg-white rounded-xl p-4 text-[13px] text-gray-700 leading-relaxed space-y-3">
          <p className="font-bold text-[#1B1B1B]">Tona Company 🇳🇬</p>

          <p>
            Tona Company est une entreprise technologique d'origine nigériane, basée à Abuja, capitale
            du Nigeria, spécialisée dans la conception et le développement de solutions numériques
            destinées aux entreprises, aux entrepreneurs et aux particuliers.
          </p>

          <p>
            L'entreprise développe des plateformes et des outils technologiques visant à simplifier
            les activités commerciales, améliorer l'accès aux services et accompagner la transformation
            numérique des marchés africains.
          </p>

          <p>
            Parmi ses solutions figure <b>TonaBK</b>, une plateforme numérique dédiée au commerce et
            aux activités des entreprises, permettant aux commerçants et entrepreneurs de développer
            leur présence en ligne et de mieux connecter leurs produits et services avec leurs clients.
          </p>

          <p>
            À travers ses différentes solutions, Tona Company ambitionne de construire des technologies
            adaptées aux réalités africaines et capables d'évoluer à l'échelle du continent.
          </p>

          <p className="font-bold text-[#F5720C] pt-1">
            Tona Company — Des solutions technologiques pour l'Afrique.
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 mt-3">
          <p className="text-sm font-bold text-[#1B1B1B] mb-3">Nous contacter</p>
          <a href="mailto:contact@tonabk.com" className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#FFF1E4] flex items-center justify-center flex-shrink-0">
              <Mail size={16} className="text-[#F5720C]" />
            </div>
            <span className="text-[13px] text-gray-700">contact@tonabk.com</span>
          </a>
          <a href="https://wa.me/243855841999" target="_blank" rel="noreferrer" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#E7F9EE] flex items-center justify-center flex-shrink-0">
              <MessageCircle size={16} className="text-[#25D366]" />
            </div>
            <span className="text-[13px] text-gray-700">+243 855 841 999 (WhatsApp)</span>
          </a>
        </div>
      </div>
    </div>
  );
}
