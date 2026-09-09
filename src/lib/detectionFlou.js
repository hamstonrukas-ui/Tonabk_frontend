// Détection de photos floues côté navigateur (variance du Laplacien), 100% gratuit, sans dépendance externe.
// Plus le score est bas, plus l'image est floue. Seuil ajustable ci-dessous selon les retours terrain.

const SEUIL_NETTETE = 60;
const TAILLE_ANALYSE = 400; // on réduit l'image avant analyse, pour que ce soit rapide sur téléphone d'entrée de gamme

function chargerImage(fichier) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(fichier);
  });
}

function calculerScoreNettete(img) {
  const ratio = img.width > img.height ? TAILLE_ANALYSE / img.width : TAILLE_ANALYSE / img.height;
  const largeur = Math.max(1, Math.round(img.width * ratio));
  const hauteur = Math.max(1, Math.round(img.height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = largeur;
  canvas.height = hauteur;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, largeur, hauteur);

  const { data } = ctx.getImageData(0, 0, largeur, hauteur);

  // Conversion en niveaux de gris
  const gris = new Float32Array(largeur * hauteur);
  for (let i = 0; i < largeur * hauteur; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    gris[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  // Filtre Laplacien (détection de contours) puis variance des résultats
  let somme = 0;
  let sommeCarres = 0;
  let n = 0;

  for (let y = 1; y < hauteur - 1; y++) {
    for (let x = 1; x < largeur - 1; x++) {
      const idx = y * largeur + x;
      const laplacien =
        gris[idx - largeur] + gris[idx + largeur] + gris[idx - 1] + gris[idx + 1] - 4 * gris[idx];
      somme += laplacien;
      sommeCarres += laplacien * laplacien;
      n++;
    }
  }

  const moyenne = somme / n;
  const variance = sommeCarres / n - moyenne * moyenne;
  return variance;
}

// Retourne { nette: boolean, score: number }
export async function analyserNettete(fichier) {
  try {
    const img = await chargerImage(fichier);
    const score = calculerScoreNettete(img);
    URL.revokeObjectURL(img.src);
    return { nette: score >= SEUIL_NETTETE, score };
  } catch {
    // En cas d'erreur d'analyse, on laisse passer la photo plutôt que de bloquer l'utilisateur à tort
    return { nette: true, score: null };
  }
}
