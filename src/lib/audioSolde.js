// Son en boucle de la page Soldes ("Soldes ici, faites vite !").
// Un seul élément audio pour toute l'application : il est démarré dans le clic sur « Voir les Soldes »
// (les navigateurs n'autorisent le son qu'après un geste de l'utilisateur) puis continue sur la page Soldes.
//
// Le fichier à enregistrer : public/audio/solde.mp3  (ou public/audio/solde.m4a)

const CLE_MUET = "tonabk_solde_muet";
const VITESSE = 2; // vitesse de lecture : 1 = normale, 2 = deux fois plus vite
let audio = null;
let indisponible = false;

function obtenir() {
  if (audio || typeof document === "undefined") return audio;
  audio = document.createElement("audio");
  [["mp3", "audio/mpeg"], ["m4a", "audio/mp4"]].forEach(([ext, type]) => {
    const source = document.createElement("source");
    source.src = `/audio/solde.${ext}`;
    source.type = type;
    audio.appendChild(source);
  });
  audio.loop = true;
  audio.preload = "auto";
  audio.defaultPlaybackRate = VITESSE;
  audio.playbackRate = VITESSE;
  audio.preservesPitch = true; // plus rapide mais la voix garde sa hauteur
  audio.webkitPreservesPitch = true;
  return audio;
}

// Le « muet » ne dure que le temps de la visite (fermer l'app le remet à zéro) :
// un client qui a coupé le son une fois ne doit pas l'avoir coupé pour toujours.
export function estMuet() {
  try { return sessionStorage.getItem(CLE_MUET) === "1"; } catch { return false; }
}

export function definirMuet(muet) {
  try { sessionStorage.setItem(CLE_MUET, muet ? "1" : "0"); } catch { /* stockage indisponible */ }
  if (muet) arreterAudioSolde();
}

export const audioIndisponible = () => indisponible;
export const enLecture = () => !!audio && !audio.paused;

// À appeler dans un clic (ou au chargement de la page : peut alors être refusé par le navigateur).
export async function demarrerAudioSolde() {
  if (estMuet()) return false;
  const a = obtenir();
  if (!a) return false;
  try {
    a.playbackRate = VITESSE;
    await a.play();
    return true;
  } catch (e) {
    if (e?.name === "NotSupportedError") {
      indisponible = true; // fichier audio absent ou illisible
      console.warn("Audio des soldes introuvable ou illisible : vérifie public/audio/solde.mp3 (ou solde.m4a)");
    }
    return false; // NotAllowedError : le navigateur attend un geste → bouton « Activer le son »
  }
}

export function arreterAudioSolde() {
  if (!audio) return;
  audio.pause();
  try { audio.currentTime = 0; } catch { /* pas encore chargé */ }
}
