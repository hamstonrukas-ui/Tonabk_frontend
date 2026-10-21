import { Link } from "react-router-dom";
import { ArrowLeft, Flame } from "lucide-react";
import { API_URL } from "../../lib/api";
import { useCachedData } from "../../lib/useCachedData";

const fmt = (n, devise = "USD") => Number(n).toLocaleString("fr-FR") + " " + devise;

function tempsRestant(expireLe) {
  const diffMs = new Date(expireLe).getTime() - Date.now();
  if (diffMs <= 0) return null;
  const heures = Math.floor(diffMs / 3600000);
  if (heures < 1) return `${Math.ceil(diffMs / 60000)} min restantes`;
  if (heures < 24) return `${heures} h restantes`;
  return `${Math.ceil(heures / 24)} j restants`;
}

export default function ListeSoldes() {
  const { data } = useCachedData("soldes", `${API_URL}/api/soldes`);
  const soldes = data || [];

  return (
    <div className="p-3">
      <div className="bg-[#1B1B1B] rounded-xl p-4 text-white flex items-center gap-3 mb-4">
        <Link to="/"><ArrowLeft size={18} /></Link>
        <Flame size={22} className="text-[#F5720C]" />
        <div>
          <p className="text-sm font-extrabold">Soldes</p>
          <p className="text-[11px] text-white/60">Offres à durée limitée</p>
        </div>
      </div>

      {soldes.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-10">Aucune offre en ce moment.</p>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        {soldes.map((s) => {
          const reste = tempsRestant(s.expire_le);
          return (
            <Link
              key={s.id}
              to={`/soldes/${s.id}`}
              className="bg-white rounded-xl overflow-hidden border border-[#F5720C]/30"
            >
              <div className="relative h-28 bg-[#F6F6F6]">
                {s.photo_url ? (
                  <img src={s.photo_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">🔥</div>
                )}
                {reste && (
                  <span className="absolute top-1.5 left-1.5 bg-[#1B1B1B] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                    {reste}
                  </span>
                )}
              </div>
              <div className="p-2">
                <p className="text-[11px] font-semibold text-[#1B1B1B] line-clamp-1">{s.titre}</p>
                <p className="text-[10px] text-gray-400 line-through">{fmt(s.prix_normal, s.devise)}</p>
                <p className="text-xs font-extrabold text-[#F5720C]">{fmt(s.prix_solde, s.devise)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
