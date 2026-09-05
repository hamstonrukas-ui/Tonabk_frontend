import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { API_URL } from "../../lib/api";

export default function CreerBoutique() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ nom: "", categorie_id: "", description: "", telephone: "", quartier: "" });
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");

  const [verification, setVerification] = useState(true);
  const [connecte, setConnecte] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`).then((r) => r.json()).then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    async function verifier() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setConnecte(false);
        setVerification(false);
        return;
      }
      setConnecte(true);

      const res = await fetch(`${API_URL}/api/boutiques/mine`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const mesBoutiques = await res.json();
        if (mesBoutiques.length > 0) {
          navigate("/boutique/gerer");
          return;
        }
      }
      setVerification(false);
    }
    verifier();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return navigate("/inscription?redirect=/boutique/creer");
    }

    const res = await fetch(`${API_URL}/api/boutiques`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify(form),
    });

    setLoading(false);
    if (res.ok) {
      navigate("/boutique/gerer");
    } else {
      const data = await res.json();
      setErreur(data.error || "Erreur lors de la création");
    }
  };

  if (verification) {
    return <p className="text-center text-sm text-gray-400 py-10">Vérification...</p>;
  }

  if (!connecte) {
    return (
      <div className="p-3">
        <div className="bg-white rounded-xl p-5 text-center">
          <p className="text-3xl mb-3">🏪</p>
          <p className="text-sm font-bold text-[#1B1B1B] mb-2">
            Pour créer votre boutique, créez d'abord votre compte
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Ça prend une minute — vous pourrez ensuite remplir les informations de votre boutique.
          </p>
          <Link
            to="/inscription?redirect=/boutique/creer"
            className="block w-full bg-[#F5720C] text-white text-sm font-semibold py-3 rounded-lg mb-2"
          >
            Créer mon compte
          </Link>
          <Link
            to="/connexion?redirect=/boutique/creer"
            className="block w-full border border-gray-200 text-gray-600 text-sm font-semibold py-3 rounded-lg"
          >
            Vous avez déjà une boutique ? Connectez-vous
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
      <p className="text-sm font-bold text-[#1B1B1B] mb-3">Créer ma boutique</p>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 space-y-2.5">
        {erreur && <p className="text-xs text-red-500">{erreur}</p>}
        <input
          name="nom" placeholder="Nom de la boutique" onChange={handleChange} required
          className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full"
        />
        <select name="categorie_id" onChange={handleChange} required className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full">
          <option value="">Catégorie</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.icone} {c.nom}</option>)}
        </select>
        <input
          name="quartier" placeholder="Quartier" onChange={handleChange}
          className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full"
        />
        <input
          name="telephone" type="tel" placeholder="Numéro WhatsApp" onChange={handleChange} required
          className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full"
        />
        <textarea
          name="description" placeholder="Décrivez votre boutique" onChange={handleChange} rows={3}
          className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full resize-none"
        />
        <p className="text-[11px] text-gray-400">
          Vous pourrez ajouter jusqu'à 30 photos gratuitement. Un seul compte ne peut créer qu'une boutique.
        </p>
        <button type="submit" disabled={loading} className="w-full bg-[#F5720C] text-white text-sm font-semibold rounded-md py-2.5">
          {loading ? "Création..." : "Créer ma boutique"}
        </button>
      </form>
    </div>
  );
        }
        
