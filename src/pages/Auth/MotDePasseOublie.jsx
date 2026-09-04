 import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function ReinitialiserMotDePasse() {
  const navigate = useNavigate();
  const [surnom, setSurnom] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");

    if (surnom !== confirmation) {
      setErreur("Les surnoms ne correspondent pas");
      return;
    }
    if (surnom.length < 6) {
      setErreur("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: surnom });
    setLoading(false);

    if (error) {
      setErreur("Le lien a peut-être expiré. Redemandez un nouveau lien de réinitialisation.");
      return;
    }

    alert("Mot de passe mis à jour !");
    navigate("/connexion");
  };

  return (
    <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-full max-w-sm space-y-3">
        <p className="text-lg font-extrabold text-center text-[#1B1B1B] mb-2">
          Tona<span className="text-[#F5720C]">Bk</span>
        </p>
        <p className="text-sm text-gray-500 text-center mb-2">Choisissez votre nouveau mot de passe</p>
        {erreur && <p className="text-xs text-red-500">{erreur}</p>}
        <input
          type="text" placeholder="Nouveau mot de passe" value={surnom}
          onChange={(e) => setSurnom(e.target.value)} required minLength={6}
          className="border border-gray-200 rounded-md px-3 py-2.5 text-sm w-full"
        />
        <input
          type="text" placeholder="Confirmer le mot de passe" value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)} required minLength={6}
          className="border border-gray-200 rounded-md px-3 py-2.5 text-sm w-full"
        />
        <button type="submit" disabled={loading} className="w-full bg-[#F5720C] text-white text-sm font-semibold rounded-md py-2.5">
          {loading ? "Mise à jour..." : "Mettre à jour"}
        </button>
      </form>
    </div>
  );
}

