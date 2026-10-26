import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../lib/api";
import { supabase } from "../../lib/supabaseClient";

const NUMERO_SUPPORT = "243855841999";
const NUMERO_SUPPORT_AFFICHE = "+243 855 841 999";

export default function AccederBoutique() {
  const navigate = useNavigate();
  const [etape, setEtape] = useState(1); // 1 = nom+numéro, 2 = attente message, 3 = code
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");

  const verifier = async (e) => {
    e.preventDefault();
    setErreur("");
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/recuperation-boutique/verifier?nom=${encodeURIComponent(nom)}&telephone=${encodeURIComponent(telephone)}`
      );
      const data = await res.json();
      if (!res.ok) { setErreur(data.error || "Erreur, réessayez"); setLoading(false); return; }

      if (!data.trouvee) {
        setErreur("Aucune boutique trouvée avec ce nom et ce numéro. Vérifiez l'orthographe exacte du nom.");
        setLoading(false);
        return;
      }
      setEtape(2);
    } catch {
      setErreur("Impossible de contacter le serveur");
    }
    setLoading(false);
  };

  const contacterSupport = () => {
    const msg = `Bonjour, je veux récupérer l'accès à ma boutique "${nom}" (numéro ${telephone}).`;
    window.open(`https://wa.me/${NUMERO_SUPPORT}?text=${encodeURIComponent(msg)}`, "_blank");
    setEtape(3);
  };

  const validerCode = async (e) => {
    e.preventDefault();
    setErreur("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/recuperation-boutique/valider-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telephone, code }),
      });
      const data = await res.json();
      if (!res.ok) { setErreur(data.error || "Code invalide"); setLoading(false); return; }

      const { error: erreurConnexion } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.motDePasse,
      });
      if (erreurConnexion) { setErreur("Code validé mais connexion impossible, réessayez."); setLoading(false); return; }

      navigate("/boutique/gerer");
    } catch {
      setErreur("Impossible de contacter le serveur");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F3F3F3] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm">
        <p className="text-lg font-extrabold text-center text-[#1B1B1B] mb-4">
          Tona<span className="text-[#F5720C]">Bk</span>
        </p>

        {etape === 1 && (
          <form onSubmit={verifier} className="space-y-3">
            <p className="text-sm text-gray-500 text-center mb-2">
              Entrez le nom de votre boutique et le numéro WhatsApp utilisé pour la créer.
            </p>
            {erreur && <p className="text-xs text-red-500">{erreur}</p>}
            <input
              placeholder="Nom de la boutique" value={nom} onChange={(e) => setNom(e.target.value)} required
              className="border border-gray-200 rounded-md px-3 py-2.5 text-sm w-full"
            />
            <input
              type="tel" placeholder="Numéro WhatsApp" value={telephone} onChange={(e) => setTelephone(e.target.value)} required
              className="border border-gray-200 rounded-md px-3 py-2.5 text-sm w-full"
            />
            <button type="submit" disabled={loading} className="w-full bg-[#F5720C] text-white text-sm font-semibold rounded-md py-2.5">
              {loading ? "Vérification..." : "Continuer"}
            </button>
          </form>
        )}

        {etape === 2 && (
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Boutique trouvée ! Pour la récupérer, envoyez-nous un message sur WhatsApp au
              <br /><strong>{NUMERO_SUPPORT_AFFICHE}</strong>
            </p>
            <button onClick={contacterSupport} className="w-full bg-[#F5720C] text-white text-sm font-semibold rounded-md py-2.5">
              Envoyer le message sur WhatsApp
            </button>
            <p className="text-xs text-gray-400">On vous enverra un code par WhatsApp à entrer ensuite ici.</p>
          </div>
        )}

        {etape === 3 && (
          <form onSubmit={validerCode} className="space-y-3">
            <p className="text-sm text-gray-500 text-center mb-2">
              Entrez le code à 6 chiffres reçu sur WhatsApp.
            </p>
            {erreur && <p className="text-xs text-red-500">{erreur}</p>}
            <input
              inputMode="numeric" maxLength={6} placeholder="Code reçu" value={code}
              onChange={(e) => setCode(e.target.value)} required
              className="border border-gray-200 rounded-md px-3 py-2.5 text-sm w-full tracking-widest text-center"
            />
            <button type="submit" disabled={loading} className="w-full bg-[#F5720C] text-white text-sm font-semibold rounded-md py-2.5">
              {loading ? "Vérification..." : "Ouvrir ma boutique"}
            </button>
          </form>
        )}

        <p className="text-xs text-center text-gray-500 mt-4">
          <Link to="/boutique/creer" className="text-[#F5720C] font-semibold">Créer une nouvelle boutique</Link>
        </p>
      </div>
    </div>
  );
}
