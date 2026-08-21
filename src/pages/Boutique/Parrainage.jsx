import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { MessageCircle, Copy, Check as CheckIcon } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { API_URL, SITE_URL } from "../../lib/api";

export default function Parrainage() {
  const { boutiqueId, boutique } = useOutletContext();
  const navigate = useNavigate();
  const [code, setCode] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [copied, setCopied] = useState(false);
  const [filleuls, setFilleuls] = useState([]);

  useEffect(() => {
    async function charger() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setChargement(false);
        return;
      }

      const headers = { Authorization: `Bearer ${session.access_token}` };

      const resCode = await fetch(`${API_URL}/api/parrainage/mon-code/${boutiqueId}`, { headers });
      if (resCode.ok) {
        const data = await resCode.json();
        setCode(data.code);
      }

      const resFilleuls = await fetch(`${API_URL}/api/parrainage/mes-filleuls/${boutiqueId}`, { headers });
      if (resFilleuls.ok) setFilleuls(await resFilleuls.json());

      setChargement(false);
    }
    charger();
  }, [boutiqueId]);

  const referralLink = code ? `${SITE_URL}/boutique/${boutiqueId}?ref=${code}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const shareReferralWhatsApp = () => {
    const msg = `Découvre ${boutique?.nom || "cette boutique"} sur TonaBk ! Utilise mon code ${code} pour une réduction sur ta commande : ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (chargement) return <p className="text-center text-sm text-gray-400 py-10">Chargement...</p>;

  if (!code) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-gray-500 mb-3">Connectez-vous pour obtenir votre code de parrainage.</p>
        <button
          onClick={() => navigate(`/inscription?redirect=/boutique/${boutiqueId}/parrainage`)}
          className="bg-[#F5720C] text-white text-sm font-semibold px-4 py-2 rounded-lg"
        >
          Se connecter / S'inscrire
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-4">
        <p className="text-sm font-medium mb-2 text-[#1B1B1B]">Votre code de parrainage pour cette boutique</p>
        <div className="flex items-center justify-between rounded-md px-3 py-2.5 mb-3 bg-[#FFF1E4]">
          <span className="text-sm font-mono font-semibold text-[#C9560A]">{code}</span>
          <button onClick={copyLink} className="flex items-center gap-1 text-xs font-medium text-[#C9560A]">
            {copied ? <CheckIcon size={12} /> : <Copy size={12} />}
            {copied ? "Copié" : "Copier le lien"}
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Chaque ami qui commande chez cette boutique avec ce code reçoit une réduction, et vous recevez une récompense.
        </p>
        <button
          onClick={shareReferralWhatsApp}
          className="w-full flex items-center justify-center gap-2 text-sm font-medium text-white rounded-md py-2.5 bg-[#25D366]"
        >
          <MessageCircle size={16} /> Partager mon code sur WhatsApp
        </button>
      </div>

      <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mt-4 mb-1 px-1">Vos filleuls</p>
      <div className="bg-white rounded-xl overflow-hidden">
        {filleuls.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-6">Aucun filleul pour l'instant</p>
        ) : (
          filleuls.map((f, i) => (
            <div key={f.id} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? "border-t border-gray-100" : ""}`}>
              <div>
                <p className="text-sm text-[#1B1B1B]">{f.filleul_nom}</p>
                <p className="text-xs text-gray-400">
                  {new Date(f.created_at).toLocaleDateString("fr-FR")} —{" "}
                  {f.statut === "en_attente" ? "En attente" : f.statut === "validee" ? "Validé" : "Refusé"}
                </p>
              </div>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  f.statut === "validee" ? "bg-green-50 text-green-600" : "bg-[#FFF1E4] text-[#C9560A]"
                }`}
              >
                {f.statut === "validee" ? `+${f.recompense}` : "En attente"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
    }
              
