import { Link } from "react-router-dom";
import { ArrowLeft, Flame } from "lucide-react";
import { API_URL } from "../../lib/api";
import { useCachedData } from "../../lib/useCachedData";

const fmt = (n, devise = "USD") => Number(n).toLocaleString("fr-FR") + " " + devise;

function tempsRestant(expireLe) {
  const diffMs = new Date(expireLe).getTime() - Date.now();
  if (diffMs <= 0) return null;
  const heures = Math.floor(diffMs / 3600000);
  if (heures < 1) return `${Math.ceil(diffMs / 60000)} MIN !`;
  if (heures < 24) return `${heures} H RESTANTES`;
  return `${Math.ceil(heures / 24)} J RESTANTS`;
}

const MESSAGE_BANDEAU = "🔥 GROSSES PROMOS 🔥 STOCK LIMITÉ 🔥 ÇA PART VITE 🔥 PROFITEZ-EN MAINTENANT 🔥 ";

export default function ListeSoldes() {
  const { data } = useCachedData("soldes", `${API_URL}/api/soldes`);
  const soldes = data || [];

  return (
    <div className="pb-3 bg-[#1B1B1B] min-h-screen">
      <div className="p-4 flex items-center gap-3">
        <Link to="/"><ArrowLeft size={20} className="text-white" /></Link>
        <Flame size={26} className="text-[#F5720C] animate-pulse" />
        <div>
          <p className="text-base font-extrabold text-white">SOLDES</p>
          <p className="text-[11px] text-white/50">Offres à durée limitée</p>
        </div>
      </div>

      <div className="overflow-hidden bg-[#F5720C] py-1.5">
        <div className="bandeau-defilant whitespace-nowrap text-[11px] font-extrabold text-white tracking-wide" style={{ width: "200%" }}>
          {MESSAGE_BANDEAU.repeat(4)}
        </div>
      </div>

      {soldes.length === 0 && (
        <p className="text-center text-sm text-white/40 py-14">Aucune offre en ce moment, revenez bientôt 👀</p>
      )}

      <div className="grid grid-cols-2 gap-3 p-3">
        {soldes.map((s) => {
          const reste = tempsRestant(s.expire_le);
          const pourcentage = Math.round(100 - (s.prix_solde / s.prix_normal) * 100);
          const stockFaible = s.quantite > 0 && s.quantite <= 5;

          return (
            <Link
              key={s.id}
              to={`/soldes/${s.id}`}
              className="relative bg-white rounded-2xl overflow-hidden shadow-[0_0_0_2px_#F5720C,0_0_18px_rgba(245,114,12,0.55)]"
            >
              {pourcentage > 0 && (
                <div className="absolute top-2.5 -left-8 bg-red-600 text-white text-[10px] font-extrabold px-8 py-0.5 rotate-[-35deg] z-10 shadow">
                  -{pourcentage}%
                </div>
              )}

              <div className="relative h-32 bg-[#F6F6F6]">
                {s.photo_url ? (
                  <img src={s.photo_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">🔥</div>
                )}
                {reste && (
                  <span className="absolute bottom-1.5 left-1.5 right-1.5 bg-red-600 text-white text-[9px] font-extrabold px-2 py-1 rounded text-center animate-pulse">
                    ⏳ {reste}
                  </span>
                )}
              </div>

              <div className="p-2.5">
                <p className="text-[11px] font-bold text-[#1B1B1B] line-clamp-1">{s.titre}</p>
                <p className="text-[10px] text-gray-400 line-through">{fmt(s.prix_normal, s.devise)}</p>
                <p className="text-base font-extrabold text-[#F5720C] leading-tight">{fmt(s.prix_solde, s.devise)}</p>
                {stockFaible && (
                  <p className="text-[9px] font-extrabold text-red-600 mt-0.5">
                    ⚠️ PLUS QUE {s.quantite} EN STOCK !
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
