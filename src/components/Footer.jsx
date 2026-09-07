import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Store, Info, ShieldCheck } from "lucide-react";

const sections = [
  {
    titre: "Boutiques",
    icone: Store,
    liens: [
      { label: "Découvrir les boutiques", to: "/boutique/populaires" },
      { label: "Créer ma boutique", to: "/boutique/creer" },
    ],
  },
  {
    titre: "À propos",
    icone: Info,
    liens: [
      { label: "Qui sommes-nous", to: "/a-propos" },
      { label: "Comment fonctionne TonaBk", to: "/comment-ca-marche" },
    ],
  },
  {
    titre: "Légal",
    icone: ShieldCheck,
    liens: [{ label: "Politique de confidentialité", to: "/confidentialite" }],
  },
];

export default function Footer() {
  const [ouvert, setOuvert] = useState(null);
  const annee = new Date().getFullYear();

  return (
    <div className="mt-4 border-t border-gray-200">
      {sections.map((section, i) => {
        const Icone = section.icone;
        const estOuvert = ouvert === i;
        return (
          <div key={section.titre} className="border-b border-gray-200">
            <button
              onClick={() => setOuvert(estOuvert ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3.5"
            >
              <span className="flex items-center gap-2 text-[13px] font-bold text-[#1B1B1B]">
                <Icone size={15} className="text-[#F5720C]" />
                {section.titre}
              </span>
              {estOuvert ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>
            {estOuvert && (
              <div className="px-4 pb-3.5 flex flex-col gap-2.5">
                {section.liens.map((lien) => (
                  <Link key={lien.to} to={lien.to} className="text-[12.5px] text-gray-500 pl-6">
                    {lien.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <p className="text-[10.5px] text-gray-400 text-center py-5">© {annee} TonaBk — Tous droits réservés</p>
    </div>
  );
}

                    
