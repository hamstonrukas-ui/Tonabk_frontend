import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Ne pas re-proposer si l'utilisateur a déjà ignoré, ou si l'app est déjà installée
    const dejaIgnore = localStorage.getItem("tonabk_install_ignore");
    const dejaInstallee = window.matchMedia("(display-mode: standalone)").matches;
    if (dejaIgnore || dejaInstallee) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installer = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };

  const ignorer = () => {
    localStorage.setItem("tonabk_install_ignore", "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-3 right-3 z-40 max-w-md mx-auto bg-[#1B1B1B] rounded-xl p-3 flex items-center gap-3 shadow-lg">
      <div className="w-10 h-10 rounded-lg bg-[#F5720C] flex items-center justify-center flex-shrink-0">
        <Download size={18} className="text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-white">Installer TonaBk</p>
        <p className="text-[11px] text-gray-300">Accès rapide depuis votre écran d'accueil</p>
      </div>
      <button onClick={installer} className="bg-[#F5720C] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0">
        Installer
      </button>
      <button onClick={ignorer} className="text-gray-400 flex-shrink-0">
        <X size={16} />
      </button>
    </div>
  );
}
