// Un commerçant publie une nouveauté (photo + texte) visible 48 h.
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Trash2, X } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { API_URL } from "../../lib/api";
import { reduireImage } from "../../lib/image";
import { ilYa, tempsAvantExpiration } from "../../lib/nouveautes";

const MAX_PHOTOS = 5;

export default function PublierNouveaute() {
  const navigate = useNavigate();
  const [session, setSession] = useState(undefined); // undefined = chargement
  const [boutique, setBoutique] = useState(null);
  const [mes, setMes] = useState([]);
  const [photos, setPhotos] = useState([]); // [{ fichier, apercu }] — 5 maximum
  const [texte, setTexte] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(true);

  const entetes = (s) => ({ Authorization: `Bearer ${s.access_token}` });

  const charger = async (s) => {
    const [rb, rm] = await Promise.all([
      fetch(`${API_URL}/api/boutiques/mine`, { headers: entetes(s) }),
      fetch(`${API_URL}/api/nouveautes/mes`, { headers: entetes(s) }),
    ]);
    if (rb.ok) setBoutique((await rb.json())[0] || null);
    if (rm.ok) setMes(await rm.json());
    setChargement(false);
  };

  useEffect(() => {
    (async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      if (!s) {
        alert("Connectez-vous d'abord pour publier une nouveauté");
        return navigate("/inscription?redirect=/nouveautes/publier");
      }
      setSession(s);
      try { await charger(s); } catch { setErreur("Impossible de contacter le serveur"); setChargement(false); }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const apercusRef = useRef([]);
  apercusRef.current = photos.map((p) => p.apercu);
  useEffect(() => () => { apercusRef.current.forEach((u) => URL.revokeObjectURL(u)); }, []);

  const choisirPhotos = (e) => {
    const fichiers = Array.from(e.target.files || []);
    e.target.value = "";
    if (!fichiers.length) return;
    const place = MAX_PHOTOS - photos.length;
    if (fichiers.length > place) setErreur(`${MAX_PHOTOS} photos maximum par nouveauté`);
    else setErreur("");
    setPhotos((prev) => [...prev, ...fichiers.slice(0, place).map((fichier) => ({ fichier, apercu: URL.createObjectURL(fichier) }))]);
  };

  const retirerPhoto = (idx) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[idx].apercu);
      return prev.filter((_, k) => k !== idx);
    });
    setErreur("");
  };

  const publier = async (e) => {
    e.preventDefault();
    setErreur("");
    if (photos.length === 0) return setErreur("Choisissez au moins une photo");
    setEnvoi(true);
    try {
      const urls = [];
      for (const { fichier } of photos) {
        const formData = new FormData();
        formData.append("photo", await reduireImage(fichier));
        const up = await fetch(`${API_URL}/api/upload/photo-nouveaute`, { method: "POST", headers: entetes(session), body: formData });
        const dataUp = await up.json().catch(() => ({}));
        if (!up.ok) throw new Error(dataUp.error || "Échec de l'envoi d'une photo");
        urls.push(dataUp.url);
      }

      const res = await fetch(`${API_URL}/api/nouveautes`, {
        method: "POST",
        headers: { ...entetes(session), "Content-Type": "application/json" },
        body: JSON.stringify({ photos: urls, texte, boutique_id: boutique.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Échec de la publication");
      navigate("/nouveautes");
    } catch (err) {
      setErreur(err.message || "Erreur de connexion");
    }
    setEnvoi(false);
  };

  const supprimer = async (id) => {
    if (!window.confirm("Supprimer cette nouveauté ?")) return;
    const res = await fetch(`${API_URL}/api/nouveautes/${id}`, { method: "DELETE", headers: entetes(session) });
    if (res.ok) setMes((prev) => prev.filter((n) => n.id !== id));
    else setErreur("Impossible de supprimer");
  };

  return (
    <div className="min-h-screen bg-[#F3F3F3] pb-24">
      <div className="bg-[#F5720C] px-4 py-4 flex items-center gap-3">
        <Link to="/boutique/gerer"><ArrowLeft size={20} className="text-white" /></Link>
        <p className="text-base font-extrabold text-white">Publier une nouveauté</p>
      </div>

      <div className="p-4 space-y-4">
        {(session === undefined || chargement) && <p className="text-center text-sm text-gray-400 py-10">Chargement...</p>}

        {!chargement && !boutique && (
          <div className="bg-white rounded-xl p-4 text-center">
            <p className="text-sm text-[#1B1B1B] mb-3">Il faut avoir une boutique pour publier une nouveauté.</p>
            <Link to="/boutique/creer" className="inline-block bg-[#F5720C] text-white text-xs font-bold rounded-lg px-4 py-2.5">Créer ma boutique</Link>
          </div>
        )}

        {!chargement && boutique && (
          <form onSubmit={publier} className="bg-white rounded-xl p-4 space-y-3">
            <p className="text-xs text-gray-500">Votre nouveauté apparaîtra sous le nom de <strong>{boutique.nom}</strong> et disparaîtra après 48 h.</p>

            <div className="grid grid-cols-3 gap-2">
              {photos.map((p, idx) => (
                <div key={p.apercu} className="relative aspect-square">
                  <img src={p.apercu} alt="" className="w-full h-full object-cover rounded-lg" />
                  <button type="button" onClick={() => retirerPhoto(idx)} aria-label="Retirer la photo"
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center">
                    <X size={14} className="text-white" />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <label className="aspect-square border-2 border-dashed border-[#F5720C]/50 rounded-lg flex flex-col items-center justify-center gap-1 text-[#F5720C] cursor-pointer">
                  <Camera size={22} />
                  <span className="text-[11px] font-semibold text-center leading-tight">
                    {photos.length === 0 ? "Ajouter des photos" : "Ajouter"}
                  </span>
                  <input type="file" accept="image/*" multiple onChange={choisirPhotos} className="hidden" />
                </label>
              )}
            </div>
            <p className="text-[11px] text-gray-400">{photos.length}/{MAX_PHOTOS} photos</p>

            <textarea
              value={texte} onChange={(e) => setTexte(e.target.value)} maxLength={200} rows={3}
              placeholder="Un texte pour accompagner la photo (optionnel) : prix, arrivage, promo..."
              className="w-full border border-gray-200 rounded-lg p-3 text-sm"
            />
            <p className="text-[11px] text-gray-400 text-right -mt-2">{texte.length}/200</p>

            {erreur && <p className="text-sm text-red-500">{erreur}</p>}
            <button type="submit" disabled={envoi || photos.length === 0} className="w-full bg-[#F5720C] text-white font-bold rounded-lg py-3 disabled:opacity-50">
              {envoi ? "Publication..." : "Publier (visible 48 h)"}
            </button>
          </form>
        )}

        {mes.length > 0 && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-2 px-1">Mes nouveautés actives</p>
            <div className="space-y-2">
              {mes.map((n) => (
                <div key={n.id} className="bg-white rounded-xl p-3 flex items-center gap-3">
                  <img src={n.photo_url} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#1B1B1B] truncate">{n.texte || "Sans texte"}</p>
                    <p className="text-[11px] text-gray-400">{(n.photos?.length || 1)} photo{(n.photos?.length || 1) > 1 ? "s" : ""} · {ilYa(n.created_at)} · {tempsAvantExpiration(n.expire_le)}</p>
                  </div>
                  <button onClick={() => supprimer(n.id)} aria-label="Supprimer" className="text-red-500 p-2"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
