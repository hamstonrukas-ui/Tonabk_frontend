import { useState } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { API_URL } from "../../lib/api";
import { reduireImage } from "../../lib/image";

const MAX_PAR_LOT = 10;

export default function AjoutEnLot({ boutique, authHeaders, onTermine, onFermer }) {
  const [lignes, setLignes] = useState([]); // { id, fichier, apercu, nom, prix, erreur }
  const [devise, setDevise] = useState("USD");
  const [enCours, setEnCours] = useState(false);
  const [progression, setProgression] = useState(0);
  const [total, setTotal] = useState(0);

  const choisirPhotos = (e) => {
    const fichiers = Array.from(e.target.files || []).slice(0, MAX_PAR_LOT - lignes.length);
    const nouvelles = fichiers.map((f, i) => ({
      id: `${Date.now()}-${i}`,
      fichier: f,
      apercu: URL.createObjectURL(f),
      nom: "",
      prix: "",
      erreur: "",
    }));
    setLignes((prev) => [...prev, ...nouvelles]);
    e.target.value = "";
  };

  const maj = (id, champ, valeur) =>
    setLignes((prev) => prev.map((l) => (l.id === id ? { ...l, [champ]: valeur } : l)));

  const retirer = (id) => setLignes((prev) => prev.filter((l) => l.id !== id));

  const publierTout = async () => {
    const incompletes = lignes.filter((l) => !l.nom.trim() || !l.prix);
    if (incompletes.length) {
      setLignes((prev) =>
        prev.map((l) => (!l.nom.trim() || !l.prix ? { ...l, erreur: "Nom et prix requis" } : { ...l, erreur: "" }))
      );
      return;
    }

    setEnCours(true);
    setTotal(lignes.length);
    setProgression(0);
    const restantes = [];

    for (const ligne of lignes) {
      try {
        const headersUpload = await authHeaders(false);
        if (!headersUpload) { setEnCours(false); return; }

        const photoReduite = await reduireImage(ligne.fichier);
        const formData = new FormData();
        formData.append("photo", photoReduite);
        formData.append("boutiqueId", boutique.id);

        const resUpload = await fetch(`${API_URL}/api/upload/photo`, {
          method: "POST", headers: headersUpload, body: formData,
        });
        if (!resUpload.ok) {
          const data = await resUpload.json().catch(() => ({}));
          throw new Error(data.message || data.error || "Échec de l'envoi de la photo");
        }
        const { url } = await resUpload.json();

        const headersJson = await authHeaders();
        const res = await fetch(`${API_URL}/api/produits`, {
          method: "POST",
          headers: headersJson,
          body: JSON.stringify({
            boutique_id: boutique.id,
            nom: ligne.nom.trim(),
            prix: Number(ligne.prix),
            devise,
            stock: 0,
            description: "",
            photo_url: url,
            photo_thumb_url: url,
            prix_gros: null,
            quantite_min_gros: null,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Échec de l'ajout du produit");
        }
      } catch (err) {
        restantes.push({ ...ligne, erreur: err.message || "Erreur" });
      }
      setProgression((p) => p + 1);
    }

    setEnCours(false);
    setLignes(restantes); // on garde seulement celles qui ont échoué, pour réessayer
    onTermine(); // recharge la liste des produits
    if (restantes.length === 0) onFermer();
  };

  return (
    <div className="bg-white rounded-xl p-3 space-y-3 mb-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[#1B1B1B]">Ajouter plusieurs produits</p>
        <button onClick={onFermer} disabled={enCours} className="text-gray-400"><X size={16} /></button>
      </div>

      {lignes.length < MAX_PAR_LOT && (
        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-[#F5720C]/40 rounded-lg py-4 text-xs font-semibold text-[#F5720C] cursor-pointer">
          <Camera size={16} />
          {lignes.length === 0 ? `Choisir jusqu'à ${MAX_PAR_LOT} photos` : "Ajouter d'autres photos"}
          <input type="file" accept="image/*" multiple onChange={choisirPhotos} className="hidden" disabled={enCours} />
        </label>
      )}

      {lignes.length > 0 && (
        <>
          <select value={devise} onChange={(e) => setDevise(e.target.value)} disabled={enCours}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full">
            <option value="USD">Tous les prix en USD ($)</option>
            <option value="CDF">Tous les prix en CDF (FC)</option>
          </select>

          <div className="space-y-2">
            {lignes.map((l) => (
              <div key={l.id} className="flex gap-2 items-start">
                <img src={l.apercu} alt="" className="w-14 h-14 rounded-md object-cover flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <input value={l.nom} onChange={(e) => maj(l.id, "nom", e.target.value)} placeholder="Nom du produit"
                    disabled={enCours} className="border border-gray-200 rounded-md px-2 py-1.5 text-sm w-full" />
                  <input value={l.prix} onChange={(e) => maj(l.id, "prix", e.target.value)} type="number" placeholder="Prix"
                    disabled={enCours} className="border border-gray-200 rounded-md px-2 py-1.5 text-sm w-full" />
                  {l.erreur && <p className="text-[11px] text-red-500">{l.erreur}</p>}
                </div>
                {!enCours && (
                  <button onClick={() => retirer(l.id)} className="text-gray-300 mt-1"><X size={14} /></button>
                )}
              </div>
            ))}
          </div>

          <button onClick={publierTout} disabled={enCours}
            className="w-full bg-[#F5720C] text-white text-sm font-semibold rounded-md py-2.5 flex items-center justify-center gap-2">
            {enCours ? (
              <><Loader2 size={14} className="animate-spin" /> Publication {progression}/{total}...</>
            ) : (
              `Publier ${lignes.length} produit${lignes.length > 1 ? "s" : ""}`
            )}
          </button>
        </>
      )}
    </div>
  );
}
