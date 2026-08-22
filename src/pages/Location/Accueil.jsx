import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin, Plus } from "lucide-react";
import { useFavoris } from "../../lib/favoris";
import { cachedFetch } from "../../lib/cache";
import { API_URL } from "../../lib/api";
import BandeauHorsLigne from "../../components/BandeauHorsLigne";

const fmt = (n, devise) => n.toLocaleString("fr-FR") + " " + devise;

export default function Accueil() {
  const [maisons, setMaisons] = useState([]);
  const [ageCache, setAgeCache] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [quartierFiltre, setQuartierFiltre] = useState("Tous");
  const { favoris, toggleFavori } = useFavoris();

  useEffect(() => {
    cachedFetch("maisons_accueil", `${API_URL}/api/maisons`)
      .then(({ data, depuisCache, ageMs }) => {
        setMaisons(data);
        setAgeCache(depuisCache ? ageMs : null);
      })
      .catch(console.error)
      .finally(() => setChargement(false));
  }, []);

  const quartiers = ["Tous", ...new Set(maisons.map((m) => m.quartier))];
  const filtered = quartierFiltre === "Tous" ? maisons : maisons.filter((m) => m.quartier === quartierFiltre);

  return (
    <div className="p-3">
      {ageCache !== null && <BandeauHorsLigne ageMs={ageCache} />}

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
          <Link key={m.id} to={`/location/maison/${m.id}`} className="block bg-white rounded-xl overflow-hidden shadow-sm">
            <div className="relative h-40 bg-[#F6F6F6]">
              {m.photos_maisons?.[0]?.url ? (
                <img src={m.photos_maisons[0].url} alt={m.titre} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">🏠</div>
              )}
              <button
                onClick={(e) => { e.preventDefault(); toggleFavori(m.id); }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center"
              >
                <Heart size={16} fill={favoris.includes(m.id) ? "#F5720C" : "none"} className="text-[#F5720C]" />
              </button>
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold text-[#1B1B1B]">{m.titre}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <MapPin size={11} /> {m.quartier}, {m.commune}
              </p>
              <p className="text-sm font-extrabold text-[#F5720C] mt-1">{fmt(m.prix, m.devise)}/mois</p>
            </div>
          </Link>
        ))}

        {!chargement && filtered.length === 0 && (
          <div className="text-center py-10">
            <p className="text-3xl mb-2">🏠</p>
            <p className="text-sm text-gray-400">Aucune maison disponible pour l'instant</p>
          </div>
        )}
      </div>
    </div>
  );
            }
