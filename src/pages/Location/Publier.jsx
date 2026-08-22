import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { API_URL } from "../../lib/api";

const NUMERO_EQUIPE = "243855841999";

export default function Publier() {
  const navigate = useNavigate();
  const [chargement, setChargement] = useState(true);
  const [estAdmin, setEstAdmin] = useState(false);

  const [form, setForm] = useState({
    titre: "", type_bien: "maison", quartier: "", commune: "Ibanda",
    prix: "", devise: "USD", nb_chambres: "", nb_salles_bain: "", description: "", telephone: "",
  });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    async function verifier() {
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.app_metadata?.role || user?.user_metadata?.role;
      setEstAdmin(role === "admin");
      setChargement(false);
    }
    verifier();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { alert("Connectez-vous d'abord"); setLoading(false); return; }

    // 1. Créer la maison
    const res = await fetch(`${API_URL}/api/maisons`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      setErreur("Erreur lors de la publication");
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
    navigate("/location");
  };

  const contacterEquipe = () => {
    const msg = "Bonjour, je suis commissionnaire immobilier et j'aimerais publier des annonces de location sur TonaBk.";
    window.open(`https://wa.me/${NUMERO_EQUIPE}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (chargement) return <p className="text-center text-sm text-gray-400 py-10">Chargement...</p>;

  // --- Vue pour tout le monde sauf l'admin ---
  if (!estAdmin) {
    return (
      <div className="p-3">
        <div className="bg-white rounded-xl p-5 text-center">
          <p className="text-3xl mb-3">🏠</p>
          <p className="text-sm font-bold text-[#1B1B1B] mb-2">Vous êtes commissionnaire immobilier ?</p>
          <p className="text-sm text-gray-500 mb-4">
            Pour l'instant, seule l'équipe TonaBk publie les annonces de location. Si vous souhaitez publier
            vos propres biens, contactez l'équipe pour devenir commissionnaire partenaire.
          </p>
          <button
            onClick={contacterEquipe}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-white rounded-lg py-3 bg-[#25D366]"
          >
            <MessageCircle size={18} /> Contacter l'équipe TonaBk
          </button>
        </div>
      </div>
    );
  }

  // --- Vue admin : formulaire de publication avec photos ---
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
      <input name="quartier" placeholder="Quartier" onChange={handleChange} required className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full" />
      <input name="prix" type="number" placeholder="Prix" onChange={handleChange} required className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full" />
      <input name="nb_chambres" type="number" placeholder="Nb chambres" onChange={handleChange} className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full" />
      <input name="telephone" placeholder="Téléphone" onChange={handleChange} required className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full" />
      <textarea name="description" placeholder="Description" onChange={handleChange} rows={3} className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full" />

      <div>
        <p className="text-xs font-semibold text-gray-500 mb-1">Photos (plusieurs possibles)</p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setPhotos(Array.from(e.target.files))}
          className="text-xs w-full"
        />
        {photos.length > 0 && (
          <p className="text-[11px] text-gray-400 mt-1">{photos.length} photo(s) sélectionnée(s)</p>
        )}
      </div>

      <button type="submit" disabled={loading} className="w-full bg-[#F5720C] text-white text-sm font-semibold rounded-md py-2.5">
        {loading ? "Publication..." : "Publier"}
      </button>
    </form>
  );
}
