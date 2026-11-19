// Calculs de la carte d'itinéraire (sans bibliothèque externe) : positions réelles -> coordonnées de dessin.

// Projette des points {lat, lng} dans un rectangle largeur x hauteur, en gardant les bonnes proportions.
// Un point marqué `lointain: true` (ex. la Chine) est placé au bord de la carte, dans sa vraie direction,
// pour ne pas écraser les autres villes.
export function projeter(points, largeur = 360, hauteur = 300, marge = 46) {
  const lointains = points.filter((p) => p.lointain);
  const proches = points.filter((p) => !p.lointain);
  const latMoy = proches.reduce((s, p) => s + p.lat, 0) / proches.length;
  const k = Math.cos((latMoy * Math.PI) / 180);
  const X = (p) => p.lng * k, Y = (p) => -p.lat;

  // Place réservée aux points lointains (côté de leur direction)
  let rg = 0, rd = 0, rh = 0, rb = 0;
  if (lointains.length) {
    const cx = proches.reduce((s, p) => s + X(p), 0) / proches.length;
    const cy = proches.reduce((s, p) => s + Y(p), 0) / proches.length;
    for (const f of lointains) {
      const vx = X(f) - cx, vy = Y(f) - cy;
      if (Math.abs(vx) > 0.2 * Math.abs(vy)) { if (vx > 0) rd = 95; else rg = 95; }
      if (Math.abs(vy) > 0.2 * Math.abs(vx)) { if (vy < 0) rh = 60; else rb = 60; }
    }
  }
  const zoneL = largeur - rg - rd, zoneH = hauteur - rh - rb;
  const xs = proches.map(X), ys = proches.map(Y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const spanX = Math.max(maxX - minX, 1e-6), spanY = Math.max(maxY - minY, 1e-6);
  const echelle = Math.min((zoneL - 2 * marge) / spanX, (zoneH - 2 * marge) / spanY);
  const dx = rg + (zoneL - spanX * echelle) / 2;
  const dy = rh + (zoneH - spanY * echelle) / 2;
  const versXY = (lat, lng) => ({ x: dx + (lng * k - minX) * echelle, y: dy + (-lat - minY) * echelle });

  const pts = points.map((p) => {
    if (!p.lointain) return { ...p, ...versXY(p.lat, p.lng) };
    // point lointain : on part du point proche le plus voisin, dans la vraie direction, jusqu'au bord
    let n = proches[0], best = Infinity;
    for (const q of proches) { const d = Math.hypot(X(p) - X(q), Y(p) - Y(q)); if (d < best) { best = d; n = q; } }
    const o = versXY(n.lat, n.lng);
    const vx = X(p) - X(n), vy = Y(p) - Y(n), l = Math.hypot(vx, vy) || 1;
    const ux = vx / l, uy = vy / l;
    const lim = (pos, u, max, min) => (u > 0 ? (max - pos) / u : u < 0 ? (min - pos) / u : Infinity);
    const t = Math.min(lim(o.x, ux, largeur - 34, 34), lim(o.y, uy, hauteur - 26, 30), 170);
    return { ...p, x: o.x + ux * t, y: o.y + uy * t };
  });
  return { k, echelle, pts, versXY };
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
