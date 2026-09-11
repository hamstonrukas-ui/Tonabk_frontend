import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import "./index.css";

// Enregistre le Service Worker : met l'app à jour automatiquement en arrière-plan
// dès qu'une connexion est disponible, sans jamais bloquer l'utilisateur.
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Une nouvelle version est prête — on l'applique tout de suite pour éviter
    // qu'un appareil reste bloqué sur une ancienne version incompatible (page blanche).
    updateSW(true);
  },
  onOfflineReady() {
    console.log("TonaBk est prêt à fonctionner hors ligne.");
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
