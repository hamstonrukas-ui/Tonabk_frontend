import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";

export function useFavoris() {
  const [favoris, setFavoris] = useState([]);

  useEffect(() => {
    async function charger() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/favoris", { headers: { Authorization: `Bearer ${session.access_token}` } });
      if (res.ok) {
        const data = await res.json();
        setFavoris(data.map((f) => f.maison_id));
      }
    }
    charger();
  }, []);

  const toggleFavori = useCallback(async (maisonId) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return alert("Connectez-vous pour ajouter aux favoris");

    const estFavori = favoris.includes(maisonId);
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` };

    if (estFavori) {
      await fetch(`/api/favoris/${maisonId}`, { method: "DELETE", headers });
      setFavoris((f) => f.filter((id) => id !== maisonId));
    } else {
      await fetch("/api/favoris", { method: "POST", headers, body: JSON.stringify({ maison_id: maisonId }) });
      setFavoris((f) => [...f, maisonId]);
    }
  }, [favoris]);

  return { favoris, toggleFavori };
}
