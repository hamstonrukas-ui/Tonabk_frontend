// Middleware Vercel Edge : choisit le titre et la description selon le
// domaine visité, à chaque requête. Remplace le besoin de deux projets
// Vercel séparés avec des variables d'environnement différentes.

export const config = {
  // S'applique à toutes les pages HTML, mais pas aux fichiers statiques
  // (images, JS, CSS, manifest, icônes).
  matcher: ["/((?!assets|icons|favicon.ico|manifest.webmanifest|sw.js|workbox).*)"],
};

const MARQUES = {
  "tona2go.com": {
    nom: "Tona2go",
    description: "Marketplace, location de maisons et requêtes à Goma",
  },
  "www.tona2go.com": {
    nom: "Tona2go",
    description: "Marketplace, location de maisons et requêtes à Goma",
  },
};

const MARQUE_PAR_DEFAUT = {
  nom: "TonaBk",
  description: "Marketplace, location de maisons et requêtes à Bukavu",
};

export default async function middleware(request) {
  const url = new URL(request.url);
  const marque = MARQUES[url.hostname] || MARQUE_PAR_DEFAUT;

  const reponse = await fetch(new URL("/index.html", request.url));
  let html = await reponse.text();

  html = html
    .replace(/<title>[^<]*<\/title>/, `<title>${marque.nom}</title>`)
    .replace(
      /(<meta name="description" content=")[^"]*(")/,
      `$1${marque.description}$2`
    );

  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
