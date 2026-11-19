// Expédition de colis : choix du trajet.
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, Package } from "lucide-react";
import { EXPEDITIONS, NUMERO_WHATSAPP_EXPEDITION } from "../../lib/expeditions";

export default function ListeExpeditions() {
  const contacter = () => {
    const msg = "Bonjour, je souhaite expédier un colis.";
    window.open(`https://wa.me/${NUMERO_WHATSAPP_EXPEDITION}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div>
      <div className="bg-gradient-to-b from-[#F5720C] to-[#C9560A] text-white px-4 pt-5 pb-6 rounded-b-3xl">
        <Link to="/" className="inline-flex items-center gap-1 text-xs font-semibold text-white/90">
          <ArrowLeft size={14} /> Accueil
        </Link>
        <div className="flex items-center gap-2 mt-3">
          <Package size={22} />
          <h1 className="text-xl font-extrabold">Expédition de colis</h1>
        </div>
        <p className="text-xs text-white/85 mt-1.5">Choisissez votre trajet pour voir le chemin que suit votre colis.</p>
      </div>

      <div className="px-3 mt-4 flex flex-col gap-2.5">
        {EXPEDITIONS.map((e) => (
          <Link key={e.id} to={`/expeditions/${e.id}`} className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#FFF3E8] flex items-center justify-center text-2xl flex-shrink-0">{e.emoji}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-[#1B1B1B] leading-tight">{e.titre}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{e.sous_titre}</p>
            </div>
            <ChevronRight size={18} className="text-[#F5720C] flex-shrink-0" />
          </Link>
        ))}
      </div>

      <div className="px-3 mt-5">
        <button onClick={contacter} className="w-full bg-[#25D366] text-white text-sm font-extrabold rounded-xl py-3.5">
          Une question ? Écrivez-nous sur WhatsApp
        </button>
      </div>
    </div>
  );
}
