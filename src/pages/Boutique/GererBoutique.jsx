import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Trash2, ArrowLeft, Bell, MessageCircle, Copy, Check, NotebookPen, ChevronDown, ChevronUp, Camera, Pencil } from "lucide-react";
import Calculatrice from "../../components/Calculatrice";
import { supabase } from "../../lib/supabaseClient";
import { API_URL, SITE_URL } from "../../lib/api";

const fmt = (n, devise = "USD") => n.toLocaleString("fr-FR") + " " + devise;

function ChoisirImage({ onChange, fichier }) {
  return (
    <label className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2 text-xs font-semibold text-gray-500 cursor-pointer">
      <Camera size={14} className="text-[#F5720C] flex-shrink-0" />
      <span className="truncate">{fichier ? fichier.name : "Choisir une image"}</span>
      <input type="file" accept="image/*" onChange={onChange} className="hidden" />
    </label>
  );
}

const CLE_CACHE_BOUTIQUE = "tonabk_cache_ma_boutique";

function lireCacheBoutique() {
  try {
    const brut = localStorage.getItem(CLE_CACHE_BOUTIQUE);
    return brut ? JSON.parse(brut) : null;
  } catch {
    return null;
  }
}

function ecrireCacheBoutique(snapshot) {
  try {
    localStorage.setItem(CLE_CACHE_BOUTIQUE, JSON.stringify(snapshot));
  } catch {
    // Stockage plein ou indisponible — on continue sans casser l'app
  }
}

