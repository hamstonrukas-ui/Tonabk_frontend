import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import "./index.css";

// Enregistre le Service Worker : met l'app à jour automatiquement en arrière-plan
// dès qu'une connexion est disponible, sans jamais bloquer l'utilisateur.
registerSW({
  immediate: true,
  onNeedRefresh() {
    // Une nouvelle version est prête — appliquée au prochain chargement, en silence
    console.log("Nouvelle version de TonaBk disponible, sera appliquée au prochain lancement.");
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
