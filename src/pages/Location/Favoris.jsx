import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

const fmt = (n, devise) => n.toLocaleString("fr-FR") + " " + devise;

export default function Favoris() {
  const [favoris, setFavoris] = useState([]);

  useEffect(() => {
    async function charger() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/favoris", { headers: { Authorization: `Bearer ${session.access_token}` } });
      if (res.ok) setFavoris(await res.json());
    }
    charger();
  }, []);

  if (favoris.length === 0) {
    return <p className="text-center text-sm text-gray-400 py-10">Aucune maison en favoris</p>;
  }

  return (
    <div className="p-3 space-y-2">
      {favoris.map((f) => (
        <Link key={f.id} to={`/location/maison/${f.maisons.id}`} className="block bg-white rounded-lg p-3 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">{f.maisons.titre}</p>
            <p className="text-xs text-gray-400">{f.maisons.quartier}</p>
          </div>
          <p className="text-sm font-bold text-[#F5720C]">{fmt(f.maisons.prix, f.maisons.devise)}</p>
        </Link>
      ))}
    </div>
  );
}
