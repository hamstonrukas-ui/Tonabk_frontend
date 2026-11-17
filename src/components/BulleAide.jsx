// Petite bulle d'aide affichée une seule fois (ex. sur la fiche produit). Se ferme avec « Compris ».
import { useState } from "react";

export default function BulleAide({ id, texte }) {
  const cle = `tonabk_aide_${id}`;
  const [vu, setVu] = useState(() => {
    try { return localStorage.getItem(cle) === "1"; } catch { return true; }
  });
  if (vu) return null;
  const fermer = () => {
    try { localStorage.setItem(cle, "1"); } catch { /* pas grave */ }
    setVu(true);
  };
  return (
    <div className="mt-3 flex items-start gap-2 bg-[#FFF3E8] border border-[#F5720C]/30 rounded-xl px-3 py-2.5">
      <span className="text-base leading-none">💡</span>
      <p className="flex-1 text-[12px] text-[#7A3A05] leading-snug">{texte}</p>
      <button onClick={fermer} className="text-[11px] font-bold text-[#F5720C] whitespace-nowrap">Compris</button>
    </div>
  );
}
