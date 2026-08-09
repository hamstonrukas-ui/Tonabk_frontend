import { useEffect, useState } from "react";
import { Star } from "lucide-react";

export default function Avis() {
  const [reviews, setReviews] = useState([]);
  const [noteMoyenne, setNoteMoyenne] = useState(0);

  useEffect(() => {
    fetch("/api/avis")
      .then((r) => r.json())
      .then((data) => {
        setReviews(data);
        const moy = data.length ? data.reduce((s, r) => s + r.note, 0) / data.length : 0;
        setNoteMoyenne(moy.toFixed(1));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-4 flex items-center gap-4">
        <div>
          <p className="text-2xl font-bold text-[#1B1B1B]">{noteMoyenne || "—"}</p>
          <div className="flex gap-0.5 mt-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={12} fill="#FFB400" className="text-[#FFB400]" />
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-500">Basé sur {reviews.length} avis clients vérifiés</p>
      </div>

      {reviews.map((r) => (
        <div key={r.id} className="bg-white rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-[#1B1B1B]">{r.auteur_nom}</span>
            <div className="flex gap-0.5">
              {Array.from({ length: r.note }).map((_, i) => (
                <Star key={i} size={11} fill="#FFB400" className="text-[#FFB400]" />
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-600">{r.texte}</p>
        </div>
      ))}

      {reviews.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-10">Pas encore d'avis pour cette boutique</p>
      )}
    </div>
  );
}
