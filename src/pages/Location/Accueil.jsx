import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin, Plus, ArrowUpRight, BedDouble, Bath } from "lucide-react";
import { useFavoris } from "../../lib/favoris";
import { useCachedData } from "../../lib/useCachedData";
import { API_URL } from "../../lib/api";

const fmt = (n, devise) => n.toLocaleString("fr-FR") + " " + devise;

const LABELS_TYPE = {
  maison: "Maison",
  appartement: "Appartement",
  studio: "Studio",
  chambre: "Chambre",
  terrain: "Terrain",
  commerce: "Commerce",
};

export default function Accueil() {
  const { data } = useCachedData("maisons_accueil", `${API_URL}/api/maisons`);
  const maisons = data || [];
  const [quartierFiltre, setQuartierFiltre] = useState("Tous");
  const { favoris, toggleFavori } = useFavoris();

  const quartiers = ["Tous", ...new Set(maisons.map((m) => m.quartier))];
  const filtered = quartierFiltre === "Tous" ? maisons : maisons.filter((m) => m.quartier === quartierFiltre);

  return (
    <div className="p-3">
      <Link
        to="/location/publier"
        className="flex items-center gap-3 bg-[#F5720C] rounded-xl p-3.5 mb-3"
      >
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <Plus size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">Publier une maison</p>
          <p className="text-[11px] text-white/80">Louez votre bien via TonaBk</p>
        </div>
      </Link>

      <div className="flex gap-2 overflow-x-auto mb-3 pb-1">
        {quartiers.map((q) => (
          <button
            key={q}
            onClick={() => setQuartierFiltre(q)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
              quartierFiltre === q ? "bg-[#F5720C] text-white" : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            {q}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((m) => (
          <Link key={m.id} to={`/location/maison/${m.id}`} className="block bg-white rounded-xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform">
            <div className="relative h-44 bg-[#F6F6F6]">
              {m.photos_maisons?.[0]?.url ? (
                <img src={m.photos_maisons[0].url} alt={m.titre} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">🏠</div>
              )}

              <span className="absolute top-2 left-2 bg-white/95 text-[10px] font-semibold text-[#1B1B1B] px-2 py-1 rounded-full">
                {LABELS_TYPE[m.type_bien] || m.type_bien}
              </span>

              <button
                onClick={(e) => { e.preventDefault(); toggleFavori(m.id); }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center"
              >
                <Heart size={16} fill={favoris.includes(m.id) ? "#F5720C" : "none"} className="text-[#F5720C]" />
              </button>

              <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-[#F5720C] text-white text-[10px] font-semibold pl-2.5 pr-2 py-1.5 rounded-full shadow-md">
                Voir détails <ArrowUpRight size={13} />
              </div>
            </div>

            <div className="p-3">
              <p className="text-sm font-semibold text-[#1B1B1B]">{m.titre}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <MapPin size={11} /> {m.quartier}, {m.commune}
              </p>

              {(m.nb_chambres || m.nb_salles_bain) && (
                <div className="flex items-center gap-3 mt-1.5">
                  {m.nb_chambres && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <BedDouble size={13} /> {m.nb_chambres}
                    </span>
                  )}
                  {m.nb_salles_bain && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Bath size={13} /> {m.nb_salles_bain}
                    </span>
                  )}
                </div>
              )}

              <p className="text-sm font-extrabold text-[#F5720C] mt-1.5">{fmt(m.prix, m.devise)}/mois</p>
            </div>
          </Link>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-10">
            <p className="text-3xl mb-2">🏠</p>
            <p className="text-sm text-gray-400">Aucune maison disponible pour l'instant</p>
          </div>
        )}
      </div>
    </div>
  );
}
