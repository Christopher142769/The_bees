import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, assetUrl } from "../api";
import { DEFAULT_ACTION_PLAN_TEXT } from "../constants/actionPlanDefault.js";

const EMPTY_FORM = {
  name: "",
  role: "",
  gender: "autre",
  order: 0,
  quiJeSuis: "",
  ceQuiMeMotive: "",
  mesForces: "",
  quandMeVoir: "",
  vision: "",
};

const HERO_FALLBACK =
  "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80";
const HIVE_FALLBACK =
  "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=600&q=80";

const NAV = [
  { id: "members", label: "Membres", ic: "👥" },
  { id: "media", label: "Médias", ic: "🖼️" },
  { id: "site", label: "Images du site", ic: "✨" },
  { id: "inbox", label: "Suggestions", ic: "✉️" },
];

export default function Dashboard() {
  const token = localStorage.getItem("bees_token");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState("members");
  const [members, setMembers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [mediaList, setMediaList] = useState([]);
  const [settings, setSettings] = useState({
    heroImagePath: "",
    hiveImagePath: "",
    logoPath: "",
    actionPlanText: DEFAULT_ACTION_PLAN_TEXT,
  });
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [pickerFor, setPickerFor] = useState(null);
  const [dragMedia, setDragMedia] = useState(false);

  const authed = !!token;

  const refresh = useCallback(async () => {
    if (!localStorage.getItem("bees_token")) return;
    try {
      const [m, s, med, cfg] = await Promise.all([
        api.getMembers(),
        api.getSuggestions(),
        api.getMedia(),
        api.getSettings(),
      ]);
      setMembers(m);
      setSuggestions(s);
      setMediaList(med);
      setSettings(cfg);
    } catch {
      localStorage.removeItem("bees_token");
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    if (authed) refresh();
  }, [authed, refresh]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    try {
      const { token: t } = await api.login(password);
      localStorage.setItem("bees_token", t);
      setPassword("");
      window.location.reload();
    } catch {
      setLoginError("Mot de passe incorrect.");
    }
  }

  function logout() {
    localStorage.removeItem("bees_token");
    window.location.reload();
  }

  function flash(ok, text) {
    setErr(ok ? "" : text);
    setMsg(ok ? text : "");
    if (text) setTimeout(() => (ok ? setMsg("") : setErr("")), 5000);
  }

  function startEdit(m) {
    setEditingId(m._id);
    setForm({
      name: m.name,
      role: m.role || "",
      gender: m.gender || "autre",
      order: m.order ?? 0,
      quiJeSuis: m.quiJeSuis || "",
      ceQuiMeMotive: m.ceQuiMeMotive || "",
      mesForces: m.mesForces || "",
      quandMeVoir: m.quandMeVoir || "",
      vision: m.vision || "",
    });
    setTab("members");
    setMsg("");
    setErr("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function saveMember(e) {
    e.preventDefault();
    setMsg("");
    setErr("");
    try {
      if (editingId) {
        await api.updateMember(editingId, form);
        flash(true, "Membre mis à jour.");
      } else {
        await api.createMember(form);
        flash(true, "Membre créé.");
      }
      cancelEdit();
      await refresh();
    } catch (ex) {
      flash(false, ex.message || "Erreur");
    }
  }

  async function handlePhoto(id, file) {
    if (!file) return;
    setErr("");
    try {
      await api.uploadPhoto(id, file);
      flash(true, "Photo du membre enregistrée.");
      await refresh();
    } catch (ex) {
      flash(false, ex.message || "Upload échoué");
    }
  }

  async function removeMember(id) {
    if (!confirm("Supprimer ce membre ?")) return;
    try {
      await api.deleteMember(id);
      await refresh();
      if (editingId === id) cancelEdit();
      flash(true, "Membre supprimé.");
    } catch (ex) {
      flash(false, ex.message || "Erreur");
    }
  }

  async function removeSuggestion(id) {
    try {
      await api.deleteSuggestion(id);
      await refresh();
      flash(true, "Message supprimé.");
    } catch (ex) {
      flash(false, ex.message || "Erreur");
    }
  }

  async function onMediaFiles(files) {
    const list = Array.from(files || []).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    setErr("");
    try {
      for (const f of list) {
        await api.uploadMedia(f);
      }
      flash(true, `${list.length} fichier(s) ajouté(s) à la médiathèque.`);
      await refresh();
    } catch (ex) {
      flash(false, ex.message || "Upload échoué");
    }
  }

  async function deleteMediaItem(id) {
    if (!confirm("Supprimer ce média du serveur ?")) return;
    try {
      await api.deleteMedia(id);
      await refresh();
      flash(true, "Média supprimé.");
    } catch (ex) {
      flash(false, ex.message || "Erreur");
    }
  }

  async function setHeroPath(p) {
    try {
      const cfg = await api.patchSettings({ heroImagePath: p });
      setSettings(cfg);
      setPickerFor(null);
      flash(true, "Bannière d’accueil mise à jour.");
    } catch (ex) {
      flash(false, ex.message || "Erreur");
    }
  }

  async function setHivePath(p) {
    try {
      const cfg = await api.patchSettings({ hiveImagePath: p });
      setSettings(cfg);
      setPickerFor(null);
      flash(true, "Image « Esprit ruche » mise à jour.");
    } catch (ex) {
      flash(false, ex.message || "Erreur");
    }
  }

  async function clearHero() {
    try {
      const cfg = await api.patchSettings({ heroImagePath: "" });
      setSettings(cfg);
      flash(true, "Bannière réinitialisée (image par défaut).");
    } catch (ex) {
      flash(false, ex.message || "Erreur");
    }
  }

  async function clearHive() {
    try {
      const cfg = await api.patchSettings({ hiveImagePath: "" });
      setSettings(cfg);
      flash(true, "Image ruche réinitialisée.");
    } catch (ex) {
      flash(false, ex.message || "Erreur");
    }
  }

  async function handleLogoUpload(file) {
    if (!file) return;
    try {
      const cfg = await api.uploadLogo(file);
      setSettings(cfg);
      flash(true, "Logo enregistré.");
      await refresh();
    } catch (ex) {
      flash(false, ex.message || "Upload échoué");
    }
  }

  async function clearLogo() {
    try {
      const cfg = await api.patchSettings({ logoPath: "" });
      setSettings(cfg);
      flash(true, "Logo supprimé.");
      await refresh();
    } catch (ex) {
      flash(false, ex.message || "Erreur");
    }
  }

  async function saveActionPlan() {
    try {
      const cfg = await api.patchSettings({
        actionPlanText: settings.actionPlanText || DEFAULT_ACTION_PLAN_TEXT,
      });
      setSettings(cfg);
      flash(true, "Plan d'action mis a jour.");
    } catch (ex) {
      flash(false, ex.message || "Erreur");
    }
  }

  async function resetActionPlan() {
    try {
      const cfg = await api.patchSettings({ actionPlanText: DEFAULT_ACTION_PLAN_TEXT });
      setSettings(cfg);
      flash(true, "Plan d'action reinitialise.");
    } catch (ex) {
      flash(false, ex.message || "Erreur");
    }
  }

  const heroPreview = settings.heroImagePath
    ? assetUrl(settings.heroImagePath)
    : HERO_FALLBACK;
  const hivePreview = settings.hiveImagePath
    ? assetUrl(settings.hiveImagePath)
    : HIVE_FALLBACK;

  if (!authed) {
    return (
      <div className="page dashboard-login-page">
        <div className="dashboard-login">
          <h1>Dashboard The BEES</h1>
          <p className="login-sub">Accès réservé au bureau. Entrez le mot de passe.</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              autoComplete="current-password"
            />
            {loginError && <p className="error-text">{loginError}</p>}
            <button type="submit" className="btn-login">
              Connexion
            </button>
          </form>
          <Link to="/" className="back-link">
            ← Retour au site public
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page dash-app">
      <aside className="dash-sidebar">
        <div className="dash-sidebar-brand">
          <span aria-hidden>🐝</span>
          The BEES
        </div>
        <nav className="dash-nav" aria-label="Sections">
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              className={tab === n.id ? "active" : ""}
              onClick={() => setTab(n.id)}
            >
              <span className="ic" aria-hidden>
                {n.ic}
              </span>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="dash-sidebar-foot">
          <Link to="/">Voir le site</Link>
          <button type="button" onClick={logout}>
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="dash-main">
        <header className="dash-main-header">
          <h1>
            {tab === "members" && "Membres du BDE"}
            {tab === "media" && "Médiathèque"}
            {tab === "site" && "Images du site public"}
            {tab === "inbox" && "Boîte suggestions"}
          </h1>
          <p>
            {tab === "members" &&
              "Ajoutez l’équipe, rédigez les textes « Qui suis-je ? » et importez une photo par personne."}
            {tab === "media" &&
              "Stockez vos visuels ici, puis assignez-les à la bannière ou à la section Esprit ruche."}
            {tab === "site" &&
              "Choisissez quelles images de la médiathèque s’affichent sur la page d’accueil."}
            {tab === "inbox" &&
              "Messages reçus depuis le site (anonymes ou avec e-mail selon le membre)."}
          </p>
        </header>

        {msg && <div className="dash-toast ok">{msg}</div>}
        {err && <div className="dash-toast err">{err}</div>}

        {tab === "members" && (
          <>
            <section className="dash-panel-pro">
              <h2>{editingId ? "Modifier un membre" : "Nouveau membre"}</h2>
              <p className="hint">
                Les champs ci-dessous alimentent la page « Qui suis-je ? ». Le genre
                détermine si l’e-mail est demandé pour les suggestions.
              </p>
              <form className="dash-form" onSubmit={saveMember}>
                <div className="dash-row">
                  <div>
                    <label>Nom complet</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label>Rôle</label>
                    <input
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      placeholder="ex. Présidente"
                    />
                  </div>
                </div>
                <div className="dash-row">
                  <div>
                    <label>Genre (suggestions)</label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    >
                      <option value="femme">Femme — e-mail requis</option>
                      <option value="homme">Homme — anonyme</option>
                      <option value="autre">Autre — anonyme</option>
                    </select>
                  </div>
                  <div>
                    <label>Ordre d’affichage</label>
                    <input
                      type="number"
                      value={form.order}
                      onChange={(e) =>
                        setForm({ ...form, order: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
                <label>Qui je suis (hors BDE)</label>
                <textarea
                  value={form.quiJeSuis}
                  onChange={(e) => setForm({ ...form, quiJeSuis: e.target.value })}
                />
                <label>Ce qui me motive</label>
                <textarea
                  value={form.ceQuiMeMotive}
                  onChange={(e) =>
                    setForm({ ...form, ceQuiMeMotive: e.target.value })
                  }
                />
                <label>Mes forces</label>
                <textarea
                  value={form.mesForces}
                  onChange={(e) => setForm({ ...form, mesForces: e.target.value })}
                />
                <label>Quand venir me voir</label>
                <textarea
                  value={form.quandMeVoir}
                  onChange={(e) =>
                    setForm({ ...form, quandMeVoir: e.target.value })
                  }
                />
                <label>Vision / engagement</label>
                <textarea
                  value={form.vision}
                  onChange={(e) => setForm({ ...form, vision: e.target.value })}
                />
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button type="submit" className="btn-primary">
                    {editingId ? "Enregistrer les modifications" : "Créer le membre"}
                  </button>
                  {editingId && (
                    <button type="button" className="dash-btn-sm" onClick={cancelEdit}>
                      Annuler l’édition
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className="dash-panel-pro">
              <h2>Équipe & photos</h2>
              <p className="hint">
                Survolez une carte puis cliquez sur la zone photo pour importer ou
                remplacer l’image affichée sur le site.
              </p>
              <div className="dash-members-grid">
                {members.map((m) => (
                  <article key={m._id} className="dash-m-card">
                    <div className="dash-m-photo-wrap">
                      {m.photoPath ? (
                        <img src={assetUrl(m.photoPath)} alt="" />
                      ) : (
                        <div className="dash-m-placeholder" aria-hidden>
                          🐝
                        </div>
                      )}
                      <label className="dash-upload-overlay">
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) =>
                            handlePhoto(m._id, e.target.files?.[0])
                          }
                        />
                        Importer une photo
                      </label>
                    </div>
                    <div className="dash-m-body">
                      <h3>{m.name}</h3>
                      <div className="slug">
                        {m.slug} · {m.gender}
                      </div>
                      <div className="dash-m-actions">
                        <button
                          type="button"
                          className="dash-btn-sm gold"
                          onClick={() => startEdit(m)}
                        >
                          Éditer le profil
                        </button>
                        <button
                          type="button"
                          className="dash-btn-sm danger"
                          onClick={() => removeMember(m._id)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}

        {tab === "media" && (
          <section className="dash-panel-pro">
            <h2>Ajouter des fichiers</h2>
            <p className="hint">
              JPEG, PNG, WebP ou GIF — jusqu’à ~12 Mo par fichier. Utilisez ensuite
              l’onglet « Images du site » pour la bannière et la section ruche.
            </p>
            <label
              className={`dash-dropzone ${dragMedia ? "drag" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragMedia(true);
              }}
              onDragLeave={() => setDragMedia(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragMedia(false);
                onMediaFiles(e.dataTransfer.files);
              }}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => onMediaFiles(e.target.files)}
              />
              <strong>Déposez des images ici</strong>
              <span>ou cliquez pour parcourir — plusieurs fichiers possibles</span>
            </label>

            <h2 style={{ marginTop: 8 }}>Bibliothèque ({mediaList.length})</h2>
            {mediaList.length === 0 ? (
              <p className="hint">Aucun média pour l’instant.</p>
            ) : (
              <div className="dash-media-grid">
                {mediaList.map((item) => (
                  <div key={item._id} className="dash-media-tile">
                    <img src={assetUrl(item.path)} alt="" />
                    <div className="tile-actions">
                      <button type="button" onClick={() => setHeroPath(item.path)}>
                        Bannière hero
                      </button>
                      <button type="button" onClick={() => setHivePath(item.path)}>
                        Section ruche
                      </button>
                      <button
                        type="button"
                        className="del"
                        onClick={() => deleteMediaItem(item._id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "site" && (
          <section className="dash-panel-pro">
            <h2>Aperçu public</h2>
            <p className="hint">
              Les visuels proviennent de la médiathèque. Sans choix, le site utilise
              des images par défaut.
            </p>
            <div className="dash-site-logo-row">
              <div>
                <h3 className="dash-subh">Logo (navbar & écran de chargement)</h3>
                <p className="hint">
                  PNG ou SVG avec fond transparent recommandé — carré ou large
                  fonctionne.
                </p>
                <div className="dash-logo-preview">
                  {settings.logoPath ? (
                    <img src={assetUrl(settings.logoPath)} alt="" />
                  ) : (
                    <span className="dash-logo-placeholder">🐝</span>
                  )}
                </div>
                <div className="dash-logo-actions">
                  <label className="dash-btn-sm gold" style={{ cursor: "pointer" }}>
                    Importer un logo
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) =>
                        handleLogoUpload(e.target.files?.[0])
                      }
                    />
                  </label>
                  {settings.logoPath && (
                    <button
                      type="button"
                      className="dash-btn-sm danger"
                      onClick={clearLogo}
                    >
                      Supprimer le logo
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="dash-site-slots">
              <div className="dash-site-slot">
                <h3>Bannière hero</h3>
                <div className="dash-site-preview">
                  <img src={heroPreview} alt="Aperçu bannière" />
                </div>
                <div className="slot-foot">
                  <button
                    type="button"
                    className="dash-btn-sm gold"
                    onClick={() => setPickerFor("hero")}
                  >
                    Choisir dans la médiathèque
                  </button>
                  {settings.heroImagePath && (
                    <button type="button" className="dash-btn-sm" onClick={clearHero}>
                      Revenir au défaut
                    </button>
                  )}
                </div>
              </div>
              <div className="dash-site-slot">
                <h3>Section Esprit ruche</h3>
                <div className="dash-site-preview hive">
                  <img src={hivePreview} alt="Aperçu ruche" />
                </div>
                <div className="slot-foot">
                  <button
                    type="button"
                    className="dash-btn-sm gold"
                    onClick={() => setPickerFor("hive")}
                  >
                    Choisir dans la médiathèque
                  </button>
                  {settings.hiveImagePath && (
                    <button type="button" className="dash-btn-sm" onClick={clearHive}>
                      Revenir au défaut
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="dash-action-plan-editor">
              <h3 className="dash-subh">Page "Plan d'action"</h3>
              <p className="hint">
                Ce texte alimente la page publique <code>/plan-action</code>. Conservez
                le format: titre entre * * , sections entre _ _ et puces avec "-".
              </p>
              <textarea
                value={settings.actionPlanText || ""}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, actionPlanText: e.target.value }))
                }
                rows={20}
              />
              <div className="dash-plan-actions">
                <button type="button" className="dash-btn-sm gold" onClick={saveActionPlan}>
                  Enregistrer le plan
                </button>
                <button type="button" className="dash-btn-sm" onClick={resetActionPlan}>
                  Revenir au plan par defaut
                </button>
              </div>
            </div>
          </section>
        )}

        {tab === "inbox" && (
          <section className="dash-panel-pro">
            <h2>Messages entrants</h2>
            <p className="hint">
              Conservez ou supprimez après traitement — il n’y a pas d’archivage
              automatique.
            </p>
            {suggestions.length === 0 && (
              <p className="hint">Aucun message pour l’instant.</p>
            )}
            {suggestions.map((s) => (
              <div key={s._id} className="suggestion-item">
                <div className="meta">
                  Pour : <strong>{s.memberId?.name || "—"}</strong>
                  {" · "}
                  {new Date(s.createdAt).toLocaleString("fr-FR")}
                  {s.isAnonymous ? (
                    <> · Anonyme</>
                  ) : (
                    <>
                      {" · "}
                      <a href={`mailto:${s.email}`}>{s.email}</a>
                    </>
                  )}
                </div>
                <p>{s.content}</p>
                <button
                  type="button"
                  className="dash-btn-sm danger"
                  style={{ marginTop: 12 }}
                  onClick={() => removeSuggestion(s._id)}
                >
                  Supprimer
                </button>
              </div>
            ))}
          </section>
        )}
      </main>

      {pickerFor && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setPickerFor(null)}
        >
          <div
            className="modal"
            style={{ maxWidth: 520 }}
            role="dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>
              {pickerFor === "hero"
                ? "Image bannière hero"
                : "Image section Esprit ruche"}
            </h3>
            <p className="sub">
              Sélectionnez un visuel déjà uploadé dans l’onglet Médias.
            </p>
            {mediaList.length === 0 ? (
              <p className="hint">La médiathèque est vide. Ajoutez des fichiers d’abord.</p>
            ) : (
              <div className="dash-picker-grid">
                {mediaList.map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    className="dash-picker-item"
                    onClick={() =>
                      pickerFor === "hero"
                        ? setHeroPath(item.path)
                        : setHivePath(item.path)
                    }
                  >
                    <img src={assetUrl(item.path)} alt="" />
                  </button>
                ))}
              </div>
            )}
            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button type="button" className="btn-muted" onClick={() => setPickerFor(null)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
