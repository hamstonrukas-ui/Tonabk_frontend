export const API_URL = import.meta.env.VITE_API_URL || "";

// Adresse réelle du site en cours d'exécution (URL Vercel actuelle,
// ou le futur nom de domaine une fois configuré) — jamais en dur,
// pour que les liens partagés restent toujours corrects.
export const SITE_URL = typeof window !== "undefined" ? window.location.origin : "";
