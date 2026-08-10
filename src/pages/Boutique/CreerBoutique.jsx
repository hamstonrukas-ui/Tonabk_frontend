import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { API_URL } from "../../lib/api";

export default function CreerBoutique() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ nom: "", categorie_id: "", description: "", telephone: "", quartier: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`).then((r) => r.json()).then(setCategories).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("Connectez-vous d'abord pour créer une boutique");
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
      alert("Boutique créée ! Elle sera visible après validation par l'équipe.");
      navigate("/boutique");
    } else {
      alert("Erreur lors de la création");
    }
  };

  return (
    <div className="p-3">
      <p className="text-sm font-bold text-[#1B1B1B] mb-3">Créer ma boutique</p>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 space-y-2.5">
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
          Vous pourrez ajouter jusqu'à 30 photos gratuitement une fois votre boutique validée.
        </p>
        <button type="submit" disabled={loading} className="w-full bg-[#F5720C] text-white text-sm font-semibold rounded-md py-2.5">
          {loading ? "Création..." : "Créer ma boutique"}
        </button>
      </form>
    </div>
  );
}
