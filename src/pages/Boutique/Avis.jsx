import { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { API_URL } from "../../lib/api";

export default function Avis() {
  const { boutiqueId } = useOutletContext();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [noteMoyenne, setNoteMoyenne] = useState(0);
  const [afficherForm, setAfficherForm] = useState(false);
  const [noteChoisie, setNoteChoisie] = useState(5);
  const [auteurNom, setAuteurNom] = useState("");
  const [texte, setTexte] = useState("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  async function charger() {
    const res = await fetch(`${API_URL}/api/avis?boutique_id=${boutiqueId}`);
    if (res.ok) {
      const data = await res.json();
      setReviews(data);
      const moy = data.length ? data.reduce((s, r) => s + r.note, 0) / data.length : 0;
      setNoteMoyenne(moy.toFixed(1));
    }
  }

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boutiqueId]);

  const ouvrirFormulaire = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate(`/inscription?redirect=/boutique/${boutiqueId}/avis`);
      return;
    }
    setAfficherForm(true);
  };

  const envoyerAvis = async (e) => {
    e.preventDefault();
    if (!texte.trim() || !auteurNom.trim()) return;
    setEnvoiEnCours(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setEnvoiEnCours(false);
      return navigate(`/inscription?redirect=/boutique/${boutiqueId}/avis`);
    }

    const res = await fetch(`${API_URL}/api/avis`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ boutique_id: boutiqueId, auteur_nom: auteurNom.trim(), note: noteChoisie, texte: texte.trim() }),
    });

    if (res.ok) {
      setAuteurNom(""); setTexte(""); setNoteChoisie(5); setAfficherForm(false);
      charger();
    }
    setEnvoiEnCours(false);
  };

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
        <p className="text-xs text-gray-500">Basé sur {reviews.length} avis clients</p>
      </div>

      {!afficherForm ? (
        <button
          onClick={ouvrirFormulaire}
          className="w-full bg-[#F5720C] text-white text-sm font-semibold rounded-xl py-2.5"
        >
          Laisser un avis
        </button>
      ) : (
        <form onSubmit={envoyerAvis} className="bg-white rounded-xl p-4 space-y-2.5">
          <p className="text-sm font-semibold text-[#1B1B1B]">Votre note</p>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} type="button" onClick={() => setNoteChoisie(i)}>
                <Star size={24} fill={i <= noteChoisie ? "#FFB400" : "none"} className="text-[#FFB400]" />
              </button>
            ))}
          </div>
          <input
            value={auteurNom}
            onChange={(e) => setAuteurNom(e.target.value)}
            placeholder="Votre nom"
            required
            className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full"
          />
          <textarea
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            placeholder="Partagez votre expérience avec cette boutique"
            rows={3}
            required
            className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full resize-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAfficherForm(false)}
              className="flex-1 border border-gray-200 text-gray-500 text-sm font-semibold rounded-md py-2.5"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={envoiEnCours}
              className="flex-1 bg-[#F5720C] text-white text-sm font-semibold rounded-md py-2.5"
            >
              {envoiEnCours ? "Envoi..." : "Publier"}
            </button>
          </div>
        </form>
      )}

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

      {reviews.length === 0 && !afficherForm && (
        <p className="text-center text-sm text-gray-400 py-10">Pas encore d'avis pour cette boutique</p>
      )}
    </div>
  );
}
