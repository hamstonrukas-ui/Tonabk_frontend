import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, MapPin, EyeOff, Eye, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { API_URL } from "../../lib/api";

const fmt = (n, devise) => n.toLocaleString("fr-FR") + " " + devise;

export default function GererMesMaisons() {
  const navigate = useNavigate();
  const [maisons, setMaisons] = useState(null);
  const [erreur, setErreur] = useState("");

  async function authHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/inscription?redirect=/location/mes-maisons");
      return null;
    }
    return { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` };
  }

  async function charger() {
    const headers = await authHeaders();
    if (!headers) return;

    const res = await fetch(`${API_URL}/api/maisons/mine`, { headers });
    if (res.ok) setMaisons(await res.json());
  }

  useEffect(() => { charger(); }, []);

  const toggleStatut = async (maison) => {
    setErreur("");
    const headers = await authHeaders();
    if (!headers) return;

    const nouveauStatut = maison.statut === "disponible" ? "suspendu" : "disponible";
    const res = await fetch(`${API_URL}/api/maisons/${maison.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ statut: nouveauStatut }),
    });

    if (res.ok) {
      setMaisons(maisons.map((m) => (m.id === maison.id ? { ...m, statut: nouveauStatut } : m)));
    } else {
      setErreur("Impossible de modifier cette annonce pour le moment.");
    }
  };

  const supprimer = async (maison) => {
    if (!confirm(`Supprimer définitivement "${maison.titre}" ?`)) return;
    const headers = await authHeaders();
    if (!headers) return;

    const res = await fetch(`${API_URL}/api/maisons/${maison.id}`, { method: "DELETE", headers });
    if (res.ok || res.status === 204) {
      setMaisons(maisons.filter((m) => m.id !== maison.id));
    } else {
      setErreur("Impossible de supprimer cette annonce pour le moment.");
    }
  };

  if (maisons === null) return <p className="text-center text-sm text-gray-400 py-10">Chargement...</p>;

  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-3">
        <Link to="/location" className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
          <ArrowLeft size={16} />
        </Link>
        <p className="text-sm font-bold text-[#1B1B1B] flex-1">Mes maisons</p>
        <Link
          to="/location/publier"
          className="flex items-center gap-1 bg-[#F5720C] text-white text-xs font-semibold px-3 py-2 rounded-lg"
        >
          <Plus size={14} /> Publier
        </Link>
      </div>

      {erreur && <p className="text-xs text-red-500 mb-2">{erreur}</p>}

      <div className="space-y-2.5">
        {maisons.map((m) => (
          <div key={m.id} className="bg-white rounded-xl overflow-hidden shadow-sm flex">
            <div className="w-24 h-24 bg-[#F6F6F6] flex-shrink-0">
              {m.photos_maisons?.[0]?.url ? (
                <img src={m.photos_maisons[0].url} alt={m.titre} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
              )}
            </div>

            <div className="flex-1 p-2.5 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13px] font-bold text-[#1B1B1B] truncate">{m.titre}</p>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    m.statut === "disponible" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {m.statut === "disponible" ? "Visible" : "Suspendue"}
                </span>
              </div>
              <p className="text-[10.5px] text-gray-400 flex items-center gap-1 mt-0.5">
                <MapPin size={10} /> {m.quartier}, {m.commune}
              </p>
              <p className="text-[12.5px] font-extrabold text-[#F5720C] mt-1">{fmt(m.prix, m.devise)}/mois</p>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => toggleStatut(m)}
                  className="flex items-center gap-1 text-[10.5px] font-semibold text-gray-500 border border-gray-200 rounded-md px-2 py-1"
                >
                  {m.statut === "disponible" ? <EyeOff size={11} /> : <Eye size={11} />}
                  {m.statut === "disponible" ? "Suspendre" : "Réactiver"}
                </button>
                <button
                  onClick={() => supprimer(m)}
                  className="flex items-center gap-1 text-[10.5px] font-semibold text-red-500 border border-red-200 rounded-md px-2 py-1"
                >
                  <Trash2 size={11} /> Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}

        {maisons.length === 0 && (
          <div className="text-center py-10">
            <p className="text-3xl mb-2">🏠</p>
            <p className="text-sm text-gray-400 mb-4">Vous n'avez publié aucune maison pour l'instant</p>
            <Link to="/location/publier" className="text-sm font-semibold text-[#F5720C]">
              Publier ma première annonce →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
