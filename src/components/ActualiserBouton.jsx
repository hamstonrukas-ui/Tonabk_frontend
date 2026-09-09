import { useState } from "react";
import { RotateCw } from "lucide-react";

export default function ActualiserBouton() {
  const [enCours, setEnCours] = useState(false);

  const actualiser = () => {
    if (enCours) return;
    window.dispatchEvent(new Event("tonabk:revalidate"));
    setEnCours(true);
    setTimeout(() => setEnCours(false), 900);
  };

  return (
    <button
      onClick={actualiser}
      aria-label="Actualiser"
      className="fixed right-4 bottom-24 z-40 w-12 h-12 rounded-full bg-[#F5720C] shadow-lg flex items-center justify-center"
    >
      <span className="absolute inset-0 rounded-full bg-[#F5720C] animate-ping opacity-40" />
      <RotateCw size={19} className={`relative text-white ${enCours ? "animate-spin" : ""}`} />
    </button>
  );
}
