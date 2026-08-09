import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";

const fmt = (n, devise) => n.toLocaleString("fr-FR") + " " + devise;

export default function Recherche() {
  const [terme, setTerme] = useState("");
  const [typeBien, setTypeBien] = useState("");
  const [maisons, setMaisons] = useState([]);
  const [resultats, setResultats] = useState([]);

  useEffect(() => {
    fetch("/api/maisons").then((r) => r.json()).then(setMaisons);
  }, []);

  useEffect(() => {
    let filtres = maisons;
    if (terme.trim()) {
      filtres = filtres.filter(
        (m) => m.titre.toLowerCase().includes(terme.toLowerCase()) || m.quartier.toLowerCase().includes(terme.toLowerCase())
      );
    }
    if (typeBien) filtres = filtres.filter((m) => m.type_bien === typeBien);
    setResultats(filtres);
  }, [terme, typeBien, maisons]);

  return (
    <div className="p-3">
      <div className="bg-white rounded-lg flex items-center gap-2 px-3 py-2.5 mb-3">
        <Search size={16} className="text-gray-400" />
        <input
          value={terme}
          onChange={(e) => setTerme(e.target.value)}
          placeholder="Quartier, type de bien..."
          className="flex-1 text-sm outline-none"
        />
      </div>

      <select value={typeBien} onChange={(e) => setTypeBien(e.target.value)} className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full mb-3">
        <option value="">Tous les types</option>
        <option value="maison">Maison</option>
        <option value="appartement">Appartement</option>
        <option value="studio">Studio</option>
        <option value="chambre">Chambre</option>
        <option value="terrain">Terrain</option>
        <option value="commerce">Commerce</option>
      </select>

      <div className="space-y-2">
        {resultats.map((m) => (
          <Link key={m.id} to={`/location/maison/${m.id}`} className="block bg-white rounded-lg p-3 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">{m.titre}</p>
              <p className="text-xs text-gray-400">{m.quartier}</p>
            </div>
            <p className="text-sm font-bold text-[#F5720C]">{fmt(m.prix, m.devise)}</p>
          </Link>
        ))}
        {resultats.length === 0 && <p className="text-center text-sm text-gray-400 py-8">Aucun résultat</p>}
      </div>
    </div>
  );
}
