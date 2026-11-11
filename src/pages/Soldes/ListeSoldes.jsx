import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Flame, Volume2, VolumeX, X } from "lucide-react";
import { API_URL } from "../../lib/api";
import { useCachedData } from "../../lib/useCachedData";
import {
  demarrerAudioSolde, arreterAudioSolde, definirMuet, enLecture, audioIndisponible, estMuet,
} from "../../lib/audioSolde";

const fmt = (n, devise = "USD") => Number(n).toLocaleString("fr-FR") + " " + devise;

function tempsRestant(expireLe) {
  const diffMs = new Date(expireLe).getTime() - Date.now();
  if (diffMs <= 0) return null;
  const heures = Math.floor(diffMs / 3600000);
  if (heures < 1) return `${Math.ceil(diffMs / 60000)} MIN !`;
  if (heures < 24) return `${heures} H RESTANTES`;
  return `${Math.ceil(heures / 24)} J RESTANTS`;
}

const MESSAGE_BANDEAU = "🔥 GROSSES PROMOS 🔥 STOCK LIMITÉ 🔥 ÇA PART VITE 🔥 PROFITEZ-EN MAINTENANT 🔥 ";

export default function ListeSoldes() {
  const { data } = useCachedData("soldes", `${API_URL}/api/soldes`);
  const soldes = data || [];

  const [lecture, setLecture] = useState(enLecture());
  const [indispo, setIndispo] = useState(false);

  // Les quantités restantes sont réglées par l'admin : on rafraîchit la liste toutes les 20 s
  // tant que la page est visible, pour que les clients voient les chiffres baisser.
  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === "visible") window.dispatchEvent(new Event("tonabk:revalidate"));
    }, 20000);
    return () => clearInterval(t);
  }, []);

  // Audio propre à chaque annonce (bouton « Écouter » sur la carte)
  const audioAnnonce = useRef(null);
  const [annonceEnLecture, setAnnonceEnLecture] = useState(null);
  const arreterAnnonce = () => {
    if (audioAnnonce.current) {
      audioAnnonce.current.pause();
      audioAnnonce.current = null;
    }
    setAnnonceEnLecture(null);
  };
  useEffect(() => () => { if (audioAnnonce.current) audioAnnonce.current.pause(); }, []);
  const basculerAnnonce = async (e, s) => {
    e.preventDefault(); // la carte est un lien : on ne veut pas ouvrir l'offre
    e.stopPropagation();
    if (annonceEnLecture === s.id) return arreterAnnonce();
    arreterAnnonce();
    arreterAudioSolde(); // on coupe la musique générale pendant l'annonce
    setLecture(false);
    const a = new Audio(s.audio_url);
    a.onended = () => setAnnonceEnLecture(null);
    audioAnnonce.current = a;
    setAnnonceEnLecture(s.id);
    try { await a.play(); } catch { arreterAnnonce(); }
  };

  // Le son tourne en boucle tant qu'on est sur cette page ; il s'arrête quand on la quitte
  // ou quand l'app passe en arrière-plan.
  useEffect(() => {
    let actif = true;
    const GESTES = ["click", "touchend", "keydown"];

    // Si le navigateur refuse de lancer le son tout seul (page rouverte, app rechargée...),
    // on le lance au premier toucher n'importe où sur la page : plus besoin de chercher le bouton.
    const lancerAuGeste = async () => {
      GESTES.forEach((g) => document.removeEventListener(g, lancerAuGeste));
      await demarrerAudioSolde();
      if (!actif) return;
      setLecture(enLecture());
      setIndispo(audioIndisponible());
    };
    const attendreGeste = () => GESTES.forEach((g) => document.addEventListener(g, lancerAuGeste, { once: true }));

    const lancer = async () => {
      await demarrerAudioSolde();
      if (!actif) return;
      setLecture(enLecture());
      setIndispo(audioIndisponible());
      if (!enLecture() && !estMuet() && !audioIndisponible()) attendreGeste();
    };
    lancer();
    const surVisibilite = () => {
      if (document.visibilityState === "hidden") {
        arreterAudioSolde();
        setLecture(false);
      } else {
        lancer();
      }
    };
    document.addEventListener("visibilitychange", surVisibilite);
    return () => {
      actif = false;
      GESTES.forEach((g) => document.removeEventListener(g, lancerAuGeste));
      document.removeEventListener("visibilitychange", surVisibilite);
      arreterAudioSolde();
    };
  }, []);

  const basculerSon = async () => {
    if (lecture) {
      definirMuet(true);
      setLecture(false);
    } else {
      definirMuet(false);
      await demarrerAudioSolde();
      setLecture(enLecture());
      setIndispo(audioIndisponible());
    }
  };

  return (
    <div className="pb-3 bg-[#1B1B1B] min-h-screen">
      <div className="p-4 flex items-center gap-3">
        <Link to="/"><ArrowLeft size={20} className="text-white" /></Link>
        <Flame size={26} className="text-[#F5720C] animate-pulse" />
        <div>
          <p className="text-base font-extrabold text-white">SOLDES</p>
          <p className="text-[11px] text-white/50">Offres à durée limitée</p>
        </div>
        {!indispo && (
          <button
            onClick={basculerSon}
            aria-label={lecture ? "Couper le son" : "Activer le son"}
            className={`ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold text-white ${
              lecture ? "bg-white/10" : "bg-[#F5720C] animate-pulse"
            }`}
          >
            {lecture ? <Volume2 size={16} /> : <VolumeX size={16} />}
            {lecture ? "Son" : "Activer le son"}
          </button>
        )}
      </div>

      <div className="overflow-hidden bg-[#F5720C] py-1.5">
        <div className="bandeau-defilant whitespace-nowrap text-[11px] font-extrabold text-white tracking-wide" style={{ width: "200%" }}>
          {MESSAGE_BANDEAU.repeat(4)}
        </div>
      </div>

      {soldes.length === 0 && (
        <p className="text-center text-sm text-white/40 py-14">Aucune offre en ce moment, revenez bientôt 👀</p>
      )}

      <div className="grid grid-cols-2 gap-3 p-3">
        {soldes.map((s) => {
          const reste = tempsRestant(s.expire_le);
          const pourcentage = Math.round(100 - (s.prix_solde / s.prix_normal) * 100);
          const suivi = s.restant != null; // quantité suivie par l'admin
          const epuise = suivi && s.restant === 0;
          const stockFaible = suivi && s.restant > 0 && s.restant <= 5;

          return (
            <Link
              key={s.id}
              to={`/soldes/${s.id}`}
              className="relative bg-white rounded-2xl overflow-hidden shadow-[0_0_0_2px_#F5720C,0_0_18px_rgba(245,114,12,0.55)]"
            >
              {pourcentage > 0 && (
                <div className="absolute top-2.5 -left-8 bg-red-600 text-white text-[10px] font-extrabold px-8 py-0.5 rotate-[-35deg] z-10 shadow">
                  -{pourcentage}%
                </div>
              )}

              <div className="relative h-32 bg-[#F6F6F6]">
                {s.photo_url ? (
                  <img src={s.photo_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">🔥</div>
                )}
                {s.audio_url && !epuise && (
                  <button
                    onClick={(e) => basculerAnnonce(e, s)}
                    aria-label="Écouter l'annonce"
                    className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-black/70 text-white text-[10px] font-bold rounded-full px-2.5 py-1"
                  >
                    {annonceEnLecture === s.id ? <><VolumeX size={12} /> Stop</> : <><Volume2 size={12} /> Écouter</>}
                  </button>
                )}
                {reste && (
                  <span className="absolute bottom-1.5 left-1.5 right-1.5 bg-red-600 text-white text-[9px] font-extrabold px-2 py-1 rounded text-center animate-pulse">
                    ⏳ {reste}
                  </span>
                )}
                {epuise && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20">
                    <X size={56} strokeWidth={3} className="text-red-500" />
                    <span className="mt-1 bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded">
                      STOCK ÉCOULÉ
                    </span>
                  </div>
                )}
              </div>

              <div className="p-2.5">
                <p className="text-[11px] font-bold text-[#1B1B1B] line-clamp-1">{s.titre}</p>
                <p className="text-[10px] text-gray-400 line-through">{fmt(s.prix_normal, s.devise)}</p>
                <p className="text-base font-extrabold text-[#F5720C] leading-tight">{fmt(s.prix_solde, s.devise)}</p>
                {epuise && <p className="text-[10px] font-extrabold text-red-600 mt-1">✕ Stock écoulé</p>}
                {suivi && !epuise && (
                  <div className="mt-1.5">
                    <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full bg-[#F5720C]"
                        style={{ width: `${Math.round((s.restant / s.quantite) * 100)}%` }}
                      />
                    </div>
                    <p className={`text-[9px] mt-0.5 ${stockFaible ? "font-extrabold text-red-600" : "text-gray-500"}`}>
                      {stockFaible ? `⚠️ PLUS QUE ${s.restant} EN STOCK !` : `Reste ${s.restant}/${s.quantite}`}
                      {s.vendus_total > 0 ? ` · ${s.vendus_total} déjà acheté${s.vendus_total > 1 ? "s" : ""}` : ""}
                    </p>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
