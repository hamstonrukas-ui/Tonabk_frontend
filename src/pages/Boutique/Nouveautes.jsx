import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Bell } from "lucide-react";
import { API_URL } from "../../lib/api";

export default function Nouveautes() {
  const { boutiqueId } = useOutletContext();
  const [annonces, setAnnonces] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/boutiques/${boutiqueId}/annonces`)
      .then((r) => r.json())
      .then((data) => setAnnonces(data.annonces || []))
      .catch(() => {})
      .finally(() => setChargement(false));
  }, [boutiqueId]);

  if (chargement) return <p className="text-center text-sm text-gray-400 py-10">Chargement...</p>;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1 px-1">Notifications de la boutique</p>
      {annonces.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-10">Aucune notification pour l'instant</p>
      ) : (
        annonces.map((a) => (
          <div key={a.id} className="bg-white rounded-xl p-3 flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FFF1E4] flex items-center justify-center flex-shrink-0">
              <Bell size={14} className="text-[#F5720C]" />
            </div>
            <div>
              <p className="text-sm text-[#1B1B1B]">{a.texte}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(a.created_at).toLocaleDateString("fr-FR")}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
            }
