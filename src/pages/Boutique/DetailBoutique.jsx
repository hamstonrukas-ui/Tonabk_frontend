import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, BadgeCheck, MessageCircle } from "lucide-react";

const fmt = (n) => n.toLocaleString("fr-FR") + " FC";

export default function DetailBoutique() {
  const { id } = useParams();
  const [boutique, setBoutique] = useState(null);

  useEffect(() => {
    fetch(`/api/boutiques/${id}`).then((r) => r.json()).then(setBoutique);
  }, [id]);

  if (!boutique) return <p className="text-center text-sm text-gray-400 py-10">Chargement...</p>;

  const contacterWhatsApp = () => {
    const msg = `Bonjour, j'ai vu votre boutique "${boutique.nom}" sur TonaBk.`;
    window.open(`https://wa.me/${boutique.telephone?.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div>
      <div className="bg-gradient-to-b from-[#F5720C] to-[#C9560A] px-4 pt-3 pb-6 relative">
        <Link to="/boutique" className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center mb-3">
          <ArrowLeft size={18} className="text-white" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white text-[#F5720C] font-extrabold text-xl flex items-center justify-center">
            {boutique.nom.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-white font-bold">{boutique.nom}</p>
              {boutique.certifiee && <BadgeCheck size={15} className="text-white" />}
            </div>
            <p className="text-white/80 text-xs flex items-center gap-1 mt-0.5">
              <MapPin size={11} /> {boutique.quartier}
            </p>
          </div>
        </div>
      </div>

      <div className="p-3 -mt-3">
        <div className="bg-white rounded-xl p-4 mb-3">
          {boutique.certifiee && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#F5720C] bg-[#FFF1E4] px-2 py-1 rounded-full mb-2">
              <BadgeCheck size={11} /> Boutique certifiée
            </span>
          )}
          <p className="text-sm text-gray-600">{boutique.description}</p>
          <button
            onClick={contacterWhatsApp}
            className="w-full mt-3 flex items-center justify-center gap-2 text-sm font-medium text-white rounded-lg py-2.5 bg-[#25D366]"
          >
            <MessageCircle size={16} /> Contacter la boutique
          </button>
        </div>

        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Produits ({boutique.produits?.length || 0})</p>
        <div className="grid grid-cols-2 gap-2.5">
          {boutique.produits?.map((p) => (
            <Link key={p.id} to={`/boutique/produit/${p.id}`} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="bg-[#F6F6F6] h-24 flex items-center justify-center text-3xl">
                {p.photo_url ? <img src={p.photo_thumb_url || p.photo_url} className="w-full h-full object-cover" /> : "📦"}
              </div>
              <div className="p-2.5">
                <p className="text-[11.5px] font-medium leading-tight h-8 overflow-hidden">{p.nom}</p>
                <p className="text-sm font-extrabold mt-1">{fmt(p.prix)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
