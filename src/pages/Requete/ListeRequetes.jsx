import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function ListeRequetes() {
  const [requetes, setRequetes] = useState([]);

  useEffect(() => {
    fetch("/api/requetes").then((r) => r.json()).then(setRequetes).catch(console.error);
  }, []);

  return (
    <div className="p-3">
      <div className="bg-[#1B1B1B] rounded-xl p-4 text-white flex items-center gap-3 mb-4">
        <span className="text-2xl">🔎</span>
        <div className="flex-1">
          <p className="text-sm font-bold">Introuvable sur TonaBk ?</p>
          <p className="text-xs text-gray-300">Publiez une requête, on le cherche pour vous</p>
        </div>
        <Link to="/requete/publier" className="bg-[#F5720C] text-xs font-bold px-3 py-2 rounded-full whitespace-nowrap">
          Demander
        </Link>
      </div>

      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Requêtes en cours</p>

      <div className="space-y-2">
        {requetes.map((r) => (
          <Link key={r.id} to={`/requete/${r.id}`} className="block bg-white rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              {r.categories?.nom && (
                <span className="text-[10px] font-semibold text-[#F5720C] bg-[#FFF1E4] px-2 py-0.5 rounded-full">
                  {r.categories.nom}
                </span>
              )}
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                r.statut === "ouverte" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
              }`}>
                {r.statut === "ouverte" ? "Ouverte" : r.statut}
              </span>
            </div>
            <p className="text-sm text-[#1B1B1B]">{r.description}</p>
          </Link>
        ))}
        {requetes.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">Aucune requête pour l'instant</p>
        )}
      </div>
    </div>
  );
}
