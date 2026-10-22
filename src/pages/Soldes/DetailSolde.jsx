import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ZoomIn, X, MessageCircle } from "lucide-react";
import { API_URL } from "../../lib/api";
import { useCachedData } from "../../lib/useCachedData";

const fmt = (n, devise = "USD") => Number(n).toLocaleString("fr-FR") + " " + devise;
const NUMERO_CENTRAL = "243855841999";

function tempsRestant(expireLe) {
  const diffMs = new Date(expireLe).getTime() - Date.now();
  if (diffMs <= 0) return null;
  const heures = Math.floor(diffMs / 3600000);
  if (heures < 1) return `${Math.ceil(diffMs / 60000)} min restantes`;
  if (heures < 24) return `${heures} h restantes`;
  return `${Math.ceil(heures / 24)} j restants`;
}

export default function DetailSolde() {
  const { id } = useParams();
  const { data: solde } = useCachedData(`solde_${id}`, `${API_URL}/api/soldes/${id}`);
  const [photoActive, setPhotoActive] = useState(0);
  const [photoPleinEcran, setPhotoPleinEcran] = useState(false);

  if (!solde) return <p className="text-center text-sm text-gray-400 py-10">Chargement...</p>;

  const galerie = solde.photos?.length ? solde.photos : (solde.photo_url ? [solde.photo_url] : []);
  const reste = tempsRestant(solde.expire_le);
  const economie = solde.prix_normal - solde.prix_solde;
  const pourcentage = Math.round(100 - (solde.prix_solde / solde.prix_normal) * 100);

  const acheter = () => {
    const msg = `Bonjour, je suis intéressé(e) par l'offre "${solde.titre}" (${fmt(solde.prix_solde, solde.devise)}) vue sur TonaBk.`;
    window.open(`https://wa.me/${NUMERO_CENTRAL}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div>
      <div className="relative h-64 bg-[#F6F6F6]">
        {galerie.length > 0 ? (
          <>
            <div
              onScroll={(e) => {
                const i = Math.round(e.target.scrollLeft / e.target.clientWidth);
                if (i !== photoActive) setPhotoActive(i);
              }}
              className="w-full h-full flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none]"
            >
              {galerie.map((url, i) => (
                <img key={i} src={url} className="w-full h-full object-cover flex-shrink-0 snap-center" />
              ))}
            </div>
            {galerie.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {galerie.map((_, i) => (
                  <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === photoActive ? "bg-[#F5720C]" : "bg-white/70"}`} />
                ))}
              </div>
            )}
            <button onClick={() => setPhotoPleinEcran(true)} className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
              <ZoomIn size={16} />
            </button>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🔥</div>
        )}
        <Link to="/soldes" className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
          <ArrowLeft size={16} />
        </Link>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {reste && (
            <span className="inline-block bg-red-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full animate-pulse">
              ⏳ {reste}
            </span>
          )}
          {pourcentage > 0 && (
            <span className="inline-block bg-[#1B1B1B] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">
              -{pourcentage}% DE RÉDUCTION
            </span>
          )}
        </div>

        <h1 className="text-lg font-extrabold text-[#1B1B1B]">{solde.titre}</h1>

        <div className="flex items-baseline gap-2 mt-1.5">
          <p className="text-gray-400 line-through text-base">{fmt(solde.prix_normal, solde.devise)}</p>
          <p className="text-3xl font-extrabold text-[#F5720C]">{fmt(solde.prix_solde, solde.devise)}</p>
        </div>
        {economie > 0 && (
          <p className="text-xs text-green-600 font-bold mt-0.5">💰 Vous économisez {fmt(economie, solde.devise)} !</p>
        )}

        {solde.quantite > 0 && solde.quantite <= 5 && (
          <p className="text-xs font-extrabold text-red-600 mt-2 animate-pulse">
            ⚠️ Plus que {solde.quantite} disponible{solde.quantite > 1 ? "s" : ""} — dépêchez-vous !
          </p>
        )}
        {solde.quantite > 5 && (
          <p className="text-[11px] text-gray-400 mt-2">{solde.quantite} disponibles</p>
        )}

        {solde.description && (
          <p className="text-xs text-gray-600 mt-3 leading-relaxed">{solde.description}</p>
        )}

        <button
          onClick={acheter}
          className="w-full mt-5 flex items-center justify-center gap-2 bg-[#F5720C] text-white text-base font-extrabold rounded-lg py-4 shadow-[0_0_20px_rgba(245,114,12,0.5)] animate-pulse"
        >
          <MessageCircle size={18} /> JE VEUX CETTE OFFRE — WhatsApp
        </button>
      </div>

      {photoPleinEcran && (
        <div onClick={() => setPhotoPleinEcran(false)} className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button onClick={() => setPhotoPleinEcran(false)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <X size={18} className="text-white" />
          </button>
          <img src={galerie[photoActive]} className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  );
}
