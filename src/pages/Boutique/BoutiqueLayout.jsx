import { useEffect, useState } from "react";
import { NavLink, Outlet, useParams, Link, useSearchParams } from "react-router-dom";
import { Store, ShoppingBag, ClipboardList, Star, Users, Bell, ArrowLeft, BadgeCheck, Share2, MapPin } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { API_URL, SITE_URL } from "../../lib/api";
import { cachedFetch } from "../../lib/cache";

export default function BoutiqueLayout() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { cart } = useCart();
  const [boutique, setBoutique] = useState(null);
  const itemCount = Object.values(cart).reduce((s, q) => s + q, 0);

  useEffect(() => {
    cachedFetch(`boutique_${id}`, `${API_URL}/api/boutiques/${id}`)
      .then(({ data }) => setBoutique(data))
      .catch(() => {});
  }, [id]);

  // Mémorise le code de parrainage utilisé, pour l'inclure à la commande
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      localStorage.setItem(`parrainage_${id}`, ref.toUpperCase());
    }
  }, [id, searchParams]);

  const partagerBoutique = async () => {
    const url = `${SITE_URL}/boutique/${id}`;
    const texte = `Découvre "${boutique?.nom || "cette boutique"}" sur TonaBk !`;

    if (navigator.share) {
      try {
        await navigator.share({ title: boutique?.nom, text: texte, url });
      } catch {
        // Partage annulé par l'utilisateur
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("Lien copié !");
    }
  };

  const onglets = [
    { to: `/boutique/${id}`, label: "Catalogue", icon: Store, end: true },
    { to: `/boutique/${id}/panier`, label: "Panier", icon: ShoppingBag },
    { to: `/boutique/${id}/commande`, label: "Commande", icon: ClipboardList },
    { to: `/boutique/${id}/avis`, label: "Avis", icon: Star },
    { to: `/boutique/${id}/parrainage`, label: "Parrainage", icon: Users },
    { to: `/boutique/${id}/nouveautes`, label: "Nouveautés", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-[#F3F3F3]">
      <div className="bg-gradient-to-r from-[#F5720C] to-[#C9560A] px-3 pt-3 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <Link to="/boutique" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <ArrowLeft size={16} className="text-white" />
          </Link>
          <div className="flex-1" />
          <button onClick={partagerBoutique} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Share2 size={14} className="text-white" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {boutique?.logo_url ? (
            <img src={boutique.logo_url} alt={boutique.nom} className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-white/40" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/20 text-white font-extrabold text-xl flex items-center justify-center flex-shrink-0 border-2 border-white/40">
              {(boutique?.nom || "B").slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-lg font-extrabold text-white truncate">{boutique?.nom || "Boutique"}</p>
              {boutique?.certifiee && <BadgeCheck size={16} className="text-white flex-shrink-0" />}
            </div>
            {boutique?.description && (
              <p className="text-[11.5px] text-white/80 leading-snug mt-0.5 line-clamp-2">{boutique.description}</p>
            )}
            {(boutique?.ville || boutique?.quartier) && (
              <p className="text-[11px] text-white/70 flex items-center gap-1 mt-1">
                <MapPin size={11} />
                {[boutique.ville, [boutique.quartier, boutique.commune].filter(Boolean).join(", ")].filter(Boolean).join(" — ")}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 overflow-x-auto">
        <div className="flex px-2 py-2 gap-1 min-w-max">
          {onglets.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  isActive ? "bg-[#F5720C] text-white" : "text-gray-500"
                }`
              }
            >
              <Icon size={14} />
              {label}
              {label === "Panier" && itemCount > 0 && (
                <span className="ml-1 bg-white text-[#F5720C] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </div>
      <div className="p-3">
        <Outlet context={{ boutiqueId: id, boutique }} />
      </div>
    </div>
  );
}
