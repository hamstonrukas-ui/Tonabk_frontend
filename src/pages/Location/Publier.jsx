import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { API_URL } from "../../lib/api";

export default function Publier() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    titre: "", type_bien: "maison", quartier: "", commune: "Ibanda",
    prix: "", devise: "USD", nb_chambres: "", nb_salles_bain: "", description: "", telephone: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("Connectez-vous d'abord pour publier une maison");
      setLoading(false);
      return navigate("/inscription?redirect=/location/publier");
    }

    const res = await fetch(`${API_URL}/api/maisons`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify(form),
    });

    setLoading(false);
    if (res.ok) navigate("/location");
    else alert("Erreur lors de la publication");
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 space-y-2">
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
      <button type="submit" disabled={loading} className="w-full bg-[#F5720C] text-white text-sm font-semibold rounded-md py-2.5">
        {loading ? "Publication..." : "Publier"}
      </button>
    </form>
  );
}
