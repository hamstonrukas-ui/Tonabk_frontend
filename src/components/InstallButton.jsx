import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";

function estIOS() {
  return /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function estInstalle() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [afficherInstructionsIOS, setAfficherInstructionsIOS] = useState(false);
  const [installe, setInstalle] = useState(estInstalle());

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (installe) return null;

  const handleClick = async () => {
    if (estIOS()) {
      setAfficherInstructionsIOS(true);
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setInstalle(true);
      setDeferredPrompt(null);
    } else {
      // Ni iOS ni prompt disponible (ex: déjà refusé, ou navigateur non supporté)
      setAfficherInstructionsIOS(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="fixed top-3 right-3 z-50 w-9 h-9 rounded-full bg-[#1B1B1B] shadow-lg flex items-center justify-center"
        aria-label="Installer l'application"
      >
        <Download size={16} className="text-white" />
      </button>

      {afficherInstructionsIOS && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={() => setAfficherInstructionsIOS(false)}>
          <div
            className="bg-white w-full rounded-t-2xl p-5 max-w-md mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-[#1B1B1B]">Installer TonaBk</p>
              <button onClick={() => setAfficherInstructionsIOS(false)}>
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            {estIOS() ? (
              <ol className="text-sm text-gray-600 space-y-2 list-decimal pl-4">
                <li>Appuyez sur le bouton <Share size={14} className="inline mx-0.5" /> <strong>Partager</strong> en bas de Safari</li>
                <li>Faites défiler et choisissez <strong>"Sur l'écran d'accueil"</strong></li>
                <li>Appuyez sur <strong>"Ajouter"</strong> en haut à droite</li>
              </ol>
            ) : (
              <p className="text-sm text-gray-600">
                Utilisez le menu de votre navigateur (⋮ ou ⋯) et cherchez l'option "Installer l'application" ou "Ajouter à l'écran d'accueil".
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
    }
        
