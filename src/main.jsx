import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import "./index.css";
import { obtenirMarque } from "./lib/marque";

// Enregistre le Service Worker : met l'app à jour automatiquement en arrière-plan
// dès qu'une connexion est disponible, sans jamais bloquer l'utilisateur.
const updateSW = registerSW({
  immediate: true,
  onRegisteredSW(_urlSW, registration) {
    if (!registration) return;
    // Le navigateur ne cherche une nouvelle version qu'à l'ouverture « à froid » de l'app (et au plus 1 fois/jour).
    // Une app installée qui reste en arrière-plan puis revient ne vérifie rien : on force donc la vérification
    // au retour dans l'app, quand la connexion revient, et toutes les 30 minutes si l'app reste ouverte.
    let dernierControle = 0;
    const verifier = () => {
      if (!navigator.onLine) return;
      const maintenant = Date.now();
      if (maintenant - dernierControle < 60 * 1000) return; // pas plus d'une fois par minute
      dernierControle = maintenant;
      registration.update().catch(() => {});
    };
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") verifier();
    });
    window.addEventListener("online", verifier);
    setInterval(verifier, 30 * 60 * 1000);
  },
  onNeedRefresh() {
    // Une nouvelle version est prête — on l'applique tout de suite pour éviter
    // qu'un appareil reste bloqué sur une ancienne version incompatible (page blanche).
    updateSW(true);
  },
  onOfflineReady() {
    console.log(`${obtenirMarque().nom} est prêt à fonctionner hors ligne.`);
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
