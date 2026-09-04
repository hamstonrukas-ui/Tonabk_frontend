import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function Inscription() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [surnom, setSurnom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErreur("");

    if (surnom.length < 6) {
      setErreur("Votre mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password: surnom,
      options: {
        data: { telephone, surnom },
        emailRedirectTo: `${window.location.origin}${redirect}`,
      },
    });

    setLoading(false);
    if (error) return setErreur(error.message);
    alert("Compte créé ! Vérifiez votre email pour confirmer votre inscription.");
    navigate(`/connexion?redirect=${encodeURIComponent(redirect)}`);
  };

  return (
    <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center p-4">
      <form onSubmit={handleSignUp} className="bg-white rounded-xl p-6 w-full max-w-sm space-y-3">
        <p className="text-lg font-extrabold text-center text-[#1B1B1B] mb-2">
          Tona<span className="text-[#F5720C]">Bk</span>
        </p>
        {erreur && <p className="text-xs text-red-500">{erreur}</p>}
        <input
          type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
          className="border border-gray-200 rounded-md px-3 py-2.5 text-sm w-full"
        />
        <input
          type="tel" placeholder="Numéro de téléphone (WhatsApp)" value={telephone} onChange={(e) => setTelephone(e.target.value)} required
          className="border border-gray-200 rounded-md px-3 py-2.5 text-sm w-full"
        />
        <div>
          <input
            type="text" placeholder="Choisissez un surnom" value={surnom}
            onChange={(e) => setSurnom(e.target.value)} required minLength={6}
            className="border border-gray-200 rounded-md px-3 py-2.5 text-sm w-full"
          />
          <p className="text-[11px] text-gray-400 mt-1">
            Ce mot de passe vous servira aussi à vous connecter — gardez-le pour vous, ne le partagez à personne. Minimum 6 caractères.
          </p>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-[#F5720C] text-white text-sm font-semibold rounded-md py-2.5">
          {loading ? "Création..." : "Créer mon compte"}
        </button>
        <p className="text-xs text-center text-gray-500">
          Déjà inscrit ?{" "}
          <Link to={`/connexion?redirect=${encodeURIComponent(redirect)}`} className="text-[#F5720C] font-semibold">
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  );
}
