 import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function MotDePasseOublie() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
    });

    setLoading(false);
    if (error) {
      setErreur("Une erreur est survenue. Vérifiez l'adresse email.");
      return;
    }
    setEnvoye(true);
  };

  return (
    <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm">
        <p className="text-lg font-extrabold text-center text-[#1B1B1B] mb-2">
          Tona<span className="text-[#F5720C]">Bk</span>
        </p>

        {envoye ? (
          <div className="text-center">
            <p className="text-2xl mb-2">📩</p>
            <p className="text-sm text-gray-600 mb-4">
              Un lien a été envoyé à <strong>{email}</strong>. Vérifiez votre boîte mail
              (et vos spams) pour choisir un nouveau mot de passe.
            </p>
            <Link to="/connexion" className="text-sm font-semibold text-[#F5720C]">
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-sm text-gray-500 text-center mb-2">
              Entrez l'email de votre compte pour recevoir un lien de réinitialisation de votre mot de passe.
            </p>
            {erreur && <p className="text-xs text-red-500">{erreur}</p>}
            <input
              type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="border border-gray-200 rounded-md px-3 py-2.5 text-sm w-full"
            />
            <button type="submit" disabled={loading} className="w-full bg-[#F5720C] text-white text-sm font-semibold rounded-md py-2.5">
              {loading ? "Envoi..." : "Envoyer le lien"}
            </button>
            <p className="text-xs text-center text-gray-500">
              <Link to="/connexion" className="text-[#F5720C] font-semibold">Retour à la connexion</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
             }
     
