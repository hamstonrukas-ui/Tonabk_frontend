import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Bell } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { API_URL } from "../../lib/api";

export default function Nouveautes() {
  const { id: boutiqueId } = useParams();
  const [annonce, setAnnonce] = useState("");
  const [annonces, setAnnonces] = useState([]);
  const [nbAbonnes, setNbAbonnes] = useState(0);

  useEffect(() => {
    if (!boutiqueId) return;
    fetch(`${API_URL}/api/boutiques/${boutiqueId}/annonces`)
      .then((r) => r.json())
      .then((data) => {
        setAnnonces(data.annonces || []);
        setNbAbonnes(data.nb_abonnes || 0);
      })
      .catch(() => {});
  }, [boutiqueId]);

  const sendAnnouncement = async () => {
    if (!annonce.trim() || !boutiqueId) return;
    const { data: { session } } = await supabase.auth.getSession();

    const res = await fetch(`${API_URL}/api/boutiques/${boutiqueId}/annonces`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ texte: annonce.trim() }),
    });

    if (res.ok) {
      const nouvelle = await res.json();
      setAnnonces([nouvelle, ...annonces]);
      setAnnonce("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-4">
        <p className="text-sm font-medium mb-2 text-[#1B1B1B]">
          Annoncer une nouveauté à vos {nbAbonnes} clients abonnés
        </p>
        <textarea
          value={annonce}
          onChange={(e) => setAnnonce(e.target.value)}
          placeholder="Ex: Nouvelle collection disponible cette semaine !"
          rows={3}
          className="border border-gray-200 rounded-md px-3 py-2 text-sm resize-none w-full mb-2"
        />
        <button
          onClick={sendAnnouncement}
          className="w-full flex items-center justify-center gap-2 text-sm font-medium text-white rounded-md py-2.5 bg-[#F5720C]"
        >
          <Bell size={16} /> Envoyer à tous les abonnés
        </button>
      </div>

      <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mt-4 mb-1 px-1">Annonces envoyées</p>
      <div className="space-y-2">
        {annonces.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-6">Aucune annonce envoyée</p>
        ) : (
          annonces.map((a) => (
            <div key={a.id} className="bg-white rounded-xl p-3">
              <p className="text-sm text-[#1B1B1B]">{a.texte}</p>
              <p className="text-xs text-gray-400 mt-1">Envoyé le {a.date}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
