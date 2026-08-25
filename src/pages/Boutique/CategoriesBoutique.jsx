import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Store, Plus } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { API_URL } from "../../lib/api";
import { useCachedData } from "../../lib/useCachedData";

export default function CategoriesBoutique() {
  const { data: categoriesData } = useCachedData("categories", `${API_URL}/api/categories`);
  const categories = categoriesData || [];
  const [connecte, setConnecte] = useState(false);
  const [maBoutique, setMaBoutique] = useState(null);
  const [chargementCompte, setChargementCompte] = useState(true);

  useEffect(() => {
    async function verifierCompte() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setChargementCompte(false);
        return;
      }
      setConnecte(true);

      const res = await fetch(`${API_URL}/api/boutiques/mine`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const mesBoutiques = await res.json();
        setMaBoutique(mesBoutiques[0] || null);
      }
      setChargementCompte(false);
    }
    verifierCompte();
  }, []);

  return (
    <div className="p-3">
      {/* Bandeau "Ma boutique" — visible seulement si connecté et propriétaire d'une boutique */}
      {!chargementCompte && connecte && maBoutique && (
        <Link
          to="/boutique/gerer"
          className="flex items-center gap-3 bg-[#1B1B1B] rounded-xl p-3.5 mb-2.5"
        >
          <div className="w-10 h-10 rounded-full bg-[#F5720C] text-white font-bold flex items-center justify-center flex-shrink-0">
            <Store size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">Ma boutique</p>
            <p className="text-[11px] text-gray-300">
              {maBoutique.nom} — Aller dans ma boutique et gérer mes produits
            </p>
          </div>
        </Link>
      )}

      {/* Bouton "Créer ma boutique" — juste après, toujours bien visible */}
      {!chargementCompte && !maBoutique && (
        <Link
          to="/boutique/creer"
          className="flex items-center gap-3 bg-[#F5720C] rounded-xl p-3.5 mb-4"
        >
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Plus size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">Créer ma boutique</p>
            <p className="text-[11px] text-white/80">Gratuit — vendez dès aujourd'hui</p>
          </div>
        </Link>
      )}

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
    </div>
  );
}
