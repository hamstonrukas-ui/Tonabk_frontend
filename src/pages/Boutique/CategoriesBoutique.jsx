import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../../lib/api";

export default function CategoriesBoutique() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`).then((r) => r.json()).then(setCategories).catch(console.error);
  }, []);

  return (
    <div className="p-3">
      <p className="text-sm font-bold text-[#1B1B1B] mb-3">Choisissez une catégorie</p>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((c) => (
          <Link
            key={c.id}
            to={`/boutique/categorie/${c.id}`}
            className="bg-white rounded-xl p-5 flex flex-col items-center gap-2 shadow-sm"
          >
            <span className="text-3xl">{c.icone}</span>
            <span className="text-xs font-semibold text-center text-[#1B1B1B]">{c.nom}</span>
          </Link>
        ))}
      </div>

      <div className="mt-5 border-[1.5px] border-dashed border-[#F5720C] rounded-xl p-3.5 flex items-center gap-2.5 bg-[#FFF8F2]">
        <div className="flex-1">
          <p className="text-xs font-extrabold text-[#1B1B1B]">Vendez sur TonaBk</p>
          <p className="text-[10px] text-gray-400">Créez votre boutique gratuitement</p>
        </div>
        <Link to="/boutique/creer" className="bg-[#F5720C] text-white text-xs font-semibold px-3 py-2 rounded-lg">
          Créer
        </Link>
      </div>
    </div>
  );
      }
        
