import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingBag, BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { useCachedData } from "../lib/useCachedData";
import { API_URL } from "../lib/api";

const fmt = (n, devise = "USD") => n.toLocaleString("fr-FR") + " " + devise;
const PRODUITS_PAR_PAGE = 30;

export default function Accueil() {
  const [page, setPage] = useState(1);

  const { data: reponseProduits } = useCachedData(
    `produits_accueil_page_${page}`,
    `${API_URL}/api/produits/accueil?page=${page}&limit=${PRODUITS_PAR_PAGE}`,
    {},
    [page]
  );
  const { data: boutiques } = useCachedData("boutiques_accueil", `${API_URL}/api/boutiques`);

  const produits = reponseProduits?.data || [];
  const totalPages = reponseProduits?.totalPages || 1;

  const allerPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const numerosPages = () => {
    const debut = Math.max(1, page - 2);
    const fin = Math.min(totalPages, debut + 4);
    const nums = [];
    for (let i = Math.max(1, fin - 4); i <= fin; i++) nums.push(i);
    return nums;
  };

  return (
    <div className="min-h-screen bg-[#F3F3F3] pb-4">
      <div className="bg-gradient-to-b from-[#F5720C] to-[#C9560A] px-4 lg:px-8 pt-3 pb-4">
        <div className="flex items-center justify-between mb-1 max-w-3xl mx-auto lg:mx-0">
          <span className="text-xl font-extrabold text-white">
            Tona<span className="bg-white text-[#1B1B1B] px-1 rounded">Bk</span>
          </span>
          <Link to="/boutique/panier" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <ShoppingBag size={16} className="text-white" />
          </Link>
        </div>
        <p className="text-[22px] text-white/80 mb-2.5">Grand marché de Bukavu</p>
        <Link to="/boutique/recherche" className="max-w-3xl bg-white rounded-lg flex items-center gap-2 px-3 py-2.5 text-xs text-gray-400">
          <Search size={15} /> Chaussures, smartphone, riz...
        </Link>
      </div>

      <div className="mx-3 lg:mx-8 mt-3 bg-[#1B1B1B] rounded-xl p-3 flex items-center gap-3 max-w-3xl">
        <span className="text-xl">🔎</span>
        <div className="flex-1">
          <p className="text-xs font-bold text-white">Introuvable ? On le cherche pour vous.</p>
        </div>
        <Link to="/requete/publier" className="bg-[#F5720C] text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
          Demander
        </Link>
      </div>

      <div className="flex justify-between items-baseline px-3 lg:px-8 pt-4 pb-2">
        <h2 className="text-sm font-extrabold text-[#1B1B1B]">Articles</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 px-3 lg:px-8">
        {produits.map((p) => (
          <Link key={p.id} to={`/boutique/produit/${p.id}`} className="bg-white rounded-xl overflow-hidden shadow-sm relative">
            {p.sponsorise && (
              <span className="absolute top-1.5 left-1.5 z-10 bg-[#F5720C] text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                Sponsorisé
              </span>
            )}
            <div className="bg-[#F6F6F6] h-24 lg:h-36 flex items-center justify-center text-3xl">
              {p.photo_url ? <img src={p.photo_thumb_url || p.photo_url} className="w-full h-full object-cover" /> : "📦"}
            </div>
            <div className="p-2.5">
              <p className="text-[11.5px] text-gray-800 font-medium leading-tight h-8 overflow-hidden">{p.nom}</p>
              <p className="text-sm font-extrabold mt-1">{fmt(p.prix, p.devise)}</p>
              <p className="text-[9px] font-semibold text-[#F5720C] mt-0.5">Voir détails →</p>
              <div className="flex items-center gap-1">
                <p className="text-[9px] text-gray-400">{p.boutiques?.nom}</p>
                {p.boutiques?.certifiee && <BadgeCheck size={10} className="text-[#F5720C]" />}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 px-3 pt-4">
          <button
            onClick={() => allerPage(page - 1)}
            disabled={page === 1}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center disabled:opacity-30"
          >
            <ChevronLeft size={16} className="text-[#1B1B1B]" />
          </button>

          {numerosPages()[0] > 1 && <span className="text-xs text-gray-400 px-1">...</span>}

          {numerosPages().map((n) => (
            <button
              key={n}
              onClick={() => allerPage(n)}
              className={`w-8 h-8 rounded-full text-xs font-semibold ${
                n === page ? "bg-[#F5720C] text-white" : "bg-white text-[#1B1B1B]"
              }`}
            >
              {n}
            </button>
          ))}

          {numerosPages()[numerosPages().length - 1] < totalPages && (
            <span className="text-xs text-gray-400 px-1">...</span>
          )}

          <button
            onClick={() => allerPage(page + 1)}
            disabled={page === totalPages}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center disabled:opacity-30"
          >
            <ChevronRight size={16} className="text-[#1B1B1B]" />
          </button>
        </div>
      )}

      <div className="flex justify-between items-baseline px-3 lg:px-8 pt-4 pb-2">
        <h2 className="text-sm font-extrabold text-[#1B1B1B]">Boutiques populaires</h2>
      </div>
      <div className="flex gap-2.5 px-3 lg:px-8 overflow-x-auto">
        {(boutiques || []).map((b) => (
          <Link key={b.id} to={`/boutique/${b.id}`} className="flex-shrink-0 w-24 bg-white rounded-xl p-2.5 text-center shadow-sm">
            <div className="w-11 h-11 rounded-full bg-[#F5720C] text-white font-bold flex items-center justify-center mx-auto mb-1.5">
              {b.nom.slice(0, 2).toUpperCase()}
            </div>
            <p className="text-[10.5px] font-bold">{b.nom}</p>
            {b.certifiee && (
              <div className="flex items-center justify-center gap-0.5 mt-0.5">
                <BadgeCheck size={9} className="text-[#F5720C]" />
                <span className="text-[7px] font-semibold text-[#F5720C]">Certifiée</span>
              </div>
            )}
            <p className="text-[8.5px] text-gray-400">{b.categories?.nom}</p>
          </Link>
        ))}
      </div>

      <div className="mx-3 lg:mx-8 mt-4 border-[1.5px] border-dashed border-[#F5720C] rounded-xl p-3.5 flex items-center gap-2.5 bg-[#FFF8F2] max-w-3xl">
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
    
