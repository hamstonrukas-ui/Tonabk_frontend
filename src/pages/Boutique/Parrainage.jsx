import { useState, useEffect } from "react";
import { MessageCircle, Copy, Check as CheckIcon } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { API_URL } from "../../lib/api";

const SITE_URL = "tonabk.com";

export default function Parrainage() {
  const [prenom, setPrenom] = useState("");
  const [copied, setCopied] = useState(false);
  const [filleuls, setFilleuls] = useState([]);

  useEffect(() => {
    async function charger() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(`${API_URL}/api/parrainage/mes-filleuls`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) setFilleuls(await res.json());
    }
    charger();
  }, []);

  const referralCode = (prenom.trim() ? prenom.trim().slice(0, 4).toUpperCase() : "AMIS") + "10";
  const referralLink = `${SITE_URL}?ref=${referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const shareReferralWhatsApp = () => {
    const msg = `Découvre TonaBk ! Utilise mon code ${referralCode} pour une réduction sur ta première commande : ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-4">
        <p className="text-sm font-medium mb-2 text-[#1B1B1B]">Votre code de parrainage</p>
        <input
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          placeholder="Votre prénom"
          className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full mb-3"
        />
        <div className="flex items-center justify-between rounded-md px-3 py-2.5 mb-3 bg-[#FFF1E4]">
          <span className="text-sm font-mono font-semibold text-[#C9560A]">{referralCode}</span>
          <button onClick={copyLink} className="flex items-center gap-1 text-xs font-medium text-[#C9560A]">
            {copied ? <CheckIcon size={12} /> : <Copy size={12} />}
            {copied ? "Copié" : "Copier le lien"}
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Chaque ami qui commande avec ce code reçoit -10%, et vous recevez une récompense.
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
                <p className="text-xs text-gray-400">Achat le {f.date}</p>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#FFF1E4] text-[#C9560A]">
                +{f.recompense}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
