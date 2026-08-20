import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Trash2, ArrowLeft, Bell, MessageCircle } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { API_URL } from "../../lib/api";

const fmt = (n) => n.toLocaleString("fr-FR") + " FC";

export default function GererBoutique() {
  const navigate = useNavigate();
  const [boutique, setBoutique] = useState(null);
  const [produits, setProduits] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [afficherForm, setAfficherForm] = useState(false);

  const [nom, setNom] = useState("");
  const [prix, setPrix] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState("");

  // --- Nouveautés / abonnés ---
  const [annonce, setAnnonce] = useState("");
  const [envoiAnnonceEnCours, setEnvoiAnnonceEnCours] = useState(false);
  const [annonces, setAnnonces] = useState([]);
  const [nbAbonnes, setNbAbonnes] = useState(0);
  const [abonnesTel, setAbonnesTel] = useState([]);

  // --- Ajout manuel d'un ami ---
  const [afficherFormAmi, setAfficherFormAmi] = useState(false);
  const [nomAmi, setNomAmi] = useState("");
  const [telAmi, setTelAmi] = useState("");

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

  async function charger() {
    setChargement(true);
    const headers = await authHeaders();
    if (!headers) return;

    const res = await fetch(`${API_URL}/api/boutiques/mine`, { headers });
    if (res.ok) {
      const mesBoutiques = await res.json();
      const b = mesBoutiques[0] || null;
      setBoutique(b);
      if (b) {
        const resP = await fetch(`${API_URL}/api/produits?boutique_id=${b.id}`);
        if (resP.ok) setProduits(await resP.json());

        const resA = await fetch(`${API_URL}/api/boutiques/${b.id}/annonces`);
        if (resA.ok) {
          const dataA = await resA.json();
          setAnnonces(dataA.annonces || []);
          setNbAbonnes(dataA.nb_abonnes || 0);
        }

        const resAb = await fetch(`${API_URL}/api/boutiques/${b.id}/abonnes`, { headers });
        if (resAb.ok) setAbonnesTel(await resAb.json());
      }
    }
    setChargement(false);
  }

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          stock: Number(stock) || 0,
          description,
          photo_url,
          photo_thumb_url,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErreur(data.error || "Échec de l'ajout du produit");
        setEnvoiEnCours(false);
        return;
      }

      setNom(""); setPrix(""); setStock(""); setDescription(""); setPhoto(null);
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
    if (!telAmi.trim()) return;
    const headers = await authHeaders();
    if (!headers) return;

    const res = await fetch(`${API_URL}/api/boutiques/${boutique.id}/contacts`, {
      method: "POST",
      headers,
      body: JSON.stringify({ nom: nomAmi.trim(), telephone: telAmi.trim() }),
    });

    if (res.ok) {
      const nouveau = await res.json();
      setAbonnesTel([...abonnesTel, { ...nouveau, source: "manuel" }]);
      setNomAmi(""); setTelAmi(""); setAfficherFormAmi(false);
    }
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

      {boutique.statut === "en_attente" && (
        <div className="bg-yellow-50 text-yellow-700 text-xs rounded-lg p-3 mb-3">
          Votre boutique est en attente de validation par l'équipe. Vous pouvez déjà ajouter vos produits.
        </div>
      )}

      {/* --- Section Produits --- */}
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
          <input value={prix} onChange={(e) => setPrix(e.target.value)} type="number" placeholder="Prix (FC)" required
            className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full" />
          <input value={stock} onChange={(e) => setStock(e.target.value)} type="number" placeholder="Stock"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={2}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full resize-none" />
          <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])}
            className="text-xs w-full" />
          <button type="submit" disabled={envoiEnCours}
            className="w-full bg-[#F5720C] text-white text-sm font-semibold rounded-md py-2.5">
            {envoiEnCours ? "Envoi..." : "Publier le produit"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-2 gap-2.5 mb-6">
        {produits.map((p) => (
          <div key={p.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
            <div className="bg-[#F6F6F6] h-24 flex items-center justify-center text-3xl">
              {p.photo_url ? <img src={p.photo_thumb_url || p.photo_url} className="w-full h-full object-cover" /> : "📦"}
            </div>
            <div className="p-2.5">
              <p className="text-[11.5px] font-medium leading-tight h-8 overflow-hidden">{p.nom}</p>
              <p className="text-sm font-extrabold mt-1">{fmt(p.prix)}</p>
              <button
                onClick={() => supprimerProduit(p.id)}
                className="mt-2 flex items-center justify-center gap-1 w-full border border-red-200 text-red-500 text-[11px] font-semibold rounded-md py-1.5"
              >
                <Trash2 size={12} /> Supprimer
              </button>
            </div>
          </div>
        ))}
        {produits.length === 0 && !afficherForm && (
          <p className="col-span-2 text-center text-sm text-gray-400 py-8">Aucun produit publié pour l'instant</p>
        )}
      </div>

      {/* --- Section Nouveautés / Abonnés --- */}
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Nouveautés — {nbAbonnes} abonné{nbAbonnes > 1 ? "s" : ""}
      </p>

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

      {/* --- Ajouter un ami manuellement --- */}
      <div className="bg-white rounded-xl p-3 mb-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500">Ajouter un ami par son numéro</p>
          <button onClick={() => setAfficherFormAmi(!afficherFormAmi)} className="text-xs font-semibold text-[#F5720C]">
            {afficherFormAmi ? "Annuler" : "+ Ajouter"}
          </button>
        </div>
        {afficherFormAmi && (
          <form onSubmit={ajouterAmi} className="mt-2 space-y-2">
            <input value={nomAmi} onChange={(e) => setNomAmi(e.target.value)} placeholder="Nom (optionnel)"
              className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full" />
            <input value={telAmi} onChange={(e) => setTelAmi(e.target.value)} type="tel" placeholder="Numéro WhatsApp" required
              className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full" />
            <button type="submit" className="w-full bg-[#1B1B1B] text-white text-xs font-semibold rounded-md py-2">
              Ajouter cet ami
            </button>
          </form>
        )}
      </div>

      {abonnesTel.length > 0 && (
        <div className="bg-white rounded-xl p-3 mb-3">
          <p className="text-[11px] text-gray-400 mb-2">
            Envoyer la dernière annonce sur WhatsApp — un clic par contact pour pré-remplir le message
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
                                 
