import { useState } from "react";
import { Calculator as CalcIcon, Delete } from "lucide-react";

export default function Calculatrice() {
  const [affichage, setAffichage] = useState("0");
  const [valeurPrecedente, setValeurPrecedente] = useState(null);
  const [operation, setOperation] = useState(null);
  const [attenteNouvelleValeur, setAttenteNouvelleValeur] = useState(false);
  const [ouvert, setOuvert] = useState(false);

  const saisirChiffre = (chiffre) => {
    if (attenteNouvelleValeur) {
      setAffichage(String(chiffre));
      setAttenteNouvelleValeur(false);
    } else {
      setAffichage(affichage === "0" ? String(chiffre) : affichage + chiffre);
    }
  };

  const saisirVirgule = () => {
    if (attenteNouvelleValeur) {
      setAffichage("0,");
      setAttenteNouvelleValeur(false);
      return;
    }
    if (!affichage.includes(",")) setAffichage(affichage + ",");
  };

  const effacer = () => {
    setAffichage("0");
    setValeurPrecedente(null);
    setOperation(null);
    setAttenteNouvelleValeur(false);
  };

  const effacerDernier = () => {
    if (affichage.length === 1) {
      setAffichage("0");
    } else {
      setAffichage(affichage.slice(0, -1));
    }
  };

  const calculer = (a, b, op) => {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "×": return a * b;
      case "÷": return b === 0 ? 0 : a / b;
      default: return b;
    }
  };

  const choisirOperation = (op) => {
    const valeurActuelle = parseFloat(affichage.replace(",", "."));

    if (valeurPrecedente !== null && operation && !attenteNouvelleValeur) {
      const resultat = calculer(valeurPrecedente, valeurActuelle, operation);
      setAffichage(String(resultat).replace(".", ","));
      setValeurPrecedente(resultat);
    } else {
      setValeurPrecedente(valeurActuelle);
    }

    setOperation(op);
    setAttenteNouvelleValeur(true);
  };

  const egaler = () => {
    if (valeurPrecedente === null || !operation) return;
    const valeurActuelle = parseFloat(affichage.replace(",", "."));
    const resultat = calculer(valeurPrecedente, valeurActuelle, operation);
    setAffichage(String(resultat).replace(".", ","));
    setValeurPrecedente(null);
    setOperation(null);
    setAttenteNouvelleValeur(true);
  };

  const Bouton = ({ children, onClick, classe = "" }) => (
    <button
      onClick={onClick}
      className={`h-11 rounded-lg text-sm font-semibold active:scale-95 transition-transform ${classe}`}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-white rounded-xl p-3 mb-3">
      <button
        onClick={() => setOuvert(!ouvert)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <CalcIcon size={16} className="text-[#F5720C]" />
          <p className="text-sm font-bold text-[#1B1B1B]">Calculatrice</p>
        </div>
        <span className="text-xs font-semibold text-[#F5720C]">{ouvert ? "Fermer" : "Ouvrir"}</span>
      </button>

      {ouvert && (
        <div className="mt-3">
          <div className="bg-[#1B1B1B] rounded-lg px-3 py-3 mb-2 text-right overflow-hidden">
            <p className="text-white text-2xl font-mono truncate">{affichage}</p>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            <Bouton onClick={effacer} classe="bg-red-50 text-red-500 col-span-2">C</Bouton>
            <Bouton onClick={effacerDernier} classe="bg-gray-100 text-gray-600 flex items-center justify-center">
              <Delete size={16} />
            </Bouton>
            <Bouton onClick={() => choisirOperation("÷")} classe="bg-[#FFF1E4] text-[#F5720C]">÷</Bouton>

            <Bouton onClick={() => saisirChiffre(7)} classe="bg-gray-50 text-[#1B1B1B]">7</Bouton>
            <Bouton onClick={() => saisirChiffre(8)} classe="bg-gray-50 text-[#1B1B1B]">8</Bouton>
            <Bouton onClick={() => saisirChiffre(9)} classe="bg-gray-50 text-[#1B1B1B]">9</Bouton>
            <Bouton onClick={() => choisirOperation("×")} classe="bg-[#FFF1E4] text-[#F5720C]">×</Bouton>

            <Bouton onClick={() => saisirChiffre(4)} classe="bg-gray-50 text-[#1B1B1B]">4</Bouton>
            <Bouton onClick={() => saisirChiffre(5)} classe="bg-gray-50 text-[#1B1B1B]">5</Bouton>
            <Bouton onClick={() => saisirChiffre(6)} classe="bg-gray-50 text-[#1B1B1B]">6</Bouton>
            <Bouton onClick={() => choisirOperation("-")} classe="bg-[#FFF1E4] text-[#F5720C]">−</Bouton>

            <Bouton onClick={() => saisirChiffre(1)} classe="bg-gray-50 text-[#1B1B1B]">1</Bouton>
            <Bouton onClick={() => saisirChiffre(2)} classe="bg-gray-50 text-[#1B1B1B]">2</Bouton>
            <Bouton onClick={() => saisirChiffre(3)} classe="bg-gray-50 text-[#1B1B1B]">3</Bouton>
            <Bouton onClick={() => choisirOperation("+")} classe="bg-[#FFF1E4] text-[#F5720C]">+</Bouton>

            <Bouton onClick={() => saisirChiffre(0)} classe="bg-gray-50 text-[#1B1B1B] col-span-2">0</Bouton>
            <Bouton onClick={saisirVirgule} classe="bg-gray-50 text-[#1B1B1B]">,</Bouton>
            <Bouton onClick={egaler} classe="bg-[#F5720C] text-white">=</Bouton>
          </div>
        </div>
      )}
    </div>
  );
  }
    
