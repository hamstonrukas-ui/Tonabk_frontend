import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { API_URL } from "../../lib/api";

const fmt = (n, devise = "USD") => n.toLocaleString("fr-FR") + " " + devise;
const VILLES = ["Toutes", "Bukavu", "Goma"];

export default function RechercheBoutique() {
  const [terme, setTerme] = useState("");
  const [ville, setVille] = useState("Toutes");
  const [produits, setProduits] = useState([]);
  const [resultats, setResultats] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/produits`).then((r) => r.json()).then(setProduits);
  }, []);

  useEffect(() => {
    let filtres = produits;

    if (ville !== "Toutes") {
      filtres = filtres.filter((p) => p.boutiques?.ville === ville);
    }

    if (terme.trim()) {
      filtres = filtres.filter(
        (p) =>
          p.nom.toLowerCase().includes(terme.toLowerCase()) ||
          p.boutiques?.nom?.toLowerCase().includes(terme.toLowerCase())
      );
    }

    setResultats(terme.trim() || ville !== "Toutes" ? filtres : []);
  }, [terme, ville, produits]);

  return (
    <div className="p-3">
      <div className="bg-white rounded-lg flex items-center gap-2 px-3 py-2.5 mb-2.5">
        <Search size={16} className="text-gray-400" />
        <input
          value={terme}
          onChange={(e) => setTerme(e.target.value)}
          placeholder="Produit, boutique..."
          autoFocus
          className="flex-1 text-sm outline-none"
        />
      </div>

      <div className="flex gap-2 mb-3">
        {VILLES.map((v) => (
          <button
            key={v}
            onClick={() => setVille(v)}
            className={`flex-1 text-xs font-semibold rounded-lg py-2 ${
              ville === v ? "bg-[#F5720C] text-white" : "bg-white text-gray-500"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {resultats.map((p) => (
          <Link
            key={p.id}
            to={`/boutique/produit/${p.id}`}
            state={{ depuisAccueil: true }}
            className="bg-white rounded-xl overflow-hidden shadow-sm"
          >
            <div className="bg-[#F6F6F6] h-24 flex items-center justify-center text-3xl">
              {p.photo_url ? <img src={p.photo_thumb_url || p.photo_url} className="w-full h-full object-cover" /> : "📦"}
            </div>
            <div className="p-2.5">
              <p className="text-[11.5px] font-medium leading-tight h-8 overflow-hidden">{p.nom}</p>
              <p className="text-sm font-extrabold mt-1">{fmt(p.prix, p.devise)}</p>
            </div>
          </Link>
        ))}
      </div>

      {(terme.trim() || ville !== "Toutes") && resultats.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-8">
          Aucun résultat{terme.trim() ? ` pour "${terme}"` : ""}{ville !== "Toutes" ? ` à ${ville}` : ""}
        </p>
      )}
    </div>
  );
}
