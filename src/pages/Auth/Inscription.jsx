import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function Inscription() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telephone, setTelephone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { telephone },
        emailRedirectTo: `${window.location.origin}${redirect}`,
      },
    });

    setLoading(false);
    if (error) return alert(error.message);
    alert("Compte créé ! Vérifiez votre email pour confirmer votre inscription.");
    navigate(`/connexion?redirect=${encodeURIComponent(redirect)}`);
  };

  return (
    <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center p-4">
      <form onSubmit={handleSignUp} className="bg-white rounded-xl p-6 w-full max-w-sm space-y-3">
        <p className="text-lg font-extrabold text-center text-[#1B1B1B] mb-2">
          Tona<span className="text-[#F5720C]">Bk</span>
        </p>
        <input
          type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
          className="border border-gray-200 rounded-md px-3 py-2.5 text-sm w-full"
        />
        <input
          type="tel" placeholder="Numéro de téléphone" value={telephone} onChange={(e) => setTelephone(e.target.value)} required
          className="border border-gray-200 rounded-md px-3 py-2.5 text-sm w-full"
        />
        <input
          type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
          className="border border-gray-200 rounded-md px-3 py-2.5 text-sm w-full"
        />
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
