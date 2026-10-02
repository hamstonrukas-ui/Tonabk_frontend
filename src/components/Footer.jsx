import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Store, Info, ShieldCheck, Facebook, Linkedin, Youtube } from "lucide-react";
import { obtenirMarque } from "../lib/marque";

// Remplacez ces liens par les vraies pages de TonaBk
const RESEAUX_SOCIAUX = [
  { nom: "Facebook", href: "https://www.facebook.com/profile.php?id=61594085591693", Icone: Facebook },
  { nom: "TikTok", href: "https://www.tiktok.com/@tonabk", Icone: ({ size = 17, ...props }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} {...props}>
        <path d="M16.6 5.82c-1.05-1.02-1.66-2.4-1.66-3.82h-3.13v13.62c0 1.5-1.22 2.72-2.72 2.72a2.72 2.72 0 0 1 0-5.44c.28 0 .55.04.8.12V9.9a5.86 5.86 0 0 0-.8-.06 5.85 5.85 0 1 0 5.85 5.85V8.4a8.97 8.97 0 0 0 4.66 1.3V6.6a5.65 5.65 0 0 1-3-.78z" />
      </svg>
    ) },
  { nom: "LinkedIn", href: "https://www.linkedin.com/in/tona-company-b11a49434", Icone: Linkedin },
  { nom: "YouTube", href: "https://www.youtube.com/@tonamarket", Icone: Youtube },
];

function obtenirSections(nomMarque) {
  return [
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
        { label: `Comment fonctionne ${nomMarque}`, to: "/comment-ca-marche" },
      ],
    },
    {
      titre: "Légal",
      icone: ShieldCheck,
      liens: [{ label: "Politique de confidentialité", to: "/confidentialite" }],
    },
  ];
}

export default function Footer() {
  const marque = obtenirMarque();
  const sections = obtenirSections(marque.nom);
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

      <div className="flex flex-col items-center gap-2.5 pt-5 pb-2">
        <p className="text-[11px] font-bold text-[#1B1B1B]">Vous pouvez nous suivre sur :</p>
        <div className="flex items-center gap-3">
          {RESEAUX_SOCIAUX.map(({ nom, href, Icone }) => (
            <a
              key={nom}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={nom}
              className="w-9 h-9 rounded-full bg-[#F5720C]/10 flex items-center justify-center text-[#F5720C] hover:bg-[#F5720C] hover:text-white transition-colors"
            >
              <Icone size={17} />
            </a>
          ))}
        </div>
      </div>

      <p className="text-[10.5px] text-gray-400 text-center py-5">© {annee} {marque.nom} — Tous droits réservés</p>
    </div>
  );
}

        

      
