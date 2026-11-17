// Aide de la page en cours : bouton « ? » toujours disponible, et la carte s'ouvre toute seule
// la première fois qu'on visite une page. Si un audio existe (envoyé depuis l'admin), bouton « Écouter ».
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Volume2, VolumeX } from "lucide-react";
import { API_URL } from "../lib/api";
import { useCachedData } from "../lib/useCachedData";
import { AIDES, idAide, aideVue, marquerAideVue, guideVu } from "../lib/guide";

export default function AidePage() {
  const { pathname, search } = useLocation();
  const id = idAide(pathname, search);
  const [ouvert, setOuvert] = useState(false);
  const [lecture, setLecture] = useState(false);
  const audio = useRef(null);
  const { data } = useCachedData("guide_audios", `${API_URL}/api/guide`);
  const url = (id && data?.audios?.[id]) || null;

  const arreter = () => {
    if (audio.current) { audio.current.pause(); audio.current = null; }
    setLecture(false);
  };

  // À chaque changement de page : on ferme, et on ouvre seul la toute première fois
  useEffect(() => {
    arreter();
    setOuvert(false);
    if (!id || aideVue(id) || !guideVu()) return; // le guide de bienvenue passe en premier
    const t = setTimeout(() => { setOuvert(true); marquerAideVue(id); }, 900);
    return () => clearTimeout(t);
  }, [id]);
  useEffect(() => arreter, []);

  if (!id || !AIDES[id]) return null;

  const fermer = () => { arreter(); setOuvert(false); marquerAideVue(id); };
  const ecouter = () => {
    if (lecture) return arreter();
    const a = new Audio(url);
    audio.current = a;
    a.onended = () => setLecture(false);
    a.onerror = () => setLecture(false);
    a.play().then(() => setLecture(true)).catch(() => setLecture(false));
  };

  return (
    <>
      {ouvert && (
        <div className="fixed left-3 right-3 bottom-[148px] z-50 max-w-sm bg-white rounded-2xl shadow-xl border border-[#F5720C]/30 p-4">
          <p className="text-xs font-extrabold text-[#F5720C]">💡 Comment ça marche ici ?</p>
          <p className="text-[13px] text-gray-700 mt-1.5 leading-snug">{AIDES[id]}</p>
          <div className="flex items-center gap-2 mt-3">
            {url && (
              <button onClick={ecouter} className="flex items-center gap-1.5 bg-[#FFF3E8] text-[#C9560A] text-xs font-bold rounded-full px-3.5 py-2">
                {lecture ? <VolumeX size={14} /> : <Volume2 size={14} />} {lecture ? "Arrêter" : "Écouter"}
              </button>
            )}
            <button onClick={fermer} className="ml-auto bg-[#F5720C] text-white text-xs font-extrabold rounded-full px-4 py-2">Compris</button>
          </div>
        </div>
      )}
      <button
        onClick={() => (ouvert ? fermer() : setOuvert(true))}
        aria-label="Aide sur cette page"
        className="fixed left-4 bottom-24 z-40 w-11 h-11 rounded-full bg-white shadow-lg border border-[#F5720C]/40 flex items-center justify-center text-[#F5720C] font-extrabold text-lg"
      >
        {url ? "🔊" : "?"}
      </button>
    </>
  );
}
