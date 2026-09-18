import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const nomMarque = env.VITE_MARQUE_NOM || "TonaBk";
  const descriptionMarque = env.VITE_MARQUE_VILLE
    ? `Marketplace, location de maisons et requêtes à ${env.VITE_MARQUE_VILLE}`
    : "Marketplace, location de maisons et requêtes au Kivu";

  return {
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt"],
      manifest: {
        name: nomMarque,
        short_name: nomMarque,
        description: descriptionMarque,
        theme_color: "#F5720C",
        background_color: "#F3F3F3",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        // App shell (JS/CSS/HTML) : mis en cache automatiquement par le plugin
        // Stratégie pour les appels réseau qu'on ne gère pas déjà nous-même (cachedFetch) :
        runtimeCaching: [
          {
            // Photos hébergées sur Cloudflare R2 — mise en cache longue durée
            urlPattern: ({ url }) => url.hostname.includes("r2.dev") || url.hostname.includes("r2.cloudflarestorage.com"),
            handler: "CacheFirst",
            options: {
              cacheName: "tonabk-photos",
              expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
          {
            // Appels API backend : réseau en priorité, cache en secours si hors ligne
            urlPattern: ({ url }) => url.pathname.startsWith("/api"),
            handler: "NetworkFirst",
            options: {
              cacheName: "tonabk-api",
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
  };
});
      
