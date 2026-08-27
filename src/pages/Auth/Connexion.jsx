import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function Connexion() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) return alert("Email ou mot de passe incorrect");
    navigate(redirect);
  };

  return (
    <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="bg-white rounded-xl p-6 w-full max-w-sm space-y-3">
        <p className="text-lg font-extrabold text-center text-[#1B1B1B] mb-2">
          Tona<span className="text-[#F5720C]">Bk</span>
        </p>
        <input
          type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
          className="border border-gray-200 rounded-md px-3 py-2.5 text-sm w-full"
        />
        <input
          type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required
          className="border border-gray-200 rounded-md px-3 py-2.5 text-sm w-full"
        />
        <p className="text-right -mt-1">
          <Link to="/mot-de-passe-oublie" className="text-xs text-[#F5720C] font-medium">Mot de passe oublié ?</Link>
        </p>
        <button type="submit" disabled={loading} className="w-full bg-[#F5720C] text-white text-sm font-semibold rounded-md py-2.5">
          {loading ? "Connexion..." : "Se connecter"}
        </button>
        <p className="text-xs text-center text-gray-500">
          Pas de compte ?{" "}
          <Link to={`/inscription?redirect=${encodeURIComponent(redirect)}`} className="text-[#F5720C] font-semibold">
            S'inscrire
          </Link>
        </p>
      </form>
    </div>
  );
        }
          
