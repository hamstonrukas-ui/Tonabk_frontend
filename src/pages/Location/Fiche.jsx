import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, BedDouble, Bath, MessageCircle } from "lucide-react";

const fmt = (n, devise) => n.toLocaleString("fr-FR") + " " + devise;

export default function Fiche() {
  const { id } = useParams();
  const [maison, setMaison] = useState(null);

  useEffect(() => {
    fetch(`/api/maisons/${id}`).then((r) => r.json()).then(setMaison);
  }, [id]);

  if (!maison) return <p className="text-center text-sm text-gray-400 py-10">Chargement...</p>;

  const contacterWhatsApp = () => {
    const msg = `Bonjour, je suis intéressé(e) par "${maison.titre}" à ${maison.quartier} (${fmt(maison.prix, maison.devise)}/mois) sur TonaBk.`;
    window.open(`https://wa.me/${maison.telephone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div>
      <div className="relative h-56 bg-[#F6F6F6]">
        {maison.photos_maisons?.[0]?.url ? (
          <img src={maison.photos_maisons[0].url} alt={maison.titre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🏠</div>
        )}
        <Link to="/location" className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
          <ArrowLeft size={18} />
        </Link>
      </div>

      <div className="p-4">
        <p className="text-lg font-bold text-[#1B1B1B]">{maison.titre}</p>
        <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
          <MapPin size={13} /> {maison.quartier}, {maison.commune}
        </p>
        <p className="text-xl font-extrabold text-[#F5720C] mt-2">{fmt(maison.prix, maison.devise)}/mois</p>

        <div className="flex gap-4 mt-3 text-sm text-gray-600">
          {maison.nb_chambres && <span className="flex items-center gap-1"><BedDouble size={15} /> {maison.nb_chambres} chambres</span>}
          {maison.nb_salles_bain && <span className="flex items-center gap-1"><Bath size={15} /> {maison.nb_salles_bain} SdB</span>}
        </div>

        {maison.description && <p className="text-sm text-gray-600 mt-3">{maison.description}</p>}

        {maison.photos_maisons?.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto">
            {maison.photos_maisons.slice(1).map((p) => (
              <img key={p.id} src={p.url} className="w-20 h-20 rounded-lg object-cover" />
            ))}
          </div>
        )}

        <button
          onClick={contacterWhatsApp}
          className="w-full mt-4 flex items-center justify-center gap-2 text-sm font-medium text-white rounded-lg py-3 bg-[#25D366]"
        >
          <MessageCircle size={18} /> Contacter sur WhatsApp
        </button>
      </div>
    </div>
  );
}
