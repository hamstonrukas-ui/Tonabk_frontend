export default function BandeauHorsLigne({ ageMs }) {
  const minutes = Math.max(1, Math.round(ageMs / 60000));
  return (
    <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-[11px] rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
      <span>⚠️</span>
      <span>Connexion instable — données affichées d'il y a {minutes} min, pas encore actualisées</span>
    </div>
  );
}
