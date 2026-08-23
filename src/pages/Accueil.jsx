import { Link } from "react-router-dom";
import { Search, ShoppingBag, BadgeCheck } from "lucide-react";
import { useCachedData } from "../lib/useCachedData";
import { API_URL } from "../lib/api";

const fmt = (n, devise = "USD") => n.toLocaleString("fr-FR") + " " + devise;

export default function Accueil() {
  const { data: produits } = useCachedData("produits_accueil", `${API_URL}/api/produits/accueil`);
  const { data: boutiques } = useCachedData("boutiques_accueil", `${API_URL}/api/boutiques`);

  return (
    <div className="min-h-screen bg-[#F3F3F3] pb-4">
      <div className="bg-gradient-to-b from-[#F5720C] to-[#C9560A] px-4 pt-3 pb-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xl font-extrabold text-white">
            Tona<span className="bg-white text-[#1B1B1B] px-1 rounded">Bk</span>
          </span>
          <Link to="/boutique/panier" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <ShoppingBag size={16} className="text-white" />
          </Link>
        </div>
        <Link to="/boutique/recherche" className="bg-white rounded-lg flex items-center gap-2 px-3 py-2.5 text-xs text-gray-400">
          <Search size={15} /> Chaussures, smartphone, riz...
        </Link>
      </div>

      <div className="mx-3 mt-3 bg-[#1B1B1B] rounded-xl p-3 flex items-center gap-3">
        <span className="text-xl">🔎</span>
        <div className="flex-1">
          <p className="text-xs font-bold text-white">Introuvable ? On le cherche pour vous.</p>
        </div>
        <Link to="/requete/publier" className="bg-[#F5720C] text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
          Demander
        </Link>
      </div>

      <div className="flex justify-between items-baseline px-3 pt-4 pb-2">
        <h2 className="text-sm font-extrabold text-[#1B1B1B]">Articles</h2>
      </div>
      <div className="grid grid-cols-2 gap-2.5 px-3">
        {(produits || []).map((p) => (
          <Link key={p.id} to={`/boutique/produit/${p.id}`} className="bg-white rounded-xl overflow-hidden shadow-sm relative">
            {p.sponsorise && (
              <span className="absolute top-1.5 left-1.5 z-10 bg-[#F5720C] text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                Sponsorisé
              </span>
            )}
            <div className="bg-[#F6F6F6] h-24 flex items-center justify-center text-3xl">
              {p.photo_url ? <img src={p.photo_thumb_url || p.photo_url} className="w-full h-full object-cover" /> : "📦"}
            </div>
            <div className="p-2.5">
              <p className="text-[11.5px] text-gray-800 font-medium leading-tight h-8 overflow-hidden">{p.nom}</p>
              <p className="text-sm font-extrabold mt-1">{fmt(p.prix, p.devise)}</p>
              <div className="flex items-center gap-1">
                <p className="text-[9px] text-gray-400">{p.boutiques?.nom}</p>
                {p.boutiques?.certifiee && <BadgeCheck size={10} className="text-[#F5720C]" />}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-between items-baseline px-3 pt-4 pb-2">
        <h2 className="text-sm font-extrabold text-[#1B1B1B]">Boutiques populaires</h2>
      </div>
      <div className="flex gap-2.5 px-3 overflow-x-auto">
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

      <div className="mx-3 mt-4 border-[1.5px] border-dashed border-[#F5720C] rounded-xl p-3.5 flex items-center gap-2.5 bg-[#FFF8F2]">
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
            
