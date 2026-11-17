// Guide en 3 écrans, affiché à la première visite puis ouvrable avec « Comment ça marche ? ».
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, X } from "lucide-react";
import { API_URL } from "../lib/api";
import { useCachedData } from "../lib/useCachedData";
import { ECRANS_GUIDE, PHRASE_RASSURANCE } from "../lib/guide";

export default function GuideBienvenue({ onFermer }) {
  const [i, setI] = useState(0);
  const [lecture, setLecture] = useState(false);
  const audio = useRef(null);
  const { data } = useCachedData("guide_audios", `${API_URL}/api/guide`);
  const ecran = ECRANS_GUIDE[i];
  const url = data?.audios?.[ecran.n] || null;
  const dernier = i === ECRANS_GUIDE.length - 1;

  const arreter = () => {
    if (audio.current) { audio.current.pause(); audio.current = null; }
    setLecture(false);
  };
  useEffect(() => arreter, []); // coupe le son à la fermeture
  useEffect(() => { arreter(); }, [i]); // et quand on change d'écran

  const ecouter = () => {
    if (lecture) return arreter();
    const a = new Audio(url);
    audio.current = a;
    a.onended = () => setLecture(false);
    a.onerror = () => setLecture(false);
    a.play().then(() => setLecture(true)).catch(() => setLecture(false));
  };

  const fermer = () => { arreter(); onFermer(); };

  return (
    <div className="fixed inset-0 z-[90] bg-black/60 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 relative">
        <button onClick={fermer} aria-label="Fermer" className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <X size={16} />
        </button>

        <div className="text-center pt-2">
          <div className="mx-auto w-24 h-24 rounded-full bg-[#FFF3E8] flex items-center justify-center text-5xl">{ecran.icone}</div>
          <p className="text-[11px] font-bold text-[#F5720C] mt-4">Étape {i + 1} sur {ECRANS_GUIDE.length}</p>
          <h2 className="text-lg font-extrabold text-[#1B1B1B] mt-1">{ecran.titre}</h2>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">{ecran.texte}</p>

          {url && (
            <button onClick={ecouter} className="mt-4 inline-flex items-center gap-2 bg-[#FFF3E8] text-[#C9560A] text-xs font-bold rounded-full px-4 py-2">
              {lecture ? <VolumeX size={15} /> : <Volume2 size={15} />} {lecture ? "Arrêter" : "Écouter"}
            </button>
          )}
        </div>

        <p className="text-center text-[11px] text-gray-500 mt-4">✅ {PHRASE_RASSURANCE}</p>

        <div className="flex justify-center gap-1.5 mt-3">
          {ECRANS_GUIDE.map((_, k) => (
            <span key={k} className={`h-1.5 rounded-full ${k === i ? "w-5 bg-[#F5720C]" : "w-1.5 bg-gray-300"}`} />
          ))}
        </div>

        <button
          onClick={() => (dernier ? fermer() : setI(i + 1))}
          className="w-full mt-5 bg-[#F5720C] text-white font-extrabold text-sm rounded-xl py-3"
        >
          {dernier ? "C'est parti !" : "Suivant"}
        </button>
        {!dernier && (
          <button onClick={fermer} className="w-full mt-2 text-xs font-semibold text-gray-400 py-1">Passer</button>
        )}
      </div>
    </div>
  );
}