export default function GererBoutique() {
  const navigate = useNavigate();
  const [boutique, setBoutique] = useState(null);
  const [produits, setProduits] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [afficherForm, setAfficherForm] = useState(false);
  const [lienCopie, setLienCopie] = useState(false);

  const [nom, setNom] = useState("");
  const [prix, setPrix] = useState("");
  const [devise, setDevise] = useState("USD");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [prixGros, setPrixGros] = useState("");
  const [quantiteMinGros, setQuantiteMinGros] = useState("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState("");

  const [produitEnEdition, setProduitEnEdition] = useState(null);
  const [editNom, setEditNom] = useState("");
  const [editPrix, setEditPrix] = useState("");
  const [editDevise, setEditDevise] = useState("USD");
  const [editStock, setEditStock] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrixGros, setEditPrixGros] = useState("");
  const [editQuantiteMinGros, setEditQuantiteMinGros] = useState("");
  const [editPhoto, setEditPhoto] = useState(null);
  const [editEnvoiEnCours, setEditEnvoiEnCours] = useState(false);
  const [editErreur, setEditErreur] = useState("");

  const [noteTexte, setNoteTexte] = useState("");
  const [notes, setNotes] = useState([]);
  const [envoiNoteEnCours, setEnvoiNoteEnCours] = useState(false);

  const [annonce, setAnnonce] = useState("");
  const [envoiAnnonceEnCours, setEnvoiAnnonceEnCours] = useState(false);
  const [annonces, setAnnonces] = useState([]);
  const [nbAbonnes, setNbAbonnes] = useState(0);
  const [abonnesTel, setAbonnesTel] = useState([]);

  const [afficherFormAmi, setAfficherFormAmi] = useState(false);
  const [nomAmi, setNomAmi] = useState("");
  const [telAmi, setTelAmi] = useState("");
  const [erreurAmi, setErreurAmi] = useState("");
  const [envoiAmiEnCours, setEnvoiAmiEnCours] = useState(false);

  const [voirAidePublier, setVoirAidePublier] = useState(false);
  const [voirAideLien, setVoirAideLien] = useState(false);

  const [logoEnvoiEnCours, setLogoEnvoiEnCours] = useState(false);
  const [logoErreur, setLogoErreur] = useState("");

  const [afficherEditInfos, setAfficherEditInfos] = useState(false);
  const [categories, setCategories] = useState([]);
  const [infoNom, setInfoNom] = useState("");
  const [infoTelephone, setInfoTelephone] = useState("");
  const [infoDescription, setInfoDescription] = useState("");
  const [infoVille, setInfoVille] = useState("Bukavu");
  const [infoCommune, setInfoCommune] = useState("");
  const [infoQuartier, setInfoQuartier] = useState("");
  const [infoCategorieId, setInfoCategorieId] = useState("");
  const [infoEnvoiEnCours, setInfoEnvoiEnCours] = useState(false);
  const [infoErreur, setInfoErreur] = useState("");

  async function authHeaders(json = true) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/inscription?redirect=/boutique/gerer");
      return null;
    }
    return json
      ? { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }
      : { Authorization: `Bearer ${session.access_token}` };
  }

  async function changerLogo(e) {
    const fichier = e.target.files[0];
    if (!fichier) return;
    setLogoErreur("");
    setLogoEnvoiEnCours(true);

    try {
      const headersUpload = await authHeaders(false);
      if (!headersUpload) { setLogoEnvoiEnCours(false); return; }

      const formData = new FormData();
      formData.append("photo", fichier);
      formData.append("boutiqueId", boutique.id);

      const resUpload = await fetch(`${API_URL}/api/upload/photo-boutique-logo`, {
        method: "POST",
        headers: headersUpload,
        body: formData,
      });

      if (!resUpload.ok) {
        const data = await resUpload.json().catch(() => ({}));
        setLogoErreur(data.message || data.error || "Échec de l'upload de la photo");
        setLogoEnvoiEnCours(false);
        return;
      }

      const { url } = await resUpload.json();

      const headersJson = await authHeaders();
      if (!headersJson) { setLogoEnvoiEnCours(false); return; }

      const resMaj = await fetch(`${API_URL}/api/boutiques/${boutique.id}`, {
        method: "PUT",
        headers: headersJson,
        body: JSON.stringify({
          nom: boutique.nom,
          description: boutique.description,
          telephone: boutique.telephone,
          ville: boutique.ville,
          commune: boutique.commune,
          quartier: boutique.quartier,
          categorie_id: boutique.categorie_id,
          logo_url: url,
        }),
      });

      if (resMaj.ok) {
        const majBoutique = await resMaj.json();
        setBoutique(majBoutique);
      } else {
        setLogoErreur("La photo a été envoyée mais n'a pas pu être enregistrée. Réessayez.");
      }
    } catch (err) {
      setLogoErreur("Une erreur est survenue. Vérifiez votre connexion et réessayez.");
    }
    setLogoEnvoiEnCours(false);
  }

  async function modifierInfos(e) {
    e.preventDefault();
    setInfoErreur("");
    setInfoEnvoiEnCours(true);

    const headers = await authHeaders();
    if (!headers) { setInfoEnvoiEnCours(false); return; }

    try {
      const res = await fetch(`${API_URL}/api/boutiques/${boutique.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          nom: infoNom.trim(),
          description: infoDescription.trim(),
          telephone: infoTelephone.trim(),
          ville: infoVille,
          commune: infoCommune.trim(),
          quartier: infoQuartier.trim(),
          categorie_id: infoCategorieId,
          logo_url: boutique.logo_url,
        }),
      });

      if (res.ok) {
        setBoutique(await res.json());
        setAfficherEditInfos(false);
      } else {
        const data = await res.json().catch(() => ({}));
        setInfoErreur(data.error || "Échec de l'enregistrement. Réessayez.");
      }
    } catch {
      setInfoErreur("Une erreur est survenue. Vérifiez votre connexion et réessayez.");
    }
    setInfoEnvoiEnCours(false);
  }

  async function charger(silencieux = false) {
    if (!silencieux) setChargement(true);
    const headers = await authHeaders();
    if (!headers) return;

    const res = await fetch(`${API_URL}/api/boutiques/mine`, { headers });
    if (res.ok) {
      const mesBoutiques = await res.json();
      const b = mesBoutiques[0] || null;
      setBoutique(b);

      let produitsData = [], notesData = [], annoncesData = [], nbAbonnesData = 0, abonnesTelData = [];

      if (b) {
        setInfoNom(b.nom || "");
        setInfoTelephone(b.telephone || "");
        setInfoDescription(b.description || "");
        setInfoVille(b.ville || "Bukavu");
        setInfoCommune(b.commune || "");
        setInfoQuartier(b.quartier || "");
        setInfoCategorieId(b.categorie_id || "");

        const resP = await fetch(`${API_URL}/api/produits?boutique_id=${b.id}`);
        if (resP.ok) { produitsData = await resP.json(); setProduits(produitsData); }

        const resN = await fetch(`${API_URL}/api/boutiques/${b.id}/notes`, { headers });
        if (resN.ok) { notesData = await resN.json(); setNotes(notesData); }

        const resA = await fetch(`${API_URL}/api/boutiques/${b.id}/annonces`);
        if (resA.ok) {
          const dataA = await resA.json();
          annoncesData = dataA.annonces || [];
          nbAbonnesData = dataA.nb_abonnes || 0;
          setAnnonces(annoncesData);
          setNbAbonnes(nbAbonnesData);
        }

        const resAb = await fetch(`${API_URL}/api/boutiques/${b.id}/abonnes`, { headers });
        if (resAb.ok) { abonnesTelData = await resAb.json(); setAbonnesTel(abonnesTelData); }
      }

      ecrireCacheBoutique({ boutique: b, produits: produitsData, notes: notesData, annonces: annoncesData, nbAbonnes: nbAbonnesData, abonnesTel: abonnesTelData });
    }
    setChargement(false);
  }

  useEffect(() => {
    const cache = lireCacheBoutique();
    if (cache) {
      setBoutique(cache.boutique);
      setProduits(cache.produits || []);
      setNotes(cache.notes || []);
      setAnnonces(cache.annonces || []);
      setNbAbonnes(cache.nbAbonnes || 0);
      setAbonnesTel(cache.abonnesTel || []);
      if (cache.boutique) {
        setInfoNom(cache.boutique.nom || "");
        setInfoTelephone(cache.boutique.telephone || "");
        setInfoDescription(cache.boutique.description || "");
        setInfoVille(cache.boutique.ville || "Bukavu");
        setInfoCommune(cache.boutique.commune || "");
        setInfoQuartier(cache.boutique.quartier || "");
        setInfoCategorieId(cache.boutique.categorie_id || "");
      }
      setChargement(false);
      charger(true); // on rafraîchit en silence derrière, sans réafficher "Chargement..."
    } else {
      charger(false);
    }
    fetch(`${API_URL}/api/categories`).then((r) => r.json()).then(setCategories).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lienBoutique = boutique ? `${SITE_URL}/boutique/${boutique.id}` : "";

  const copierLien = () => {
    navigator.clipboard.writeText(lienBoutique);
    setLienCopie(true);
    setTimeout(() => setLienCopie(false), 1500);
  };

  const partagerLienBoutique = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: boutique.nom, text: `Découvre "${boutique.nom}" sur TonaBk !`, url: lienBoutique });
      } catch {
        // Partage annulé
      }
    } else {
      copierLien();
    }
  };

  const ajouterNote = async (e) => {
    e.preventDefault();
    if (!noteTexte.trim()) return;
    setEnvoiNoteEnCours(true);

    const headers = await authHeaders();
    if (!headers) { setEnvoiNoteEnCours(false); return; }

    const res = await fetch(`${API_URL}/api/boutiques/${boutique.id}/notes`, {
      method: "POST",
      headers,
      body: JSON.stringify({ texte: noteTexte.trim() }),
    });

    if (res.ok) {
      const nouvelle = await res.json();
      setNotes([nouvelle, ...notes]);
      setNoteTexte("");
    }
    setEnvoiNoteEnCours(false);
  };

  const supprimerNote = async (noteId) => {
    const headers = await authHeaders();
    if (!headers) return;
    await fetch(`${API_URL}/api/boutiques/notes/${noteId}`, { method: "DELETE", headers });
    setNotes(notes.filter((n) => n.id !== noteId));
  };

  const ajouterProduit = async (e) => {
    e.preventDefault();
    setErreur("");
    setEnvoiEnCours(true);

    try {
      let photo_url = null;
      let photo_thumb_url = null;

      if (photo) {
        const headersUpload = await authHeaders(false);
        if (!headersUpload) return;

        const formData = new FormData();
        formData.append("photo", photo);
        formData.append("boutiqueId", boutique.id);

        const resUpload = await fetch(`${API_URL}/api/upload/photo`, {
          method: "POST",
          headers: headersUpload,
          body: formData,
        });

        if (!resUpload.ok) {
          const data = await resUpload.json();
          setErreur(data.message || data.error || "Échec de l'upload de la photo");
          setEnvoiEnCours(false);
          return;
        }

        const dataUpload = await resUpload.json();
        photo_url = dataUpload.url;
        photo_thumb_url = dataUpload.url;
      }

      const headersJson = await authHeaders();
      const res = await fetch(`${API_URL}/api/produits`, {
        method: "POST",
        headers: headersJson,
        body: JSON.stringify({
          boutique_id: boutique.id,
          nom,
          prix: Number(prix),
          devise,
          stock: Number(stock) || 0,
          description,
          photo_url,
          photo_thumb_url,
          prix_gros: prixGros ? Number(prixGros) : null,
          quantite_min_gros: prixGros && quantiteMinGros ? Number(quantiteMinGros) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErreur(data.error || "Échec de l'ajout du produit");
        setEnvoiEnCours(false);
        return;
      }

      setNom(""); setPrix(""); setDevise("USD"); setStock(""); setDescription(""); setPhoto(null);
      setPrixGros(""); setQuantiteMinGros("");
      setAfficherForm(false);
      setEnvoiEnCours(false);
      charger();
    } catch (err) {
      setErreur("Une erreur est survenue");
      setEnvoiEnCours(false);
    }
  };

  const supprimerProduit = async (id) => {
    if (!confirm("Supprimer ce produit ?")) return;
    const headers = await authHeaders();
    if (!headers) return;
    await fetch(`${API_URL}/api/produits/${id}`, { method: "DELETE", headers });
    charger();
  };

  const ouvrirEdition = (p) => {
    setProduitEnEdition(p.id);
    setEditNom(p.nom);
    setEditPrix(String(p.prix));
    setEditDevise(p.devise || "USD");
    setEditStock(String(p.stock ?? ""));
    setEditDescription(p.description || "");
    setEditPrixGros(p.prix_gros ? String(p.prix_gros) : "");
    setEditQuantiteMinGros(p.quantite_min_gros ? String(p.quantite_min_gros) : "");
    setEditPhoto(null);
    setEditErreur("");
  };

  const modifierProduit = async (e, produitActuel) => {
    e.preventDefault();
    setEditErreur("");
    setEditEnvoiEnCours(true);

    try {
      let photo_url, photo_thumb_url;

      if (editPhoto) {
        const headersUpload = await authHeaders(false);
        if (!headersUpload) { setEditEnvoiEnCours(false); return; }

        const formData = new FormData();
        formData.append("photo", editPhoto);
        formData.append("boutiqueId", boutique.id);

        const resUpload = await fetch(`${API_URL}/api/upload/photo`, {
          method: "POST",
          headers: headersUpload,
          body: formData,
        });

        if (!resUpload.ok) {
          const data = await resUpload.json().catch(() => ({}));
          setEditErreur(data.message || data.error || "Échec de l'upload de la photo");
          setEditEnvoiEnCours(false);
          return;
        }

        const dataUpload = await resUpload.json();
        photo_url = dataUpload.url;
        photo_thumb_url = dataUpload.url;
      }

      const headersJson = await authHeaders();
      if (!headersJson) { setEditEnvoiEnCours(false); return; }

      const res = await fetch(`${API_URL}/api/produits/${produitActuel.id}`, {
        method: "PUT",
        headers: headersJson,
        body: JSON.stringify({
          nom: editNom,
          prix: Number(editPrix),
          devise: editDevise,
          stock: Number(editStock) || 0,
          description: editDescription,
          prix_gros: editPrixGros ? Number(editPrixGros) : null,
          quantite_min_gros: editPrixGros && editQuantiteMinGros ? Number(editQuantiteMinGros) : null,
          photo_url,
          photo_thumb_url,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setEditErreur(data.error || "Échec de la modification");
        setEditEnvoiEnCours(false);
        return;
      }

      setProduitEnEdition(null);
      setEditEnvoiEnCours(false);
      charger();
    } catch {
      setEditErreur("Une erreur est survenue. Vérifiez votre connexion et réessayez.");
      setEditEnvoiEnCours(false);
    }
  };

  const publierAnnonce = async () => {
    if (!annonce.trim()) return;
    setEnvoiAnnonceEnCours(true);

    const headers = await authHeaders();
    if (!headers) { setEnvoiAnnonceEnCours(false); return; }

    const res = await fetch(`${API_URL}/api/boutiques/${boutique.id}/annonces`, {
      method: "POST",
      headers,
      body: JSON.stringify({ texte: annonce.trim() }),
    });

    if (res.ok) {
      const nouvelle = await res.json();
      setAnnonces([nouvelle, ...annonces]);
      setAnnonce("");
    }
    setEnvoiAnnonceEnCours(false);
  };

  const ajouterAmi = async (e) => {
    e.preventDefault();
    setErreurAmi("");
    if (!telAmi.trim()) return;
    setEnvoiAmiEnCours(true);

    try {
      const headers = await authHeaders();
      if (!headers) { setEnvoiAmiEnCours(false); return; }

      const res = await fetch(`${API_URL}/api/boutiques/${boutique.id}/contacts`, {
        method: "POST",
        headers,
        body: JSON.stringify({ nom: nomAmi.trim(), telephone: telAmi.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErreurAmi(data.error || "Échec de l'ajout du client. Vérifiez le numéro et réessayez.");
        setEnvoiAmiEnCours(false);
        return;
      }

      setNomAmi(""); setTelAmi(""); setAfficherFormAmi(false);

      // On recharge la liste depuis le serveur pour être sûr que le nouveau client apparaît bien
      const headersAb = await authHeaders();
      if (headersAb) {
        const resAb = await fetch(`${API_URL}/api/boutiques/${boutique.id}/abonnes`, { headers: headersAb });
        if (resAb.ok) setAbonnesTel(await resAb.json());
      }
    } catch (err) {
      setErreurAmi("Une erreur est survenue. Vérifiez votre connexion et réessayez.");
    }
    setEnvoiAmiEnCours(false);
  };

  const retirerAmi = async (contactId) => {
    const headers = await authHeaders();
    if (!headers) return;
    await fetch(`${API_URL}/api/boutiques/${boutique.id}/contacts/${contactId}`, { method: "DELETE", headers });
    setAbonnesTel(abonnesTel.filter((a) => a.id !== contactId));
  };

  const envoyerWhatsApp = (telephone, texte) => {
    const msg = `${boutique?.nom} : ${texte}`;
    window.open(`https://wa.me/${telephone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (chargement) return <p className="text-center text-sm text-gray-400 py-10">Chargement...</p>;

  if (!boutique) {
    return (
      <div className="p-3 text-center py-10">
        <p className="text-sm text-gray-500 mb-3">Vous n'avez pas encore de boutique.</p>
        <Link to="/boutique/creer" className="inline-block bg-[#F5720C] text-white text-sm font-semibold px-4 py-2 rounded-lg">
          Créer ma boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-3">
        <Link to="/boutique" className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
          <ArrowLeft size={16} />
        </Link>
        <p className="text-sm font-bold text-[#1B1B1B]">{boutique.nom}</p>
      </div>

      <div className="bg-white rounded-xl p-3.5 mb-3 flex items-center gap-3">
        <div className="relative flex-shrink-0">
          {boutique.logo_url ? (
            <img src={boutique.logo_url} alt={boutique.nom} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#F5720C] text-white font-bold text-xl flex items-center justify-center">
              {boutique.nom.slice(0, 2).toUpperCase()}
            </div>
          )}
          <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1B1B1B] flex items-center justify-center cursor-pointer">
            <Camera size={12} className="text-white" />
            <input type="file" accept="image/*" onChange={changerLogo} className="hidden" />
          </label>
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-[#1B1B1B]">Photo de profil de la boutique</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {logoEnvoiEnCours ? "Envoi en cours..." : "Elle apparaît partout où votre boutique est affichée sur TonaBk."}
          </p>
          {logoErreur && <p className="text-[11px] text-red-500 mt-1">{logoErreur}</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl p-3.5 mb-3">
        <button
          onClick={() => setAfficherEditInfos(!afficherEditInfos)}
          className="w-full flex items-center justify-between"
        >
          <span className="flex items-center gap-2 text-sm font-bold text-[#1B1B1B]">
            <Pencil size={14} className="text-[#F5720C]" /> Informations de la boutique
          </span>
          {afficherEditInfos ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>

        {afficherEditInfos && (
          <form onSubmit={modifierInfos} className="mt-3 space-y-2">
            {infoErreur && <p className="text-xs text-red-500">{infoErreur}</p>}

            <input
              value={infoNom} onChange={(e) => setInfoNom(e.target.value)} placeholder="Nom de la boutique" required
              className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full"
            />
            <select
              value={infoCategorieId} onChange={(e) => setInfoCategorieId(e.target.value)} required
              className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full"
            >
              <option value="">Catégorie</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.icone} {c.nom}</option>)}
            </select>
            <input
              value={infoTelephone} onChange={(e) => setInfoTelephone(e.target.value)} placeholder="Numéro WhatsApp" required
              className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full"
            />
            <textarea
              value={infoDescription} onChange={(e) => setInfoDescription(e.target.value)} placeholder="Description" rows={3}
              className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full resize-none"
            />

            <div className="flex gap-2">
              {["Bukavu", "Goma"].map((v) => (
                <button
                  key={v} type="button" onClick={() => setInfoVille(v)}
                  className={`flex-1 text-sm font-semibold rounded-md py-2 border ${
                    infoVille === v ? "bg-[#F5720C] text-white border-[#F5720C]" : "bg-white text-gray-600 border-gray-200"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <input
              value={infoCommune} onChange={(e) => setInfoCommune(e.target.value)} placeholder="Commune"
              className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full"
            />
            <input
              value={infoQuartier} onChange={(e) => setInfoQuartier(e.target.value)} placeholder="Quartier"
              className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full"
            />

            <button
              type="submit" disabled={infoEnvoiEnCours}
              className="w-full bg-[#F5720C] text-white text-sm font-semibold rounded-md py-2.5"
            >
              {infoEnvoiEnCours ? "Enregistrement..." : "Enregistrer"}
            </button>
          </form>
        )}
      </div>

      <div className="bg-[#1B1B1B] rounded-xl p-3.5 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <NotebookPen size={16} className="text-[#F5720C]" />
          <p className="text-sm font-bold text-white">Mon journal</p>
        </div>
        <p className="text-[11px] text-gray-400 mb-2">
          Notez ce que vous voulez : ventes du jour, dettes, rappels... Visible par vous seul.
        </p>
        <form onSubmit={ajouterNote} className="flex gap-2 mb-2">
          <input
            value={noteTexte}
            onChange={(e) => setNoteTexte(e.target.value)}
            placeholder="Ex: Vendu 5 chemises, Jean me doit 20$..."
            className="flex-1 bg-white/10 text-white placeholder-gray-500 rounded-md px-3 py-2 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={envoiNoteEnCours}
            className="bg-[#F5720C] text-white text-xs font-semibold px-3 rounded-md"
          >
            {envoiNoteEnCours ? "..." : "Noter"}
          </button>
        </form>
        <div className="space-y-1.5 max-h-52 overflow-y-auto">
          {notes.map((n) => (
            <div key={n.id} className="flex items-start justify-between bg-white/5 rounded-md px-3 py-2">
              <div>
                <p className="text-xs text-white">{n.texte}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {new Date(n.created_at).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <button onClick={() => supprimerNote(n.id)} className="text-gray-500 ml-2 flex-shrink-0">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          {notes.length === 0 && (
            <p className="text-center text-[11px] text-gray-500 py-3">Aucune note pour l'instant</p>
          )}
        </div>
      </div>

      <Calculatrice />

      <Link to="/boutique/inventaire" className="flex items-center justify-between bg-white rounded-xl p-3.5 mb-3">
        <div>
          <p className="text-sm font-bold text-[#1B1B1B]">Inventaire</p>
          <p className="text-[11px] text-gray-400">Suivi interne des achats/ventes — invisible des acheteurs</p>
        </div>
        <span className="text-xs font-semibold text-[#F5720C]">Ouvrir →</span>
      </Link>

      <div className="bg-white rounded-xl p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-500">Lien de ma boutique</p>
          <button
            onClick={() => setVoirAideLien(!voirAideLien)}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#F5720C]"
          >
            Pourquoi ce lien ? {voirAideLien ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        {voirAideLien && (
          <div className="bg-[#FFF8F2] border border-[#FFD3AC] rounded-xl p-3 mb-2 text-[11.5px] text-gray-600 leading-relaxed">
            C'est l'adresse unique de votre boutique sur TonaBk. Partagez-la sur WhatsApp, dans vos statuts,
            sur Facebook ou Instagram : toute personne qui clique dessus arrive directement sur votre catalogue,
            même sans passer par la page d'accueil. Plus vous le partagez, plus vous avez de visiteurs et de ventes.
          </div>
        )}

        <div className="flex items-center justify-between rounded-md px-3 py-2 mb-2 bg-[#FFF1E4]">
          <span className="text-xs font-mono text-[#C9560A] truncate mr-2">{lienBoutique}</span>
          <button onClick={copierLien} className="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-[#C9560A]">
            {lienCopie ? <Check size={12} /> : <Copy size={12} />}
            {lienCopie ? "Copié" : "Copier"}
          </button>
        </div>
        <button
          onClick={partagerLienBoutique}
          className="w-full flex items-center justify-center gap-2 text-xs font-medium text-white rounded-md py-2 bg-[#25D366]"
        >
          <MessageCircle size={13} /> Partager ma boutique
        </button>
      </div>

      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Produits ({produits.length}) — {boutique.photos_utilisees}/{boutique.photo_limite_gratuite} photos utilisées
        </p>
        <button
          onClick={() => setAfficherForm(!afficherForm)}
          className="flex items-center gap-1 bg-[#F5720C] text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
        >
          <Plus size={14} /> Ajouter
        </button>
      </div>

      {afficherForm && (
        <form onSubmit={ajouterProduit} className="bg-white rounded-xl p-3 space-y-2 mb-3">
          {erreur && <p className="text-xs text-red-500">{erreur}</p>}
          <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom du produit" required
            className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full" />
          <input value={prix} onChange={(e) => setPrix(e.target.value)} type="number" placeholder="Prix de détail" required
            className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full" />
          <select value={devise} onChange={(e) => setDevise(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full">
            <option value="USD">USD ($)</option>
            <option value="CDF">CDF (FC)</option>
          </select>

          <div className="bg-gray-50 rounded-md p-2.5">
            <p className="text-[11px] text-gray-500 mb-1.5">
              Prix de gros (optionnel) — laissez vide si vous vendez uniquement au détail
            </p>
            <div className="flex gap-2">
              <input
                value={prixGros} onChange={(e) => setPrixGros(e.target.value)} type="number"
                placeholder={`Prix de gros (${devise})`}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full"
              />
              <input
                value={quantiteMinGros} onChange={(e) => setQuantiteMinGros(e.target.value)} type="number"
                placeholder="Qté min."
                disabled={!prixGros}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm w-28 disabled:bg-gray-100"
              />
            </div>
          </div>

          <input value={stock} onChange={(e) => setStock(e.target.value)} type="number" placeholder="Stock"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={2}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full resize-none" />
          <ChoisirImage fichier={photo} onChange={(e) => setPhoto(e.target.files[0])} />
          <button type="submit" disabled={envoiEnCours}
            className="w-full bg-[#F5720C] text-white text-sm font-semibold rounded-md py-2.5">
            {envoiEnCours ? "Envoi..." : "Publier le produit"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {produits.map((p) => (
          <div key={p.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
            {produitEnEdition === p.id ? (
              <form onSubmit={(e) => modifierProduit(e, p)} className="p-2.5 space-y-1.5">
                {editErreur && <p className="text-[10px] text-red-500">{editErreur}</p>}
                <input value={editNom} onChange={(e) => setEditNom(e.target.value)} placeholder="Nom" required
                  className="border border-gray-200 rounded-md px-2 py-1.5 text-xs w-full" />
                <div className="flex gap-1.5">
                  <input value={editPrix} onChange={(e) => setEditPrix(e.target.value)} type="number" placeholder="Prix" required
                    className="border border-gray-200 rounded-md px-2 py-1.5 text-xs w-full" />
                  <select value={editDevise} onChange={(e) => setEditDevise(e.target.value)}
                    className="border border-gray-200 rounded-md px-2 py-1.5 text-xs">
                    <option value="USD">USD</option>
                    <option value="CDF">CDF</option>
                  </select>
                </div>
                <div className="flex gap-1.5">
                  <input value={editPrixGros} onChange={(e) => setEditPrixGros(e.target.value)} type="number" placeholder="Prix gros"
                    className="border border-gray-200 rounded-md px-2 py-1.5 text-xs w-full" />
                  <input value={editQuantiteMinGros} onChange={(e) => setEditQuantiteMinGros(e.target.value)} type="number" placeholder="Qté min."
                    disabled={!editPrixGros} className="border border-gray-200 rounded-md px-2 py-1.5 text-xs w-20 disabled:bg-gray-100" />
                </div>
                <input value={editStock} onChange={(e) => setEditStock(e.target.value)} type="number" placeholder="Stock"
                  className="border border-gray-200 rounded-md px-2 py-1.5 text-xs w-full" />
                <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Description" rows={2}
                  className="border border-gray-200 rounded-md px-2 py-1.5 text-xs w-full resize-none" />
                <ChoisirImage fichier={editPhoto} onChange={(e) => setEditPhoto(e.target.files[0])} />
                <div className="flex gap-1.5 pt-1">
                  <button type="button" onClick={() => setProduitEnEdition(null)}
                    className="flex-1 border border-gray-200 text-gray-500 text-[11px] font-semibold rounded-md py-1.5">
                    Annuler
                  </button>
                  <button type="submit" disabled={editEnvoiEnCours}
                    className="flex-1 bg-[#F5720C] text-white text-[11px] font-semibold rounded-md py-1.5">
                    {editEnvoiEnCours ? "..." : "Enregistrer"}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="bg-[#F6F6F6] h-24 flex items-center justify-center text-3xl">
                  {p.photo_url ? <img src={p.photo_thumb_url || p.photo_url} className="w-full h-full object-cover" /> : "📦"}
                </div>
                <div className="p-2.5">
                  <p className="text-[11.5px] font-medium leading-tight h-8 overflow-hidden">{p.nom}</p>
                  <p className="text-sm font-extrabold mt-1">{fmt(p.prix, p.devise)}</p>
                  <div className="flex gap-1.5 mt-2">
                    <button
                      onClick={() => ouvrirEdition(p)}
                      className="flex-1 flex items-center justify-center gap-1 border border-gray-200 text-gray-600 text-[11px] font-semibold rounded-md py-1.5"
                    >
                      <Pencil size={12} /> Modifier
                    </button>
                    <button
                      onClick={() => supprimerProduit(p.id)}
                      className="flex-1 flex items-center justify-center gap-1 border border-red-200 text-red-500 text-[11px] font-semibold rounded-md py-1.5"
                    >
                      <Trash2 size={12} /> Supprimer
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
        {produits.length === 0 && !afficherForm && (
          <p className="col-span-2 text-center text-sm text-gray-400 py-8">Aucun produit publié pour l'instant</p>
        )}
      </div>

      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nouveautés</p>
        <button
          onClick={() => setVoirAidePublier(!voirAidePublier)}
          className="flex items-center gap-1 text-[11px] font-semibold text-[#F5720C]"
        >
          Comment ça marche ? {voirAidePublier ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {voirAidePublier && (
        <div className="bg-[#FFF8F2] border border-[#FFD3AC] rounded-xl p-3 mb-3 text-[11.5px] text-gray-600 leading-relaxed">
          Une annonce sert à prévenir vos clients d'une nouveauté : nouvel arrivage, promotion, réouverture...
          <br /><br />
          <b>Comment procéder :</b>
          <br />1. Écrivez votre message dans la zone de texte ci-dessous.
          <br />2. Cliquez sur "Publier l'annonce" — elle est enregistrée et visible dans l'historique plus bas.
          <br />3. Faites défiler jusqu'à la liste de vos clients : un clic sur un nom envoie l'annonce directement à ce client sur WhatsApp.
        </div>
      )}

      <div className="bg-white rounded-xl p-3 mb-3">
        <textarea
          value={annonce}
          onChange={(e) => setAnnonce(e.target.value)}
          placeholder="Ex: Nouvelle collection disponible cette semaine !"
          rows={2}
          className="border border-gray-200 rounded-md px-3 py-2 text-sm resize-none w-full mb-2"
        />
        <button
          onClick={publierAnnonce}
          disabled={envoiAnnonceEnCours}
          className="w-full flex items-center justify-center gap-2 text-sm font-medium text-white rounded-md py-2.5 bg-[#F5720C]"
        >
          <Bell size={16} /> {envoiAnnonceEnCours ? "Publication..." : "Publier l'annonce"}
        </button>
      </div>

      <div className="bg-white rounded-xl p-3 mb-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500">Ajouter un client par son numéro</p>
          <button
            onClick={() => { setAfficherFormAmi(!afficherFormAmi); setErreurAmi(""); }}
            className="text-xs font-semibold text-[#F5720C]"
          >
            {afficherFormAmi ? "Annuler" : "+ Ajouter"}
          </button>
        </div>
        {afficherFormAmi && (
          <form onSubmit={ajouterAmi} className="mt-2 space-y-2">
            {erreurAmi && <p className="text-xs text-red-500">{erreurAmi}</p>}
            <input value={nomAmi} onChange={(e) => setNomAmi(e.target.value)} placeholder="Nom (optionnel)"
              className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full" />
            <input value={telAmi} onChange={(e) => setTelAmi(e.target.value)} type="tel" placeholder="Numéro WhatsApp" required
              className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full" />
            <button type="submit" disabled={envoiAmiEnCours} className="w-full bg-[#1B1B1B] text-white text-xs font-semibold rounded-md py-2">
              {envoiAmiEnCours ? "Ajout..." : "Ajouter ce client"}
            </button>
          </form>
        )}
      </div>

      {abonnesTel.length > 0 && (
        <div className="bg-white rounded-xl p-3 mb-3">
          <p className="text-[11px] text-gray-400 mb-2">
            Envoyer la dernière annonce sur WhatsApp — un clic par contact
          </p>
          <div className="space-y-1.5">
            {abonnesTel.map((a) => (
              <div key={a.id} className="flex items-center gap-1.5">
                <button
                  onClick={() => envoyerWhatsApp(a.telephone, annonces[0]?.texte || annonce)}
                  disabled={!annonces[0] && !annonce.trim()}
                  className="flex-1 flex items-center justify-center gap-2 text-xs font-medium text-white rounded-md py-2 bg-[#25D366] disabled:opacity-40"
                >
                  <MessageCircle size={13} /> {a.nom ? `${a.nom} — ` : ""}{a.telephone}
                </button>
                {a.source === "manuel" && (
                  <button onClick={() => retirerAmi(a.id)} className="text-red-400 px-2">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {annonces.map((a) => (
          <div key={a.id} className="bg-white rounded-xl p-3">
            <p className="text-sm text-[#1B1B1B]">{a.texte}</p>
            <p className="text-xs text-gray-400 mt-1">{new Date(a.created_at).toLocaleDateString("fr-FR")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
