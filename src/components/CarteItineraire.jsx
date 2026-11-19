// Carte schématique d'un trajet : les villes sont placées à leur vraie position, reliées par la ligne du voyage.
// Un point orange se déplace du départ jusqu'à l'arrivée pour montrer le sens du colis.
import { projeter, cheminCourbe, pasGrille } from "../lib/carteItineraire";
import { roleDuPoint } from "../lib/expeditions";

const L = 360, H = 300;
const COULEUR = { Départ: "#2E9E5B", Escale: "#F5720C", Arrivée: "#C62828" };

export default function CarteItineraire({ points }) {
  const { pts, versXY } = projeter(points, L, H);
  const d = cheminCourbe(pts);

  // Quadrillage de repère (latitudes / longitudes rondes)
  const proches = points.filter((p) => !p.lointain);
  const lats = proches.map((p) => p.lat), lngs = proches.map((p) => p.lng);
  const pas = pasGrille(Math.max(Math.max(...lats) - Math.min(...lats), Math.max(...lngs) - Math.min(...lngs)));
  const lignes = [];
  for (let la = Math.ceil((Math.min(...lats) - pas) / pas) * pas; la <= Math.max(...lats) + pas; la += pas) {
    const { y } = versXY(la, lngs[0]);
    if (y > 4 && y < H - 4) lignes.push(<line key={`la${la}`} x1="0" x2={L} y1={y} y2={y} />);
  }
  for (let lo = Math.ceil((Math.min(...lngs) - pas) / pas) * pas; lo <= Math.max(...lngs) + pas; lo += pas) {
    const { x } = versXY(lats[0], lo);
    if (x > 4 && x < L - 4) lignes.push(<line key={`lo${lo}`} y1="0" y2={H} x1={x} x2={x} />);
  }

  return (
    <svg viewBox={`0 0 ${L} ${H}`} className="w-full rounded-2xl bg-[#EAF1EC] border border-gray-200" role="img"
      aria-label={`Itinéraire : ${points.map((p) => p.nom).join(", ")}`}>
      <g stroke="#CFDCD3" strokeWidth="1" strokeDasharray="2 4">{lignes}</g>

      <path d={d} fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke="#F5720C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="7 6" />

      {pts.map((p, i) => {
        const role = roleDuPoint(points, i);
        const ancre = p.x < 78 ? "start" : p.x > L - 78 ? "end" : "middle";
        const dessus = i % 2 === 0;
        const ty = dessus ? p.y - 16 : p.y + 25;
        const tx = ancre === "start" ? p.x - 6 : ancre === "end" ? p.x + 6 : p.x;
        return (
          <g key={`${p.nom}${i}`}>
            <circle cx={p.x} cy={p.y} r={role === "Escale" ? 7 : 9} fill="#fff" />
            <circle cx={p.x} cy={p.y} r={role === "Escale" ? 4.5 : 6.5} fill={COULEUR[role] || "#F5720C"} />
            <text x={tx} y={ty} textAnchor={ancre} fontSize="12" fontWeight="700" fill="#1B1B1B"
              stroke="#EAF1EC" strokeWidth="3.5" paintOrder="stroke">{p.nom}</text>
            <text x={tx} y={ty + 11} textAnchor={ancre} fontSize="9" fill="#555"
              stroke="#EAF1EC" strokeWidth="3" paintOrder="stroke">{p.pays}</text>
          </g>
        );
      })}

      <circle r="5.5" fill="#F5720C" stroke="#fff" strokeWidth="2">
        <animateMotion dur="7s" repeatCount="indefinite" path={d} />
      </circle>
    </svg>
  );
}
