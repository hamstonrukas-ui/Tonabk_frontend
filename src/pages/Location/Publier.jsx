import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { API_URL } from "../../lib/api";
import { analyserNettete } from "../../lib/detectionFlou";

export default function Publier() {
  const navigate = useNavigate();
  const [chargement, setChargement] = useState(true);
  const [connecte, setConnecte] = useState(false);
  const [estAdmin, setEstAdmin] = useState(false);
  const [profilAgence, setProfilAgence] = useState(null);
  const [nomAgence, setNomAgence] = useState("");
  const [enregistrementAgence, setEnregistrementAgence] = useState(false);
  const [erreurAgence, setErreurAgence] = useState("");

  const [form, setForm] = useState({
    titre: "", type_bien: "maison", ville: "Bukavu", quartier: "", commune: "Ibanda",
    prix: "", devise: "USD", nb_chambres: "", nb_salles_bain: "", description: "", telephone: "",
  });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [analyseEnCours, setAnalyseEnCours] = useState(false);

  useEffect(() => {
    async function verifier() {
      const { data: { session } } = await supabase.auth.getSession();
      setConnecte(!!session);
      if (session) {
        const { data: { user } } = await supabase.auth.getUser();
        const role = user?.app_metadata?.role || user?.user_metadata?.role;
        const admin = role === "admin";
        setEstAdmin(admin);

        if (!admin) {
          const res = await fetch(`${API_URL}/api/commissionnaires/mon-profil`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          if (res.ok) setProfilAgence(await res.json());
        }
      }
      setChargement(false);
    }
    verifier();
  }, []);

  const creerAgence = async (e) => {
    e.preventDefault();
    setErreurAgence("");
    if (!nomAgence.trim()) return;
    setEnregistrementAgence(true);

    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${API_URL}/api/commissionnaires/mon-profil`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ nom_agence: nomAgence.trim() }),
    });

    if (res.ok) {
      setProfilAgence(await res.json());
    } else {
      const data = await res.json().catch(() => ({}));
      setErreurAgence(data.error || "Erreur lors de l'enregistrement");
    }
    setEnregistrementAgence(false);
  };

  const MAX_PHOTOS = 3;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhotos = async (e) => {
    let fichiers = Array.from(e.target.files);
    setErreur("");

    if (fichiers.length > MAX_PHOTOS) {
      setErreur(`Vous pouvez ajouter au maximum ${MAX_PHOTOS} photos.`);
      fichiers = fichiers.slice(0, MAX_PHOTOS);
    }

    // Contrôle de netteté — appliqué uniquement pour les commissionnaires (pas pour l'admin)
    if (!estAdmin) {
      setAnalyseEnCours(true);
      const fichiersNets = [];
      const rejetes = [];

      for (const fichier of fichiers) {
        const { nette } = await analyserNettete(fichier);
        if (nette) fichiersNets.push(fichier);
        else rejetes.push(fichier.name);
      }

      setAnalyseEnCours(false);
      setPhotos(fichiersNets);

      if (rejetes.length > 0) {
        setErreur(
          `${rejetes.length} photo(s) semble(nt) floue(s) et ont été refusée(s) : ${rejetes.join(", ")}. Reprenez-les avec une meilleure mise au point.`
        );
      }
    } else {
      setPhotos(fichiers);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/inscription?redirect=/location/publier"); setLoading(false); return; }

    try {
      // 1. Créer la maison (conversion des champs numériques, comme pour les produits)
      const res = await fetch(`${API_URL}/api/maisons`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          ...form,
          prix: Number(form.prix),
          nb_chambres: form.nb_chambres ? Number(form.nb_chambres) : null,
          nb_salles_bain: form.nb_salles_bain ? Number(form.nb_salles_bain) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErreur(data.error || "Erreur lors de la publication");
        setLoading(false);
        return;
      }

      const nouvelleMaison = await res.json();

      // 2. Uploader les photos sélectionnées, une par une
      for (let i = 0; i < photos.length; i++) {
        try {
          const formData = new FormData();
          formData.append("photo", photos[i]);
          formData.append("maisonId", nouvelleMaison.id);

          const resUpload = await fetch(`${API_URL}/api/upload/photo-maison`, {
            method: "POST",
            headers: { Authorization: `Bearer ${session.access_token}` },
            body: formData,
          });

          if (resUpload.ok) {
            const { url } = await resUpload.json();
            await fetch(`${API_URL}/api/maisons/${nouvelleMaison.id}/photos`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
              body: JSON.stringify({ url, ordre: i }),
            });
          }
        } catch {
          // On continue même si une photo échoue, la maison est déjà créée
        }
      }

      setLoading(false);
      navigate("/location/mes-maisons");
    } catch (err) {
      setErreur("Connexion instable — la publication n'a pas pu aboutir. Réessayez.");
      setLoading(false);
    }
  };

  if (chargement) return <p className="text-center text-sm text-gray-400 py-10">Chargement...</p>;

  // --- Vue pour les visiteurs non connectés : création de compte requise ---
  if (!connecte) {
    return (
      <div className="p-3">
        <div className="bg-white rounded-xl p-5 text-center">
          <p className="text-3xl mb-3">🏠</p>
          <p className="text-sm font-bold text-[#1B1B1B] mb-2">Publiez votre maison sur TonaBk</p>
          <p className="text-sm text-gray-500 mb-4">
            Créez un compte gratuitement pour publier vos annonces de location. Une fois connecté, vous
            pourrez publier autant de maisons que vous voulez et les gérer depuis votre propre espace.
          </p>
          <Link
            to="/inscription?redirect=/location/publier"
            className="w-full block text-center text-sm font-semibold text-white rounded-lg py-3 bg-[#F5720C] mb-2"
          >
            Créer un compte
          </Link>
          <Link
            to="/connexion?redirect=/location/publier"
            className="w-full block text-center text-sm font-semibold text-[#1B1B1B] rounded-lg py-3 bg-gray-100"
          >
            J'ai déjà un compte
          </Link>
        </div>
      </div>
    );
  }

  // --- Vue commissionnaire sans profil d'agence : le créer avant de publier ---
  if (!estAdmin && !profilAgence) {
    return (
      <div className="p-3">
        <div className="bg-white rounded-xl p-5">
          <p className="text-sm font-bold text-[#1B1B1B] mb-1">Nom de votre agence</p>
          <p className="text-[12.5px] text-gray-500 mb-4">
            Ce nom apparaîtra sur toutes vos annonces, pour que les visiteurs sachent qui les publie.
            Vous ne le renseignez qu'une seule fois.
          </p>
          <form onSubmit={creerAgence} className="space-y-2">
            {erreurAgence && <p className="text-xs text-red-500">{erreurAgence}</p>}
            <input
              value={nomAgence}
              onChange={(e) => setNomAgence(e.target.value)}
              placeholder="Ex : Agence Immo Kivu"
              required
              className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full"
            />
            <button
              type="submit"
              disabled={enregistrementAgence}
              className="w-full bg-[#F5720C] text-white text-sm font-semibold rounded-md py-2.5"
            >
              {enregistrementAgence ? "Enregistrement..." : "Continuer"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- Vue connectée : formulaire de publication avec photos ---
  return (
    <form onSubmit={handleSubmit} className="p-3 space-y-2">
      {erreur && <p className="text-xs text-red-500">{erreur}</p>}
      <input name="titre" placeholder="Titre" onChange={handleChange} required className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full" />
      <select name="type_bien" onChange={handleChange} className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full">
        <option value="maison">Maison</option>
        <option value="appartement">Appartement</option>
        <option value="studio">Studio</option>
        <option value="chambre">Chambre</option>
        <option value="terrain">Terrain</option>
        <option value="commerce">Commerce</option>
      </select>

      <div>
        <label className="text-[11px] text-gray-500 mb-1 block">Ville</label>
        <div className="flex gap-2">
          {["Bukavu", "Goma"].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setForm({ ...form, ville: v })}
              className={`flex-1 text-sm font-semibold rounded-md py-2 border ${
                form.ville === v ? "bg-[#F5720C] text-white border-[#F5720C]" : "bg-white text-gray-600 border-gray-200"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <input name="quartier" placeholder="Quartier" onChange={handleChange} required className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full" />
      <input name="commune" defaultValue="Ibanda" onChange={handleChange} placeholder="Commune" className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full" />

      <div className="flex gap-2">
        <input name="prix" type="number" placeholder="Prix" onChange={handleChange} required className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full flex-1" />
        <select name="devise" onChange={handleChange} className="border border-gray-200 rounded-md px-3 py-2 text-sm w-24">
          <option value="USD">USD</option>
          <option value="CDF">CDF</option>
        </select>
      </div>

      <div className="flex gap-2">
        <input name="nb_chambres" type="number" placeholder="Nb chambres" onChange={handleChange} className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full" />
        <input name="nb_salles_bain" type="number" placeholder="Nb salles de bain" onChange={handleChange} className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full" />
      </div>

      <input name="telephone" placeholder="Téléphone" onChange={handleChange} required className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full" />
      <textarea name="description" placeholder="Description" onChange={handleChange} rows={3} className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full" />

      <div>
        <p className="text-xs font-semibold text-gray-500 mb-1">Photos (3 maximum)</p>
        <div className="bg-[#FFF8F2] border border-[#FFD3AC] rounded-md p-2.5 mb-2">
          <p className="text-[11px] text-gray-600 leading-relaxed">
            Publiez uniquement des photos nettes et de bonne qualité. Les photos floues sont
            automatiquement détectées et refusées, et une annonce avec de mauvaises photos ne sera
            pas mise en avant.
          </p>
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={analyseEnCours}
          onChange={handlePhotos}
          className="text-xs w-full"
        />
        {analyseEnCours && (
          <p className="text-[11px] text-[#F5720C] mt-1">Analyse de la netteté des photos...</p>
        )}
        {!analyseEnCours && photos.length > 0 && (
          <p className="text-[11px] text-gray-400 mt-1">{photos.length} photo(s) sélectionnée(s) et validée(s)</p>
        )}
      </div>

      <button type="submit" disabled={loading || analyseEnCours} className="w-full bg-[#F5720C] text-white text-sm font-semibold rounded-md py-2.5">
        {loading ? "Publication..." : "Publier"}
      </button>
    </form>
  );
                      }
    
