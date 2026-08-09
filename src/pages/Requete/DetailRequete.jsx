import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function DetailRequete() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requete, setRequete] = useState(null);
  const [message, setMessage] = useState("");
  const [prixPropose, setPrixPropose] = useState("");
  const [loading, setLoading] = useState(false);
  const [envoye, setEnvoye] = useState(false);

  useEffect(() => {
    fetch(`/api/requetes/${id}`).then((r) => r.json()).then(setRequete).catch(console.error);
  }, [id]);

  const handleReponse = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("Connectez-vous pour répondre à cette requête");
      setLoading(false);
      return navigate("/connexion");
    }

    const res = await fetch("/api/reponses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({
        requete_id: id,
        message,
        prix_propose: prixPropose ? Number(prixPropose) : null,
      }),
    });

    setLoading(false);
    if (res.ok) setEnvoye(true);
    else alert("Erreur lors de l'envoi");
  };

  if (!requete) return <p className="text-center text-sm text-gray-400 py-10">Chargement...</p>;

  return (
    <div className="p-3">
      <div className="bg-white rounded-xl p-4 mb-3">
        {requete.categories?.nom && (
          <span className="text-[10px] font-semibold text-[#F5720C] bg-[#FFF1E4] px-2 py-0.5 rounded-full">
            {requete.categories.nom}
          </span>
        )}
        <p className="text-sm text-[#1B1B1B] mt-2">{requete.description}</p>
      </div>

      {envoye ? (
        <div className="bg-green-50 text-green-700 text-sm rounded-xl p-4 text-center">
          ✅ Votre réponse a été envoyée. Notre équipe vous recontactera si ça correspond.
        </div>
      ) : (
        <form onSubmit={handleReponse} className="bg-white rounded-xl p-4 space-y-2">
          <p className="text-sm font-semibold text-[#1B1B1B]">Vous avez cet article ?</p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Décrivez ce que vous proposez..."
            rows={3}
            required
            className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full resize-none"
          />
          <input
            type="number"
            value={prixPropose}
            onChange={(e) => setPrixPropose(e.target.value)}
            placeholder="Prix proposé (optionnel)"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full"
          />
          <button type="submit" disabled={loading} className="w-full bg-[#F5720C] text-white text-sm font-semibold rounded-md py-2.5">
            {loading ? "Envoi..." : "Envoyer ma réponse"}
          </button>
        </form>
      )}
    </div>
  );
}
