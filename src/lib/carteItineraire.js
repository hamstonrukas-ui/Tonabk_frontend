// Calculs de la carte d'itinéraire (sans bibliothèque externe) : positions réelles -> coordonnées de dessin.

// Projette des points {lat, lng} dans un rectangle largeur x hauteur, en gardant les bonnes proportions.
export function projeter(points, largeur = 360, hauteur = 300, marge = 46) {
  const latMoy = points.reduce((s, p) => s + p.lat, 0) / points.length;
  const k = Math.cos((latMoy * Math.PI) / 180);
  const xs = points.map((p) => p.lng * k);
  const ys = points.map((p) => -p.lat);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const spanX = Math.max(maxX - minX, 1e-6), spanY = Math.max(maxY - minY, 1e-6);
  const echelle = Math.min((largeur - 2 * marge) / spanX, (hauteur - 2 * marge) / spanY);
  const dx = (largeur - spanX * echelle) / 2;
  const dy = (hauteur - spanY * echelle) / 2;
  return {
    k, echelle,
    pts: points.map((p, i) => ({ ...p, x: dx + (xs[i] - minX) * echelle, y: dy + (ys[i] - minY) * echelle })),
    versXY: (lat, lng) => ({ x: dx + (lng * k - minX) * echelle, y: dy + (-lat - minY) * echelle }),
  };
}

// Trace "M .. Q .. Q .." : chaque tronçon est légèrement courbé (sauf les très courts).
export function cheminCourbe(pts) {
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    if (len < 50) { d += ` L ${b.x.toFixed(1)} ${b.y.toFixed(1)}`; continue; }
    const sens = i % 2 ? 1 : -1;
    const cx = (a.x + b.x) / 2 - (dy / len) * len * 0.14 * sens;
    const cy = (a.y + b.y) / 2 + (dx / len) * len * 0.14 * sens;
    d += ` Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }
  return d;
}

// Pas de quadrillage agréable (en degrés) pour avoir environ 4 lignes
export function pasGrille(spanDegres) {
  const brut = spanDegres / 4;
  return [0.25, 0.5, 1, 2, 5, 10, 20].find((p) => p >= brut) || 20;
}
