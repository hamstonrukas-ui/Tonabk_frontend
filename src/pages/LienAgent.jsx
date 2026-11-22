// Adresse personnelle d'un agent : tonabk.com/<code>
// On note la visite puis on envoie la personne sur l'accueil normal.
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { retenirAgent, noterEvenement } from "../lib/agent";

export default function LienAgent() {
  const { code } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const c = String(code || "").toLowerCase();
    (async () => {
      if (/^[a-z0-9]{3,20}$/.test(c)) {
        retenirAgent(c);
        await Promise.race([noterEvenement("visite", c), new Promise((r) => setTimeout(r, 2500))]);
      }
      navigate("/", { replace: true });
    })();
  }, [code, navigate]);
  return <div style={{ padding: 40, textAlign: "center", color: "#888", fontFamily: "sans-serif" }}>Chargement…</div>;
}
