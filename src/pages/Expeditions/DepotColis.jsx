// Formulaire « Déposer mon colis » : départ, destination, description, photos, contact.
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Camera, X, CheckCircle } from "lucide-react";
import { API_URL } from "../../lib/api";
import { NUMERO_WHATSAPP_EXPEDITION } from "../../lib/expeditions";

const LIEUX = ["Bukavu", "Goma", "Bujumbura (Burundi)", "Uvira", "Kalemie", "Lubumbashi", "Chine"];
const champ = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-[#F5720C]";

// Réduit la photo (1280 px max, JPEG) pour un envoi rapide même avec peu de réseau
function reduire(fichier) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(fichier);
    img.onload = () => {
      const echelle = Math.min(1, 1280 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * echelle); c.height = Math.round(img.height * echelle);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob((b) => resolve(b || fichier), "image/jpeg", 0.82);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(fichier); };
    img.src = url;
  });
}

export default function DepotColis() {
  const [depart, setDepart] = useState("");
  const [destination, setDestination] = useState("");
  const [description, setDescription] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [photos, setPhotos] = useState([]); // { blob, apercu }
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [fini, setFini] = useState(false);
  const inputRef = useRef(null);

  const ajouter = async (e) => {
    const fichiers = Array.from(e.target.files || []).slice(0, 3 - photos.length);
    e.target.value = "";
    const prets = [];
    for (const f of fichiers) { const blob = await reduire(f); prets.push({ blob, apercu: URL.createObjectURL(blob) }); }
    setPhotos((p) => [...p, ...prets].slice(0, 3));
  };
  const retirer = (i) => setPhotos((p) => p.filter((_, k) => k !== i));

  const envoyer = async (e) => {
    e.preventDefault();
    setErreur("");
    if (!depart.trim() || !destination.trim()) return setErreur("Indiquez le lieu de départ et la destination.");
    if (!description.trim()) return setErreur("Décrivez votre colis.");
    if (telephone.replace(/\D/g, "").length < 8) return setErreur("Indiquez votre numéro WhatsApp.");
    setEnvoi(true);
    try {
      const fd = new FormData();
      fd.append("depart", depart); fd.append("destination", destination); fd.append("description", description);
      fd.append("nom", nom); fd.append("telephone", telephone);
      photos.forEach((p, i) => fd.append("photos", p.blob, `colis-${i + 1}.jpg`));
      const r = await fetch(`${API_URL}/api/colis`, { method: "POST", body: fd });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Envoi impossible");
      setFini(true);
    } catch (err) {
      setErreur(err.message || "Envoi impossible. Vérifiez votre connexion et réessayez.");
    } finally {
      setEnvoi(false);
    }
  };

  const ecrire = () => {
    const msg = `Bonjour, je viens de déposer une demande de colis sur l'application.\nDépart : ${depart}\nDestination : ${destination}\nColis : ${description}`;
    window.open(`https://wa.me/${NUMERO_WHATSAPP_EXPEDITION}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (fini) {
    return (
      <div className="px-4 pt-16 text-center">
        <CheckCircle size={56} className="mx-auto text-[#2E9E5B]" />
        <h1 className="text-lg font-extrabold mt-4 text-[#1B1B1B]">Demande envoyée !</h1>
        <p className="text-sm text-gray-600 mt-2">Notre équipe vous contactera très vite sur WhatsApp au {telephone}.</p>
        <button onClick={ecrire} className="w-full bg-[#25D366] text-white text-sm font-extrabold rounded-xl py-3.5 mt-6">Prévenir l'équipe sur WhatsApp</button>
        <Link to="/expeditions" className="block text-xs font-semibold text-[#F5720C] mt-4">Retour aux expéditions</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-gradient-to-b from-[#F5720C] to-[#C9560A] text-white px-4 pt-5 pb-5 rounded-b-3xl">
        <Link to="/expeditions" className="inline-flex items-center gap-1 text-xs font-semibold text-white/90"><ArrowLeft size={14} /> Expéditions</Link>
        <h1 className="text-xl font-extrabold mt-3">Déposer mon colis</h1>
        <p className="text-xs text-white/85 mt-1">Remplissez ce formulaire, nous vous recontactons sur WhatsApp.</p>
      </div>

      <form onSubmit={envoyer} className="px-3 mt-4 flex flex-col gap-3 pb-6">
        <datalist id="lieux">{LIEUX.map((l) => <option key={l} value={l} />)}</datalist>

        <label className="text-xs font-bold text-[#1B1B1B]">Lieu de départ
          <input list="lieux" value={depart} onChange={(e) => setDepart(e.target.value)} placeholder="Ex. Bukavu" maxLength={80} className={`${champ} mt-1 font-normal`} />
        </label>
        <label className="text-xs font-bold text-[#1B1B1B]">Destination
          <input list="lieux" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Ex. Lubumbashi" maxLength={80} className={`${champ} mt-1 font-normal`} />
        </label>
        <label className="text-xs font-bold text-[#1B1B1B]">Description du colis
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={1500}
            placeholder="Ex. 3 cartons de vêtements, environ 40 kg" className={`${champ} mt-1 font-normal`} />
        </label>

        <div>
          <p className="text-xs font-bold text-[#1B1B1B] mb-1">Photos du colis (3 maximum)</p>
          <div className="flex gap-2 flex-wrap">
            {photos.map((p, i) => (
              <div key={p.apercu} className="relative w-20 h-20">
                <img src={p.apercu} alt="" className="w-20 h-20 object-cover rounded-xl border border-gray-200" />
                <button type="button" onClick={() => retirer(i)} className="absolute -top-1.5 -right-1.5 bg-[#C62828] text-white rounded-full w-5 h-5 flex items-center justify-center"><X size={12} /></button>
              </div>
            ))}
            {photos.length < 3 && (
              <button type="button" onClick={() => inputRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-[#F5720C] text-[#F5720C] flex flex-col items-center justify-center text-[10px] font-bold gap-1">
                <Camera size={20} /> Ajouter
              </button>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/*" multiple onChange={ajouter} className="hidden" />
        </div>

        <label className="text-xs font-bold text-[#1B1B1B]">Votre nom (facultatif)
          <input value={nom} onChange={(e) => setNom(e.target.value)} maxLength={80} className={`${champ} mt-1 font-normal`} />
        </label>
        <label className="text-xs font-bold text-[#1B1B1B]">Votre numéro WhatsApp
          <input type="tel" inputMode="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="Ex. +243 8xx xxx xxx" maxLength={30} className={`${champ} mt-1 font-normal`} />
        </label>

        {erreur && <p className="text-xs font-semibold text-[#C62828]">{erreur}</p>}
        <button type="submit" disabled={envoi} className="w-full bg-[#F5720C] text-white text-sm font-extrabold rounded-xl py-3.5 disabled:opacity-60">
          {envoi ? "Envoi en cours…" : "Envoyer ma demande"}
        </button>
      </form>
    </div>
  );
}
