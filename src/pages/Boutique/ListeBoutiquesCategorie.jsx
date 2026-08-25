import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BadgeCheck, MapPin } from "lucide-react";
import { API_URL } from "../../lib/api";
import { useCachedData } from "../../lib/useCachedData";

export default function ListeBoutiquesCategorie() {
  const { categorieId } = useParams();

  const { data: boutiquesData } = useCachedData(
    `boutiques_categorie_${categorieId}`,
    `${API_URL}/api/boutiques?categorie_id=${categorieId}`,
    {},
    [categorieId]
  );
  const boutiques = boutiquesData || [];

  const { data: categoriesData } = useCachedData("categories", `${API_URL}/api/categories`);
  const categorie = (categoriesData || []).find((c) => c.id === categorieId);

  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-3">
        <Link to="/boutique" className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
          <ArrowLeft size={16} />
        </Link>
        <p className="text-sm font-bold text-[#1B1B1B]">
          {categorie ? `${categorie.icone} ${categorie.nom}` : "Boutiques"}
        </p>
      </div>

      <div className="space-y-2.5">
        {boutiques.map((b) => (
          <Link key={b.id} to={`/boutique/${b.id}`} className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#F5720C] text-white font-bold flex items-center justify-center flex-shrink-0">
              {b.nom.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <p className="text-sm font-semibold text-[#1B1B1B]">{b.nom}</p>
                {b.certifiee && <BadgeCheck size={13} className="text-[#F5720C]" />}
              </div>
              {b.quartier && (
                <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                  <MapPin size={10} /> {b.quartier}
                </p>
              )}
            </div>
          </Link>
        ))}
        {boutiques.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-10">Aucune boutique dans cette catégorie pour l'instant</p>
        )}
      </div>
    </div>
  );
}
