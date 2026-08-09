import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin } from "lucide-react";
import { useFavoris } from "../../lib/favoris";

const fmt = (n, devise) => n.toLocaleString("fr-FR") + " " + devise;

export default function Accueil() {
  const [maisons, setMaisons] = useState([]);
  const [quartierFiltre, setQuartierFiltre] = useState("Tous");
  const { favoris, toggleFavori } = useFavoris();

  useEffect(() => {
    fetch("/api/maisons").then((r) => r.json()).then(setMaisons).catch(console.error);
  }, []);

  const quartiers = ["Tous", ...new Set(maisons.map((m) => m.quartier))];
  const filtered = quartierFiltre === "Tous" ? maisons : maisons.filter((m) => m.quartier === quartierFiltre);

  return (
    <div className="p-3">
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
      </div>
    </div>
  );
}
