import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, Search, ShoppingCart, PackagePlus, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { API_URL } from "../../lib/api";

const fmtMontant = (n, devise) => (devise === "USD" ? "$ " : "") + Number(n).toLocaleString("fr-FR") + (devise === "FC" ? " FC" : "");
const MAX_ARTICLES = 10;

function estAujourdhui(dateStr) {
  const d = new Date(dateStr);
  const maintenant = new Date();
  return d.toDateString() === maintenant.toDateString();
}

function fmtHeure(dateStr) {
  return new Date(dateStr).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function fmtDateCourte(dateStr) {
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

async function authHeaders(navigate) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    navigate("/inscription?redirect=/boutique/inventaire");
    return null;
  }
  return { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` };
}

async function requeteJSON(navigate, url, options = {}) {
  const headers = await authHeaders(navigate);
  if (!headers) return { ok: false, data: null };

  const controleur = new AbortController();
  const delai = setTimeout(() => controleur.abort(), 15000);

  try {
    const res = await fetch(url, { ...options, headers: { ...headers, ...(options.headers || {}) }, signal: controleur.signal });
    clearTimeout(delai);
    if (res.status === 204) return { ok: true, data: null };
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data };
  } catch (err) {
    clearTimeout(delai);
    return { ok: false, data: { error: err.name === "AbortError" ? "Le serveur met trop de temps à répondre." : "Connexion au serveur impossible." } };
  }
}

export default function Inventaire() {
  const navigate = useNavigate();
  const [onglet, setOnglet] = useState("articles");
  const [afficherGuide, setAfficherGuide] = useState(false);

  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-3">
        <Link to="/boutique/gerer" className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
          <ArrowLeft size={16} />
        </Link>
        <p className="text-sm font-bold text-[#1B1B1B] flex-1">Inventaire</p>
        <button
          onClick={() => setAfficherGuide(!afficherGuide)}
          className="flex items-center gap-1 text-[11px] font-semibold text-[#F5720C]"
        >
          <HelpCircle size={13} /> Comment ça marche ?
          {afficherGuide ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {afficherGuide && (
        <div className="bg-[#FFF8F2] border border-[#FFD3AC] rounded-xl p-3.5 mb-3 text-[11.5px] text-gray-600 leading-relaxed space-y-2">
          <p>
            Cet inventaire est un <b>carnet interne</b>, invisible pour vos clients — il n'a aucun lien
            avec les produits publiés publiquement dans votre boutique (certains servent juste à la
            publicité et ne reflètent pas forcément ce que vous avez réellement en stock).
          </p>
          <p><b>1. Articles</b> — créez ici la liste de vos vrais articles (nom, prix, devise). Maximum {MAX_ARTICLES} articles suivis à la fois.</p>
          <p><b>2. Achats</b> — chaque fois que vous achetez du stock, enregistrez-le ici : quantité et prix unitaire. La quantité disponible de l'article augmente automatiquement.</p>
          <p><b>3. Ventes</b> — chaque fois que vous vendez, enregistrez-le ici. La quantité disponible diminue automatiquement — impossible de vendre plus que ce qui est réellement en stock.</p>
          <p><b>4. Stock</b> — cet onglet résume tout : l'état de chaque article (Normal / Faible / Rupture), et la valeur totale de votre stock, calculée automatiquement à partir des prix et quantités.</p>
          <p>Vous n'entrez jamais la quantité à la main : elle se calcule toute seule à partir de vos achats et ventes.</p>
        </div>
      )}

      <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
        {[
          { id: "articles", label: "Articles" },
          { id: "stock", label: "Stock" },
          { id: "ventes", label: "Ventes" },
          { id: "achats", label: "Achats" },
        ].map((o) => (
          <button
            key={o.id}
            onClick={() => setOnglet(o.id)}
            className={`flex-shrink-0 text-xs font-semibold rounded-full px-3.5 py-1.5 ${
              onglet === o.id ? "bg-[#F5720C] text-white" : "bg-white text-gray-500"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {onglet === "articles" && <OngletArticles navigate={navigate} />}
      {onglet === "stock" && <OngletStock navigate={navigate} />}
      {onglet === "ventes" && <OngletVentes navigate={navigate} />}
      {onglet === "achats" && <OngletAchats navigate={navigate} />}
    </div>
  );
}

// ---------------- ARTICLES ----------------

function OngletArticles({ navigate }) {
  const [articles, setArticles] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [erreur, setErreur] = useState("");
  const [edition, setEdition] = useState(null); // "nouveau" | article.id | null
  const [nom, setNom] = useState("");
  const [prix, setPrix] = useState("");
  const [devise, setDevise] = useState("USD");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  async function charger() {
    const { ok, data } = await requeteJSON(navigate, `${API_URL}/api/inventaire/articles`);
    if (ok) setArticles(data);
    else { setErreur(data?.error || "Impossible de charger les articles."); setArticles([]); }
  }

  useEffect(() => { charger(); }, []);

  const ouvrirNouveau = () => {
    setEdition("nouveau"); setNom(""); setPrix(""); setDevise("USD"); setErreur("");
  };

  const ouvrirEdition = (a) => {
    setEdition(a.id); setNom(a.nom); setPrix(String(a.prix)); setDevise(a.devise); setErreur("");
  };

  const enregistrer = async (e) => {
    e.preventDefault();
    setErreur("");
    if (!nom.trim() || prix === "") { setErreur("Nom et prix requis"); return; }
    setEnvoiEnCours(true);

    const estNouveau = edition === "nouveau";
    const url = estNouveau ? `${API_URL}/api/inventaire/articles` : `${API_URL}/api/inventaire/articles/${edition}`;
    const { ok, data } = await requeteJSON(navigate, url, {
      method: estNouveau ? "POST" : "PUT",
      body: JSON.stringify({ nom: nom.trim(), prix: Number(prix), devise }),
    });

    if (ok) { setEdition(null); charger(); }
    else setErreur(data?.error || "Échec de l'enregistrement");
    setEnvoiEnCours(false);
  };

  const supprimer = async (a) => {
    if (!confirm(`Supprimer "${a.nom}" ? Son historique d'achats/ventes sera aussi supprimé.`)) return;
    const { ok, data } = await requeteJSON(navigate, `${API_URL}/api/inventaire/articles/${a.id}`, { method: "DELETE" });
    if (ok) charger();
    else setErreur(data?.error || "Échec de la suppression");
  };

  if (articles === null) return <p className="text-center text-sm text-gray-400 py-10">Chargement...</p>;

  const filtres = articles.filter((a) => a.nom.toLowerCase().includes(recherche.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-lg font-bold text-[#1B1B1B]">Articles</p>
          <p className="text-[11px] text-gray-400">{articles.length}/{MAX_ARTICLES} article(s)</p>
        </div>
        {articles.length < MAX_ARTICLES ? (
          <button onClick={ouvrirNouveau} className="flex items-center gap-1 bg-[#F5720C] text-white text-xs font-semibold px-3 py-2 rounded-lg">
            <Plus size={14} /> Ajouter
          </button>
        ) : (
          <span className="text-[11px] font-semibold text-gray-400">Limite atteinte</span>
        )}
      </div>

      {erreur && <p className="text-xs text-red-500 mb-2">{erreur}</p>}

      {edition && (
        <form onSubmit={enregistrer} className="bg-white rounded-xl p-3 mb-3 space-y-2">
          <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom de l'article" required
            className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full" />
          <div className="flex gap-2">
            <input value={prix} onChange={(e) => setPrix(e.target.value)} type="number" placeholder="Prix" required
              className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full" />
            <select value={devise} onChange={(e) => setDevise(e.target.value)} className="border border-gray-200 rounded-md px-3 py-2 text-sm">
              <option value="USD">USD</option>
              <option value="FC">FC</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setEdition(null)} className="flex-1 border border-gray-200 text-gray-500 text-xs font-semibold rounded-md py-2">
              Annuler
            </button>
            <button type="submit" disabled={envoiEnCours} className="flex-1 bg-[#F5720C] text-white text-xs font-semibold rounded-md py-2">
              {envoiEnCours ? "..." : "Enregistrer"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg flex items-center gap-2 px-3 py-2 mb-2.5">
        <Search size={14} className="text-gray-400" />
        <input value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Rechercher..." className="flex-1 text-sm outline-none" />
      </div>

      <div className="bg-white rounded-xl overflow-hidden">
        {filtres.map((a, i) => (
          <div key={a.id} className={`flex items-center gap-2 p-2.5 ${i > 0 ? "border-t border-gray-100" : ""}`}>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-medium truncate">{a.nom}</p>
              <span className="text-[9px] font-semibold text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5">{a.devise}</span>
            </div>
            <p className="text-[12.5px] font-bold text-[#F5720C] flex-shrink-0">{fmtMontant(a.prix, a.devise)}</p>
            <span className="text-[11px] font-semibold text-gray-400 w-6 text-center flex-shrink-0">{a.quantite}</span>
            <button onClick={() => ouvrirEdition(a)} className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center flex-shrink-0">
              <Pencil size={12} className="text-gray-500" />
            </button>
            <button onClick={() => supprimer(a)} className="w-7 h-7 rounded-md border border-red-200 flex items-center justify-center flex-shrink-0">
              <Trash2 size={12} className="text-red-400" />
            </button>
          </div>
        ))}
        {filtres.length === 0 && <p className="text-center text-sm text-gray-400 py-8">Aucun article</p>}
      </div>
    </div>
  );
}

// ---------------- STOCK ----------------

function OngletStock({ navigate }) {
  const [donnees, setDonnees] = useState(null);
  const [erreur, setErreur] = useState("");
  const [editionTaux, setEditionTaux] = useState(false);
  const [nouveauTaux, setNouveauTaux] = useState("");

  async function charger() {
    const { ok, data } = await requeteJSON(navigate, `${API_URL}/api/inventaire/stock`);
    if (ok) setDonnees(data);
    else { setErreur(data?.error || "Impossible de charger le stock."); setDonnees({ articles: [], taux_change_fc: 2500 }); }
  }

  useEffect(() => { charger(); }, []);

  const enregistrerTaux = async (e) => {
    e.preventDefault();
    const { ok, data } = await requeteJSON(navigate, `${API_URL}/api/inventaire/taux-change`, {
      method: "PUT",
      body: JSON.stringify({ taux_change_fc: Number(nouveauTaux) }),
    });
    if (ok) { setEditionTaux(false); charger(); }
    else setErreur(data?.error || "Échec de l'enregistrement du taux");
  };

  if (donnees === null) return <p className="text-center text-sm text-gray-400 py-10">Chargement...</p>;

  const { articles, taux_change_fc } = donnees;
  const normal = articles.filter((a) => a.etat === "normal").length;
  const faible = articles.filter((a) => a.etat === "faible").length;
  const rupture = articles.filter((a) => a.etat === "rupture").length;

  const valeurTotale = articles.reduce((total, a) => {
    const valeur = a.prix * a.quantite;
    return total + (a.devise === "FC" ? valeur / taux_change_fc : valeur);
  }, 0);

  const badgeEtat = { normal: "bg-green-50 text-green-700", faible: "bg-orange-50 text-orange-600", rupture: "bg-red-50 text-red-500" };
  const labelEtat = { normal: "Normal", faible: "Faible", rupture: "Rupture" };

  return (
    <div>
      <p className="text-lg font-bold text-[#1B1B1B] mb-3">État du stock</p>
      {erreur && <p className="text-xs text-red-500 mb-2">{erreur}</p>}

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <p className="text-xl font-extrabold text-green-700">{normal}</p>
          <p className="text-[10px] text-green-700">Normal</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-3 text-center">
          <p className="text-xl font-extrabold text-orange-600">{faible}</p>
          <p className="text-[10px] text-orange-600">Faible</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <p className="text-xl font-extrabold text-red-500">{rupture}</p>
          <p className="text-[10px] text-red-500">Rupture</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-3.5 mb-3">
        <p className="text-[10px] font-semibold text-gray-400 mb-1">VALEUR ESTIMÉE (EN $)</p>
        <p className="text-2xl font-extrabold text-[#1B1B1B]">$ {valeurTotale.toFixed(2)}</p>
        {editionTaux ? (
          <form onSubmit={enregistrerTaux} className="flex items-center gap-2 mt-2">
            <span className="text-[11px] text-gray-400">1$ =</span>
            <input value={nouveauTaux} onChange={(e) => setNouveauTaux(e.target.value)} type="number"
              className="border border-gray-200 rounded-md px-2 py-1 text-xs w-20" autoFocus />
            <span className="text-[11px] text-gray-400">FC</span>
            <button type="submit" className="text-[11px] font-semibold text-[#F5720C]">OK</button>
          </form>
        ) : (
          <button onClick={() => { setEditionTaux(true); setNouveauTaux(String(taux_change_fc)); }} className="text-[11px] text-gray-400 mt-1">
            Taux : 1$ = {taux_change_fc} FC ✎
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#FAF3EC]">
          <p className="text-[9.5px] font-bold text-gray-500 flex-1">ARTICLE</p>
          <p className="text-[9.5px] font-bold text-gray-500 w-10 text-center flex-shrink-0">QTÉ</p>
          <p className="text-[9.5px] font-bold text-gray-500 w-20 text-right flex-shrink-0">TOTAL</p>
        </div>
        {articles.map((a, i) => (
          <div key={a.id} className={`flex items-center gap-2 p-2.5 ${i > 0 ? "border-t border-gray-100" : ""}`}>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-medium truncate">{a.nom}</p>
              <p className="text-[10.5px] text-gray-400">{fmtMontant(a.prix, a.devise)} / unité</p>
              <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 ${badgeEtat[a.etat]}`}>{labelEtat[a.etat]}</span>
            </div>
            <span className="text-sm font-bold w-10 text-center flex-shrink-0">{a.quantite}</span>
            <p className="text-[12.5px] font-extrabold text-[#F5720C] w-20 text-right flex-shrink-0">
              {fmtMontant(a.prix * a.quantite, a.devise)}
            </p>
          </div>
        ))}
        {articles.length === 0 && <p className="text-center text-sm text-gray-400 py-8">Aucun article</p>}
      </div>
    </div>
  );
}

// ---------------- VENTES ----------------

function OngletVentes({ navigate }) {
  return <OngletMouvement navigate={navigate} type="vente" titre="Ventes" boutonLabel="Nouvelle vente" Icone={ShoppingCart} />;
}

// ---------------- ACHATS ----------------

function OngletAchats({ navigate }) {
  return <OngletMouvement navigate={navigate} type="achat" titre="Achats" boutonLabel="Nouvel achat" Icone={PackagePlus} />;
}

function OngletMouvement({ navigate, type, titre, boutonLabel, Icone }) {
  const [articles, setArticles] = useState([]);
  const [mouvements, setMouvements] = useState(null);
  const [afficherForm, setAfficherForm] = useState(false);
  const [articleId, setArticleId] = useState("");
  const [quantite, setQuantite] = useState("");
  const [prixUnitaire, setPrixUnitaire] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  async function charger() {
    const [resArticles, resMouvements] = await Promise.all([
      requeteJSON(navigate, `${API_URL}/api/inventaire/articles`),
      requeteJSON(navigate, `${API_URL}/api/inventaire/${type === "achat" ? "achats" : "ventes"}`),
    ]);
    if (resArticles.ok) setArticles(resArticles.data);
    if (resMouvements.ok) setMouvements(resMouvements.data);
    else { setErreur(resMouvements.data?.error || "Impossible de charger l'historique."); setMouvements([]); }
  }

  useEffect(() => { charger(); }, []);

  const ouvrirForm = () => {
    setAfficherForm(true); setArticleId(articles[0]?.id || ""); setQuantite(""); setPrixUnitaire(""); setErreur("");
  };

  const enregistrer = async (e) => {
    e.preventDefault();
    setErreur("");
    if (!articleId || !quantite || Number(quantite) <= 0) { setErreur("Choisissez un article et une quantité valide"); return; }
    setEnvoiEnCours(true);

    const { ok, data } = await requeteJSON(navigate, `${API_URL}/api/inventaire/articles/${articleId}/${type}`, {
      method: "POST",
      body: JSON.stringify({ quantite: Number(quantite), prix_unitaire: prixUnitaire ? Number(prixUnitaire) : null }),
    });

    if (ok) { setAfficherForm(false); charger(); }
    else setErreur(data?.error || "Échec de l'enregistrement");
    setEnvoiEnCours(false);
  };

  if (mouvements === null) return <p className="text-center text-sm text-gray-400 py-10">Chargement...</p>;

  const mouvementsAujourdhui = mouvements.filter((m) => estAujourdhui(m.created_at));
  const mouvementsHistorique = mouvements.filter((m) => !estAujourdhui(m.created_at));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-lg font-bold text-[#1B1B1B]">{titre}</p>
          <p className="text-[11px] text-gray-400">{mouvements.length} {type === "achat" ? "achat(s)" : "vente(s)"} enregistré(s)</p>
        </div>
        <button onClick={ouvrirForm} className="flex items-center gap-1 bg-[#F5720C] text-white text-xs font-semibold px-3 py-2 rounded-lg">
          <Icone size={14} /> {boutonLabel}
        </button>
      </div>

      {erreur && <p className="text-xs text-red-500 mb-2">{erreur}</p>}

      {afficherForm && (
        <form onSubmit={enregistrer} className="bg-white rounded-xl p-3 mb-3 space-y-2">
          <select value={articleId} onChange={(e) => setArticleId(e.target.value)} required
            className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full">
            {articles.length === 0 && <option value="">Aucun article — créez-en un d'abord</option>}
            {articles.map((a) => <option key={a.id} value={a.id}>{a.nom} ({a.quantite} en stock)</option>)}
          </select>
          <div className="flex gap-2">
            <input value={quantite} onChange={(e) => setQuantite(e.target.value)} type="number" placeholder="Quantité" required
              className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full" />
            <input value={prixUnitaire} onChange={(e) => setPrixUnitaire(e.target.value)} type="number" placeholder="Prix unitaire (optionnel)"
              className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full" />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setAfficherForm(false)} className="flex-1 border border-gray-200 text-gray-500 text-xs font-semibold rounded-md py-2">
              Annuler
            </button>
            <button type="submit" disabled={envoiEnCours || articles.length === 0} className="flex-1 bg-[#F5720C] text-white text-xs font-semibold rounded-md py-2">
              {envoiEnCours ? "..." : "Enregistrer"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl overflow-hidden">
        {mouvementsAujourdhui.length > 0 && (
          <p className="text-[10px] font-bold text-gray-400 px-2.5 pt-2.5 pb-1 uppercase">Aujourd'hui</p>
        )}
        {mouvementsAujourdhui.map((m, i) => (
          <div key={m.id} className={`flex items-center justify-between p-2.5 ${i > 0 ? "border-t border-gray-100" : ""}`}>
            <div className="min-w-0">
              <p className="text-[12.5px] font-medium truncate">{m.nom_article}</p>
              <p className="text-[10px] text-gray-400">{fmtHeure(m.created_at)}</p>
            </div>
            <span className="text-[11px] text-gray-400 flex-shrink-0">Qté {m.quantite}</span>
            <p className="text-[12.5px] font-bold text-[#1B1B1B] flex-shrink-0">
              {m.prix_unitaire ? fmtMontant(m.prix_unitaire * m.quantite, m.devise) : "—"}
            </p>
          </div>
        ))}

        {mouvementsHistorique.length > 0 && (
          <p className="text-[10px] font-bold text-gray-400 px-2.5 pt-2.5 pb-1 uppercase border-t border-gray-100">Historique</p>
        )}
        {mouvementsHistorique.map((m, i) => (
          <div key={m.id} className={`flex items-center justify-between p-2.5 ${i > 0 ? "border-t border-gray-100" : ""}`}>
            <div className="min-w-0">
              <p className="text-[12.5px] font-medium truncate">{m.nom_article}</p>
              <p className="text-[10px] text-gray-400">{fmtDateCourte(m.created_at)} à {fmtHeure(m.created_at)}</p>
            </div>
            <span className="text-[11px] text-gray-400 flex-shrink-0">Qté {m.quantite}</span>
            <p className="text-[12.5px] font-bold text-[#1B1B1B] flex-shrink-0">
              {m.prix_unitaire ? fmtMontant(m.prix_unitaire * m.quantite, m.devise) : "—"}
            </p>
          </div>
        ))}
        {mouvements.length === 0 && <p className="text-center text-sm text-gray-400 py-8">Aucune {type === "achat" ? "achat" : "vente"}</p>}
      </div>
    </div>
  );
}
