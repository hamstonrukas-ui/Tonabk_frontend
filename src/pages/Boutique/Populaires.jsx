import { Link } from "react-router-dom";
import { ArrowLeft, BadgeCheck, MapPin } from "lucide-react";
import { API_URL } from "../../lib/api";
import { useCachedData } from "../../lib/useCachedData";

export default function Populaires() {
  const { data: boutiquesData } = useCachedData("boutiques_populaires", `${API_URL}/api/boutiques`);
  const boutiques = boutiquesData || [];

  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-3">
        <Link to="/" className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
          <ArrowLeft size={16} />
        </Link>
        <p className="text-sm font-bold text-[#1B1B1B]">Boutiques populaires</p>
      </div>

      <div className="space-y-2.5">
        {boutiques.map((b) => (
          <Link
            key={b.id}
            to={`/boutique/${b.id}`}
            className="bg-white rounded-xl p-3.5 flex flex-col shadow-sm"
          >
            <div className="flex items-center gap-3">
              {b.logo_url ? (
                <img src={b.logo_url} alt={b.nom} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#F5720C] text-white font-bold text-lg flex items-center justify-center flex-shrink-0">
                  {b.nom.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-bold text-[#1B1B1B] truncate">{b.nom}</p>
                  {b.certifiee && <BadgeCheck size={13} className="text-[#F5720C] flex-shrink-0" />}
                </div>
                {b.categories?.nom && (
                  <p className="text-[11px] font-semibold text-[#F5720C] mt-0.5">{b.categories.nom}</p>
                )}
                {(b.ville || b.quartier) && (
                  <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} />
                    {[b.ville, [b.quartier, b.commune].filter(Boolean).join(", ")].filter(Boolean).join(" — ")}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end mt-3 pt-2.5 border-t border-gray-100">
              <span className="text-[10px] font-bold text-[#F5720C]">Voir la boutique →</span>
            </div>
          </Link>
        ))}

        {boutiques.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-10">Aucune boutique pour l'instant</p>
        )}
      </div>
    </div>
  );
                               }
