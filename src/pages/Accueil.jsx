import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingBag, BadgeCheck, ChevronLeft, ChevronRight, Store, Flame, Loader2 } from "lucide-react";
import { useCachedData } from "../lib/useCachedData";
import { supabase } from "../lib/supabaseClient";
import { API_URL } from "../lib/api";
import Footer from "../components/Footer";
import { obtenirMarque, changerDeVille } from "../lib/marque";

const fmt = (n, devise = "USD") => n.toLocaleString("fr-FR") + " " + devise;
const PRODUITS_PAR_PAGE = 30;

export default function Accueil() {
  const marque = obtenirMarque();
  const [page, setPage] = useState(1);
  const [maBoutique, setMaBoutique] = useState(null);

  useEffect(() => {
    async function verifierMaBoutique() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${API_URL}/api/boutiques/mine`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const mesBoutiques = await res.json();
        setMaBoutique(mesBoutiques[0] || null);
      }
    }
    verifierMaBoutique();
  }, []);

  const { data: reponseProduits, loading: produitsEnChargement } = useCachedData(
    `produits_accueil_page_${page}_${marque.ville}`,
    `${API_URL}/api/produits/accueil?page=${page}&limit=${PRODUITS_PAR_PAGE}&ville=${marque.ville}`,
    {},
    [page]
  );
  const { data: boutiques } = useCachedData(`boutiques_accueil_${marque.ville}`, `${API_URL}/api/boutiques?ville=${marque.ville}`);

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
            {marque.prefixe}<span className="bg-white text-[#1B1B1B] px-1 rounded">{marque.suffixe}</span>
          </span>
          <div className="flex items-center gap-2">
            {maBoutique && (
              <Link
                to="/boutique/gerer"
                className="flex items-center gap-1 bg-white/20 rounded-full pl-2 pr-2.5 py-1.5"
              >
                <Store size={13} className="text-white" />
                <span className="text-[10px] font-bold text-white whitespace-nowrap">Entrer dans boutique</span>
              </Link>
            )}
            <Link
              to="/soldes"
              className="w-14 h-14 rounded-xl bg-[#1B1B1B] flex flex-col items-center justify-center flex-shrink-0 border-2 border-white"
            >
              <Flame size={16} className="text-[#F5720C]" />
              <span className="text-[8px] font-extrabold text-white leading-tight mt-0.5">Soldes</span>
            </Link>
            <Link to="/boutique/panier" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <ShoppingBag size={16} className="text-white" />
            </Link>
          </div>
        </div>
        <p className="text-[16px] text-white/80 mb-1">Grand marché du Kivu</p>
        <button
          onClick={() => changerDeVille(marque.autreVilleCle)}
          className="inline-flex items-center gap-0.5 mb-2.5 text-[11px] font-semibold text-white/80"
        >
          Passer vers {marque.autreMarque} <ChevronRight size={12} />
        </button>
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
      {produitsEnChargement && produits.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Loader2 size={28} className="animate-spin text-[#F5720C] mb-2" />
          <p className="text-xs">Chargement des articles...</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 px-3 lg:px-8">
        {produits.map((p) => (
          <Link
            key={p.id}
            to={`/boutique/produit/${p.id}`}
            state={{ depuisAccueil: true }}
            className="bg-white rounded-xl overflow-hidden shadow-sm relative"
          >
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
              <p className="text-sm font-extrabold mt-1">{fmt(p.prix_gros || p.prix, p.devise)}</p>
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
        <Link to="/boutique/populaires" className="text-[10px] font-bold text-[#F5720C] flex items-center gap-0.5">
          Voir tout <ChevronRight size={12} />
        </Link>
      </div>
      <div className="flex gap-2.5 px-3 lg:px-8 overflow-x-auto">
        {(boutiques || []).slice(0, 10).map((b) => (
          <Link key={b.id} to={`/boutique/${b.id}`} className="flex-shrink-0 w-24 bg-white rounded-xl p-2.5 text-center shadow-sm">
            {b.logo_url ? (
              <img src={b.logo_url} alt={b.nom} className="w-11 h-11 rounded-full object-cover mx-auto mb-1.5" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#F5720C] text-white font-bold flex items-center justify-center mx-auto mb-1.5">
                {b.nom.slice(0, 2).toUpperCase()}
              </div>
            )}
            <p className="text-[10.5px] font-bold">{b.nom}</p>
            {b.certifiee && (
              <div className="flex items-center justify-center gap-0.5 mt-0.5">
                <BadgeCheck size={9} className="text-[#F5720C]" />
                <span className="text-[7px] font-semibold text-[#F5720C]">Certifiée</span>
              </div>
            )}
            <p className="text-[8.5px] text-gray-400">{b.categories?.nom}{b.ville ? ` · ${b.ville}` : ""}</p>
          </Link>
        ))}
      </div>

      <div className="mx-3 lg:mx-8 mt-4 border-[1.5px] border-dashed border-[#F5720C] rounded-xl p-3.5 flex items-center gap-2.5 bg-[#FFF8F2] max-w-3xl">
        <div className="flex-1">
          <p className="text-xs font-extrabold text-[#1B1B1B]">Vendez sur {marque.nom}</p>
          <p className="text-[10px] text-gray-400">Créez votre boutique gratuitement</p>
        </div>
        <Link to="/boutique/creer" className="bg-[#F5720C] text-white text-xs font-semibold px-3 py-2 rounded-lg">
          Créer
        </Link>
      </div>

      <a
        href={`https://wa.me/243855841999?text=${encodeURIComponent(`Bonjour, je voulais me renseigner sur comment obtenir les produits se trouvant sur ${marque.nom}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mx-3 lg:mx-8 mt-4 border border-gray-200 rounded-xl p-3.5 flex items-center gap-3 bg-white max-w-3xl"
      >
        <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="white" width={20} height={20}>
            <path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.48-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01s-.52.07-.8.37c-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
            <path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.93-1.47A10 10 0 1 0 12 2zm0 18.2a8.18 8.18 0 0 1-4.17-1.14l-.3-.18-3.1.92.93-3-.2-.31A8.2 8.2 0 1 1 12 20.2z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-extrabold text-[#1B1B1B]">
            Pour plus d'informations sur les produits, contactez-nous sur WhatsApp
          </p>
          <p className="text-[10px] text-gray-400">Réponse rapide garantie</p>
        </div>
      </a>

      <Footer />
    </div>
  );
  }
    
