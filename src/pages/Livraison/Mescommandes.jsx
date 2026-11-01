import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { API_URL } from "../../lib/api";

const fmt = (n, devise = "USD") => Number(n).toLocaleString("fr-FR") + " " + devise;
const ETAPES = [
  { cle: "brouillon", label: "Discussion avec le service client" },
  { cle: "en_attente", label: "Livraison lancée" },
  { cle: "acceptee", label: "Livreur assigné" },
  { cle: "en_route", label: "En route vers vous" },
  { cle: "livree", label: "Livrée" },
];

function Carte({ lat, lng }) {
  const d = 0.006;
  return (
    <iframe
      title="Position du livreur"
      width="100%" height="200" style={{ border: 0, borderRadius: 12 }}
      src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - d}%2C${lat - d}%2C${lng + d}%2C${lat + d}&marker=${lat}%2C${lng}`}
    />
  );
}

function Demarrer({ id, onFait }) {
  const [ouvert, setOuvert] = useState(false);
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");

  const lancer = async (e) => {
    e.preventDefault();
    setErreur("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/livraisons/${id}/demarrer`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_nom: nom, client_telephone: telephone, client_adresse: adresse }),
      });
      const data = await res.json();
      if (!res.ok) { setErreur(data.error || "Échec"); setLoading(false); return; }
      onFait();
    } catch {
      setErreur("Impossible de contacter le serveur");
    }
    setLoading(false);
  };

  if (!ouvert) {
    return (
      <div className="mt-3">
        <p className="text-[11px] text-gray-500 mb-2">
          Quand vous êtes d'accord avec le service client sur WhatsApp, appuyez sur Démarrer.
        </p>
        <button onClick={() => setOuvert(true)} className="w-full bg-[#F5720C] text-white text-sm font-extrabold rounded-lg py-3">
          Démarrer la livraison
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={lancer} className="mt-3 space-y-2.5">
      {erreur && <p className="text-xs text-red-500">{erreur}</p>}
      <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Votre nom" required
        className="border border-gray-200 rounded-md px-3 py-2.5 text-sm w-full" />
      <input type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="Numéro WhatsApp / téléphone" required
        className="border border-gray-200 rounded-md px-3 py-2.5 text-sm w-full" />
      <textarea value={adresse} onChange={(e) => setAdresse(e.target.value)} rows={3} required
        placeholder="Adresse de livraison (commune, quartier, avenue, repère connu...)"
        className="border border-gray-200 rounded-md px-3 py-2.5 text-sm w-full" />
      <button type="submit" disabled={loading} className="w-full bg-[#F5720C] text-white text-sm font-extrabold rounded-lg py-3">
        {loading ? "Lancement..." : "Lancer la livraison"}
      </button>
    </form>
  );
}

function Commande({ c, recharger }) {
  const index = ETAPES.findIndex((e) => e.cle === c.statut);
  const annulee = c.statut === "annulee";
  const aPosition = c.lat_livreur != null && c.lng_livreur != null && (c.statut === "en_route" || c.statut === "acceptee");

  return (
    <div className="bg-white rounded-xl p-4 mb-3">
      <p className="text-sm font-extrabold text-[#1B1B1B]">{c.nom_produit}</p>
      <p className="text-xs text-[#F5720C] font-bold">{fmt(c.prix, c.devise)} · paiement à la livraison</p>
      {c.client_adresse && <p className="text-[11px] text-gray-400 mb-3">📍 {c.client_adresse}</p>}

      {annulee ? (
        <p className="text-xs font-bold text-red-600">Commande annulée</p>
      ) : (
        <div className="space-y-2.5">
          {ETAPES.map((e, i) => {
            const fait = i <= index;
            return (
              <div key={e.cle} className="flex items-center gap-2.5">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${fait ? "bg-[#F5720C]" : "bg-gray-200"}`}>
                  {fait && <Check size={12} className="text-white" />}
                </span>
                <span className={`text-xs ${fait ? "font-bold text-[#1B1B1B]" : "text-gray-400"}`}>{e.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {c.statut === "brouillon" && <Demarrer id={c.id} onFait={recharger} />}

      {c.livreur_nom && c.statut !== "livree" && !annulee && (
        <p className="text-[11px] text-gray-500 mt-3">Livreur : <strong>{c.livreur_nom}</strong></p>
      )}

      {aPosition && (
        <div className="mt-3">
          <Carte lat={c.lat_livreur} lng={c.lng_livreur} />
          <p className="text-[10px] text-gray-400 mt-1">
            Position du livreur mise à jour à {new Date(c.derniere_position_le).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      )}
      {c.statut === "en_route" && !aPosition && (
        <p className="text-[11px] text-gray-400 mt-3">Le livreur est en route, sa position apparaîtra ici dès qu'elle est disponible.</p>
      )}
    </div>
  );
}

export default function MesCommandes() {
  const [commandes, setCommandes] = useState(null);

  async function charger() {
    let ids = [];
    try { ids = JSON.parse(localStorage.getItem("tonabk_commandes") || "[]"); } catch {}
    const resultats = await Promise.all(
      ids.map((id) => fetch(`${API_URL}/api/livraisons/${id}`).then((r) => (r.ok ? r.json() : null)).catch(() => null))
    );
    setCommandes(resultats.filter(Boolean));
  }

  useEffect(() => {
    charger();
    const timer = setInterval(charger, 8000); // rafraîchit le suivi toutes les 8 secondes
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-3">
      <div className="flex items-center gap-3 mb-4">
        <Link to="/"><ArrowLeft size={18} /></Link>
        <h1 className="text-base font-extrabold text-[#1B1B1B]">Mes commandes</h1>
      </div>

      {commandes === null && <p className="text-center text-sm text-gray-400 py-10">Chargement...</p>}
      {commandes && commandes.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-10">
          Aucune commande pour l'instant. Utilisez « Livre-moi à la maison » sur un produit pour en démarrer une.
        </p>
      )}
      {commandes && commandes.map((c) => <Commande key={c.id} c={c} recharger={charger} />)}
    </div>
  );
}
