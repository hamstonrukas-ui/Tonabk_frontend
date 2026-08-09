import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { API_URL } from "../../lib/api";

export default function PublierRequete() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [description, setDescription] = useState("");
  const [categorieId, setCategorieId] = useState("");
  const [telephone, setTelephone] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`).then((r) => r.json()).then(setCategories).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("Connectez-vous d'abord pour publier une requête");
      setLoading(false);
      return navigate("/connexion");
    }

    const res = await fetch(`${API_URL}/api/requetes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({
        description,
        categorie_id: categorieId || null,
        telephone,
        budget_estime: budget ? Number(budget) : null,
      }),
    });

    setLoading(false);
    if (res.ok) {
      alert("Requête publiée ! Notre équipe s'en occupe.");
      navigate("/requete");
    } else {
      alert("Erreur lors de la publication");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 space-y-2">
      <p className="text-sm font-semibold text-[#1B1B1B] mb-1">Décrivez ce que vous cherchez</p>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Ex: Je cherche un frigo d'occasion en bon état"
        rows={4}
        required
        className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full resize-none"
      />

      <select value={categorieId} onChange={(e) => setCategorieId(e.target.value)} className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full">
        <option value="">Catégorie (optionnel)</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.nom}</option>
        ))}
      </select>

      <input
        type="number"
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
        placeholder="Budget estimé (optionnel)"
        className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full"
      />

      <input
        type="tel"
        value={telephone}
        onChange={(e) => setTelephone(e.target.value)}
        placeholder="Votre numéro (visible par l'équipe uniquement)"
        required
        className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full"
      />

      <p className="text-[11px] text-gray-400">
        Votre numéro ne sera jamais visible publiquement — seule notre équipe pourra vous recontacter.
      </p>

      <button type="submit" disabled={loading} className="w-full bg-[#F5720C] text-white text-sm font-semibold rounded-md py-2.5">
        {loading ? "Publication..." : "Publier ma requête"}
      </button>
    </form>
  );
}
