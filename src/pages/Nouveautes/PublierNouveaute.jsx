// Un commerçant publie une nouveauté (photo + texte) visible 48 h.
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { API_URL } from "../../lib/api";
import { reduireImage } from "../../lib/image";
import { ilYa, tempsAvantExpiration } from "../../lib/nouveautes";

export default function PublierNouveaute() {
  const navigate = useNavigate();
  const [session, setSession] = useState(undefined); // undefined = chargement
  const [boutique, setBoutique] = useState(null);
  const [mes, setMes] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [apercu, setApercu] = useState(null);
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

  useEffect(() => () => { if (apercu) URL.revokeObjectURL(apercu); }, [apercu]);

  const choisirPhoto = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setPhoto(f);
    setApercu(URL.createObjectURL(f));
  };

  const publier = async (e) => {
    e.preventDefault();
    setErreur("");
    if (!photo) return setErreur("Choisissez une photo");
    setEnvoi(true);
    try {
      const reduite = await reduireImage(photo);
      const formData = new FormData();
      formData.append("photo", reduite);
      const up = await fetch(`${API_URL}/api/upload/photo-nouveaute`, { method: "POST", headers: entetes(session), body: formData });
      const dataUp = await up.json().catch(() => ({}));
      if (!up.ok) throw new Error(dataUp.error || "Échec de l'envoi de la photo");

      const res = await fetch(`${API_URL}/api/nouveautes`, {
        method: "POST",
        headers: { ...entetes(session), "Content-Type": "application/json" },
        body: JSON.stringify({ photo_url: dataUp.url, texte, boutique_id: boutique.id }),
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
        <Link to="/nouveautes"><ArrowLeft size={20} className="text-white" /></Link>
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

            <label className="block cursor-pointer">
              {apercu ? (
                <img src={apercu} alt="" className="w-full max-h-80 object-contain rounded-lg bg-black" />
              ) : (
                <div className="border-2 border-dashed border-[#F5720C]/50 rounded-lg py-10 flex flex-col items-center gap-2 text-[#F5720C]">
                  <Camera size={28} />
                  <span className="text-sm font-semibold">Choisir une photo</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={choisirPhoto} className="hidden" />
            </label>
            {apercu && <button type="button" onClick={() => { setPhoto(null); setApercu(null); }} className="text-xs text-red-500">Changer de photo</button>}

            <textarea
              value={texte} onChange={(e) => setTexte(e.target.value)} maxLength={200} rows={3}
              placeholder="Un texte pour accompagner la photo (optionnel) : prix, arrivage, promo..."
              className="w-full border border-gray-200 rounded-lg p-3 text-sm"
            />
            <p className="text-[11px] text-gray-400 text-right -mt-2">{texte.length}/200</p>

            {erreur && <p className="text-sm text-red-500">{erreur}</p>}
            <button type="submit" disabled={envoi || !photo} className="w-full bg-[#F5720C] text-white font-bold rounded-lg py-3 disabled:opacity-50">
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
                    <p className="text-[11px] text-gray-400">{ilYa(n.created_at)} · {tempsAvantExpiration(n.expire_le)}</p>
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
