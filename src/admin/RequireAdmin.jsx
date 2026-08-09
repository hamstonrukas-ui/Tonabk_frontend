import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function RequireAdmin({ children }) {
  const [autorise, setAutorise] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const role = data.user?.app_metadata?.role || data.user?.user_metadata?.role;
      setAutorise(role === "admin");
    });
  }, []);

  if (autorise === null) return <p className="text-center text-sm text-gray-400 py-10">Chargement...</p>;
  if (!autorise) return <p className="text-center text-sm text-red-500 py-10">Accès refusé</p>;
  return children;
}
