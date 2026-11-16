// Vue « TikTok » : un produit par écran, photo entière, on fait défiler vers le haut pour voir le suivant.
// Boutons : WhatsApp du commerçant et « Livre-moi » (livraison à la maison).
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, BadgeCheck, MessageCircle, Truck, ChevronUp } from "lucide-react";
import { API_URL } from "../lib/api";
import { obtenirMarque } from "../lib/marque";
import { enregistrerClicWhatsapp } from "../lib/analytics";

const NUMERO_SERVICE = "243855841999";
const fmt = (n, devise = "USD") => Number(n).toLocaleString("fr-FR") + " " + devise;

function photosDe(p) {
  const liste = Array.isArray(p.photos) && p.photos.length ? p.photos : p.photo_url ? [p.photo_url] : [];
  return liste;
}

export default function VueTikTok({ produits, pageSuivante, totalPages, chargerPage, onFermer }) {
  const navigate = useNavigate();
  const marque = obtenirMarque();
  const [liste, setListe] = useState(produits);
  const [index, setIndex] = useState(0);
  const prochaine = useRef(pageSuivante);
  const fini = useRef(pageSuivante > totalPages);
  const enCours = useRef(false);
  const conteneur = useRef(null);
  const fermeture = useRef(false);

  // Le bouton « retour » du téléphone ferme la vue au lieu de quitter la page
  useEffect(() => {
    window.history.pushState({ vueTikTok: true }, "");
    const surRetour = () => { fermeture.current = true; onFermer(); };
    window.addEventListener("popstate", surRetour);
    const ancien = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("popstate", surRetour);
      document.body.style.overflow = ancien;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fermer = () => {
    if (!fermeture.current && window.history.state?.vueTikTok) window.history.back();
    else onFermer();
  };

  // Charge la page suivante quand on approche de la fin
  const chargerPlus = async () => {
    if (enCours.current || fini.current) return;
    enCours.current = true;
    try {
      const r = await chargerPage(prochaine.current);
      const nouveaux = r?.data || [];
      prochaine.current += 1;
      if (!nouveaux.length || prochaine.current > (r?.totalPages || 1)) fini.current = true;
      setListe((prev) => {
        const vus = new Set(prev.map((p) => p.id));
        return [...prev, ...nouveaux.filter((p) => !vus.has(p.id))];
      });
    } catch {
      /* réessai au prochain défilement */
    }
    enCours.current = false;
  };

  const surDefilement = (e) => {
    const h = e.currentTarget.clientHeight || 1;
    const i = Math.round(e.currentTarget.scrollTop / h);
    if (i !== index) setIndex(i);
    if (i >= liste.length - 4) chargerPlus();
  };

  const contacter = (p) => {
    const numero = p.boutiques?.telephone?.replace(/\D/g, "");
    if (!numero) return alert("Cette boutique n'a pas encore de numéro WhatsApp renseigné.");
    const msg = `Bonjour, je suis intéressé(e) par "${p.nom}" (${fmt(p.prix, p.devise)}) vu sur ${marque.nom}.\n${API_URL}/partage/produit/${p.id}?v=${Date.now()}`;
    enregistrerClicWhatsapp("produit", p.id);
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const livreMoi = async (p) => {
    const fenetre = window.open("", "_blank"); // ouverte tout de suite, sinon le téléphone la bloque
    let ref = "";
    try {
      const res = await fetch(`${API_URL}/api/livraisons`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produit_id: p.id, boutique_id: p.boutique_id, nom_produit: p.nom, prix: p.prix, devise: p.devise || "USD" }),
      });
      if (res.ok) {
        const { id } = await res.json();
        ref = id.slice(0, 8);
        try {
          const anciennes = JSON.parse(localStorage.getItem("tonabk_commandes") || "[]");
          localStorage.setItem("tonabk_commandes", JSON.stringify([id, ...anciennes]));
        } catch { /* pas grave */ }
      }
    } catch { /* on ouvre quand même WhatsApp */ }
    const message =
      `Bonjour, je veux me faire livrer à la maison : "${p.nom}" (${fmt(p.prix, p.devise)}).` +
      (ref ? ` Réf. commande : ${ref}` : "") + `\n${API_URL}/partage/produit/${p.id}?v=${Date.now()}`;
    const url = `https://wa.me/${NUMERO_SERVICE}?text=${encodeURIComponent(message)}`;
    if (fenetre) fenetre.location.href = url; else window.location.href = url;
  };

  const voirDetails = (p) => navigate(`/boutique/produit/${p.id}`, { state: { depuisAccueil: true } });

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <div
        ref={conteneur}
        onScroll={surDefilement}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ overscrollBehavior: "contain" }}
      >
        {liste.map((p, i) => {
          const photos = photosDe(p);
          const proche = Math.abs(i - index) <= 2; // seules les photos voisines sont chargées
          return (
            <section key={p.id} className="relative w-full snap-start snap-always bg-black" style={{ height: "100dvh" }}>
              {proche && photos.length <= 1 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {photos[0] ? <img src={photos[0]} alt={p.nom} className="max-w-full max-h-full object-contain" /> : <span className="text-6xl">📦</span>}
                </div>
              )}
              {proche && photos.length > 1 && (
                <div className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {photos.map((u) => (
                    <div key={u} className="flex-shrink-0 w-full h-full snap-center flex items-center justify-center">
                      <img src={u} alt={p.nom} className="max-w-full max-h-full object-contain" />
                    </div>
                  ))}
                </div>
              )}
              {photos.length > 1 && (
                <span className="absolute top-14 right-3 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                  {photos.length} photos ›
                </span>
              )}

              <div className="absolute left-0 right-0 bottom-0 pt-24 pb-5 px-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-white pointer-events-none">
                <div className="pointer-events-auto">
                  <p className="text-base font-extrabold leading-tight">{p.nom}</p>
                  <p className="text-xl font-extrabold text-[#F5720C] mt-0.5">{fmt(p.prix_gros || p.prix, p.devise)}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <p className="text-xs text-white/80">{p.boutiques?.nom}</p>
                    {p.boutiques?.certifiee && <BadgeCheck size={12} className="text-[#F5720C]" />}
                  </div>
                  {p.description && <p className="text-[11px] text-white/70 mt-1 line-clamp-2">{p.description}</p>}
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => contacter(p)} className="flex-1 flex items-center justify-center gap-1.5 bg-[#25D366] text-white text-sm font-extrabold rounded-lg py-3">
                      <MessageCircle size={17} /> WhatsApp
                    </button>
                    <button onClick={() => livreMoi(p)} className="flex-1 flex items-center justify-center gap-1.5 bg-[#F5720C] text-white text-sm font-extrabold rounded-lg py-3">
                      <Truck size={17} /> Livre-moi
                    </button>
                  </div>
                  <button onClick={() => voirDetails(p)} className="w-full mt-2 text-[11px] font-semibold text-white/80 underline">
                    Voir les détails
                  </button>
                </div>
              </div>

              {i === 0 && index === 0 && liste.length > 1 && (
                <div className="absolute bottom-[190px] left-0 right-0 flex flex-col items-center text-white/80 pointer-events-none animate-bounce">
                  <ChevronUp size={22} />
                  <span className="text-[10px] font-semibold">Glissez vers le haut</span>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <button onClick={fermer} aria-label="Fermer" className="absolute top-3 left-3 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
        <X size={22} className="text-white" />
      </button>
      <span className="absolute top-4 right-3 bg-black/50 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
        {Math.min(index + 1, liste.length)} / {liste.length}{fini.current ? "" : "+"}
      </span>
    </div>
  );
}
