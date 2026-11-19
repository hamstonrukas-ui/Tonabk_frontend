// Détail d'un trajet : carte de l'itinéraire, étapes, informations, contact WhatsApp.
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import CarteItineraire from "../../components/CarteItineraire";
import { trouverExpedition, roleDuPoint, NUMERO_WHATSAPP_EXPEDITION } from "../../lib/expeditions";

const COULEUR = { Départ: "bg-[#2E9E5B]", Escale: "bg-[#F5720C]", Arrivée: "bg-[#C62828]" };

export default function DetailExpedition() {
  const { id } = useParams();
  const exp = trouverExpedition(id);
  if (!exp) return <Navigate to="/expeditions" replace />;

  const contacter = () => {
    const msg = `Bonjour, je souhaite expédier un colis : ${exp.titre}.`;
    window.open(`https://wa.me/${NUMERO_WHATSAPP_EXPEDITION}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div>
      <div className="bg-gradient-to-b from-[#F5720C] to-[#C9560A] text-white px-4 pt-5 pb-5 rounded-b-3xl">
        <Link to="/expeditions" className="inline-flex items-center gap-1 text-xs font-semibold text-white/90">
          <ArrowLeft size={14} /> Tous les trajets
        </Link>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-2xl">{exp.emoji}</span>
          <h1 className="text-lg font-extrabold leading-tight">{exp.titre}</h1>
        </div>
        <p className="text-xs text-white/85 mt-1">{exp.sous_titre}</p>
      </div>

      <div className="px-3 mt-4 flex flex-col gap-3.5">
        <CarteItineraire points={exp.points} />

        <div className="bg-white rounded-2xl p-4">
          <p className="text-xs font-extrabold text-[#1B1B1B] mb-3">Le trajet de votre colis</p>
          <ol className="flex flex-col">
            {exp.points.map((p, i) => {
              const role = roleDuPoint(exp.points, i);
              const dernier = i === exp.points.length - 1;
              return (
                <li key={`${p.nom}${i}`} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`w-3.5 h-3.5 rounded-full ${COULEUR[role] || "bg-[#F5720C]"} mt-0.5`} />
                    {!dernier && <span className="w-0.5 flex-1 bg-gray-200 my-1" />}
                  </div>
                  <div className={dernier ? "" : "pb-3"}>
                    <p className="text-[13px] font-bold text-[#1B1B1B] leading-tight">
                      {p.nom} <span className="text-[11px] font-medium text-gray-400">· {p.pays}</span>
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {role}{p.mode ? ` · arrivée par ${p.mode.toLowerCase()}` : ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="bg-white rounded-2xl p-4">
          <p className="text-xs font-extrabold text-[#1B1B1B] mb-2 flex items-center gap-1.5">
            <MapPin size={14} className="text-[#F5720C]" /> Informations
          </p>
          {exp.infos?.length ? (
            <div className="flex flex-col gap-3">
              {exp.infos.map((info) => (
                <div key={info.titre}>
                  <p className="text-[12px] font-bold text-[#C9560A]">{info.titre}</p>
                  <p className="text-[13px] text-gray-700 leading-snug whitespace-pre-line">{info.texte}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-gray-500">Les informations de ce trajet (délais, tarifs, conditions) arrivent bientôt. En attendant, écrivez-nous sur WhatsApp.</p>
          )}
        </div>

        <button onClick={contacter} className="w-full bg-[#25D366] text-white text-sm font-extrabold rounded-xl py-3.5 mb-2">
          Expédier un colis : contacter sur WhatsApp
        </button>
      </div>
    </div>
  );
}
