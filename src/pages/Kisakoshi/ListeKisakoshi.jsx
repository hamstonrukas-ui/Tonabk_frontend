// Kisakoshi (la valise) : des lots d'articles présentés comme des statuts WhatsApp (photos, message, prix, contact).
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BadgeCheck, Phone, Store, Truck, X } from "lucide-react";
import { API_URL } from "../../lib/api";
import { useCachedData } from "../../lib/useCachedData";
import { formaterPrix, ilYa, lireVues, marquerVue, ouvrirLivreMoi } from "../../lib/kisakoshi";

const DUREE_MS = 5000; // durée d'affichage de chaque photo

function Avatar({ groupe, taille = 56 }) {
  return groupe.logo_url ? (
    <img src={groupe.logo_url} alt="" style={{ width: taille, height: taille }} className="rounded-full object-cover" />
  ) : (
    <div style={{ width: taille, height: taille }} className="rounded-full bg-[#F5720C] text-white flex items-center justify-center font-extrabold">
      {groupe.nom.slice(0, 2).toUpperCase()}
    </div>
  );
}

// ---- Visionneuse plein écran : touche à droite = suivante, à gauche = précédente, appui long = pause ----
function Visionneuse({ groupes, depart, onFermer, onVue }) {
  const [g, setG] = useState(depart);
  const [i, setI] = useState(0);
  const [progres, setProgres] = useState(0);
  const enPause = useRef(false);
  const ecoule = useRef(0);
  const debutAppui = useRef(0);

  const groupe = groupes[g];
  const item = groupe.slides[i]; // une « diapo » = une photo (jusqu'à 10 par Kisakoshi)

  const suivant = useCallback(() => {
    if (i < groupe.slides.length - 1) setI(i + 1);
    else if (g < groupes.length - 1) { setG(g + 1); setI(0); }
    else onFermer();
  }, [i, g, groupe, groupes.length, onFermer]);

  const precedent = () => {
    ecoule.current = 0;
    setProgres(0);
    if (i > 0) setI(i - 1);
    else if (g > 0) { setG(g - 1); setI(groupes[g - 1].slides.length - 1); }
  };

  useEffect(() => { onVue(item.id); }, [item.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Barre de progression : avance toutes les 50 ms sauf en pause
  const suivantRef = useRef(suivant);
  suivantRef.current = suivant;
  useEffect(() => {
    ecoule.current = 0;
    setProgres(0);
    const t = setInterval(() => {
      if (enPause.current) return;
      ecoule.current += 50;
      setProgres(Math.min(1, ecoule.current / DUREE_MS));
      if (ecoule.current >= DUREE_MS) suivantRef.current();
    }, 50);
    return () => clearInterval(t);
  }, [item.cle]);

  const surAppui = () => { enPause.current = true; debutAppui.current = Date.now(); };
  const surRelache = (e) => {
    enPause.current = false;
    if (Date.now() - debutAppui.current > 250) return; // appui long = simple pause
    const x = e.clientX / window.innerWidth;
    if (x < 0.3) precedent(); else suivant();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col select-none">
      <div className="absolute top-0 left-0 right-0 z-20 px-2 pt-2 bg-gradient-to-b from-black/70 to-transparent pb-8">
        <div className="flex gap-1">
          {groupe.slides.map((n, idx) => (
            <div key={n.cle} className="h-[3px] flex-1 rounded bg-white/30 overflow-hidden">
              <div className="h-full bg-white" style={{ width: idx < i ? "100%" : idx === i ? `${progres * 100}%` : "0%" }} />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2.5 mt-2.5">
          <Avatar groupe={groupe} taille={36} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white truncate flex items-center gap-1">
              {groupe.nom} {groupe.certifiee && <BadgeCheck size={14} className="text-[#F5720C]" />}
            </p>
            <p className="text-[11px] text-white/70">{ilYa(item.created_at)}</p>
          </div>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onClick={onFermer}
            aria-label="Fermer"
            className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center"
          >
            <X size={18} className="text-white" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center" onPointerDown={surAppui} onPointerUp={surRelache} onPointerLeave={() => { enPause.current = false; }}>
        <img src={item.photo} alt="" draggable={false} className="max-w-full max-h-full object-contain pointer-events-none" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-6 pt-12 bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-white text-base font-extrabold text-center leading-snug">{item.contenu}</p>
        <p className="text-[#F5720C] text-xl font-extrabold text-center mt-0.5">{formaterPrix(item.prix, item.devise)}</p>
        {item.message && <p className="text-white/90 text-sm text-center leading-snug mt-1.5 mb-1 whitespace-pre-wrap">{item.message}</p>}
        {groupe.telephone && (
          <p className="text-white/70 text-xs text-center flex items-center justify-center gap-1 mt-1 mb-3">
            <Phone size={12} /> {groupe.nom} · {groupe.telephone}
          </p>
        )}
        <div className="flex items-center justify-center gap-2" onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()}>
          <button
            onClick={() => ouvrirLivreMoi({ ...item, telephone: groupe.telephone }, API_URL)}
            className="flex items-center gap-1.5 bg-[#F5720C] text-white text-xs font-bold rounded-full px-4 py-2"
          >
            <Truck size={14} /> Livre-moi
          </button>
          <Link to={`/boutique/${groupe.boutique_id}`} className="flex items-center gap-1.5 bg-white/20 text-white text-xs font-bold rounded-full px-4 py-2">
            <Store size={14} /> Voir la boutique
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ListeKisakoshi() {
  const { data, loading } = useCachedData("kisakoshi", `${API_URL}/api/kisakoshi`);
  const [ouvert, setOuvert] = useState(null); // index du groupe ouvert
  const [vues, setVues] = useState(() => lireVues());

  // Rafraîchit la liste chaque minute tant que la page est visible
  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === "visible") window.dispatchEvent(new Event("tonabk:revalidate"));
    }, 60000);
    return () => clearInterval(t);
  }, []);

  // Regroupe par boutique ; les valises d'une même boutique vont de la plus ancienne à la plus récente
  const groupes = useMemo(() => {
    const maintenant = Date.now();
    const m = new Map();
    for (const n of data || []) {
      if (new Date(n.expire_le).getTime() <= maintenant) continue;
      const cle = n.boutique_id;
      if (!m.has(cle)) m.set(cle, { cle, boutique_id: n.boutique_id, nom: n.auteur_nom, logo_url: n.logo_url, certifiee: n.certifiee, telephone: n.telephone, items: [] });
      m.get(cle).items.push(n);
    }
    const liste = [...m.values()];
    for (const gr of liste) {
      gr.items.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      gr.derniere = gr.items[gr.items.length - 1];
      gr.slides = gr.items.flatMap((n) => (n.photos || []).map((photo, k) => ({ ...n, photo, cle: `${n.id}-${k}` })));
      gr.nonVue = gr.items.some((x) => !vues.has(x.id));
    }
    // Les non vues d'abord, puis les plus récentes
    return liste.sort((a, b) =>
      Number(b.nonVue) - Number(a.nonVue) ||
      new Date(b.derniere.created_at) - new Date(a.derniere.created_at)
    );
  }, [data, vues]);

  const surVue = useCallback((id) => {
    marquerVue(id);
    setVues(lireVues());
  }, []);

  return (
    <div className="min-h-screen bg-[#F3F3F3] pb-24">
      <div className="bg-[#F5720C] px-4 py-4 flex items-center gap-3">
        <Link to="/"><ArrowLeft size={20} className="text-white" /></Link>
        <div className="flex-1">
          <p className="text-base font-extrabold text-white">Kisakoshi</p>
          <p className="text-[11px] text-white/80">Les valises : plusieurs articles, un seul prix</p>
        </div>
      </div>

      {loading && !data && <p className="text-center text-sm text-gray-400 py-10">Chargement...</p>}
      {!loading && groupes.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-14 px-6">Aucun Kisakoshi pour l'instant. Revenez bientôt 👀</p>
      )}

      <div className="p-3 space-y-2">
        {groupes.map((gr, idx) => (
          <button
            key={gr.cle}
            onClick={() => setOuvert(idx)}
            className="w-full bg-white rounded-xl p-3 flex items-center gap-3 text-left"
          >
            <div className={`rounded-full p-[3px] ${gr.nonVue ? "bg-[#F5720C]" : "bg-gray-300"}`}>
              <div className="rounded-full bg-white p-[2px]">
                <img src={gr.derniere.photos?.[0]} alt="" className="w-14 h-14 rounded-full object-cover" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#1B1B1B] truncate flex items-center gap-1">
                {gr.nom} {gr.certifiee && <BadgeCheck size={14} className="text-[#F5720C] flex-shrink-0" />}
              </p>
              <p className="text-xs text-gray-500">
                {gr.items.length} Kisakoshi · {ilYa(gr.derniere.created_at)}
              </p>
            </div>
            {gr.nonVue && <span className="w-2.5 h-2.5 rounded-full bg-[#F5720C] flex-shrink-0" />}
          </button>
        ))}
      </div>

      {ouvert !== null && groupes[ouvert] && (
        <Visionneuse groupes={groupes} depart={ouvert} onFermer={() => setOuvert(null)} onVue={surVue} />
      )}
    </div>
  );
}
