import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api, assetUrl } from "../api";
import SuggestionModal from "../components/SuggestionModal.jsx";
import FooterLogoOrbit from "../components/FooterLogoOrbit.jsx";
import SectionHexagons from "../components/SectionHexagons.jsx";
import { useSiteSettings } from "../context/SettingsContext.jsx";
import { useHomeScrollFX } from "../hooks/useHomeScrollFX.js";
import { useHeroMouseParallax } from "../hooks/useHeroMouseParallax.js";

export default function Home() {
  const location = useLocation();
  const { settings, ready: settingsReady } = useSiteSettings();
  const heroRef = useRef(null);
  const hiveRef = useRef(null);
  const membersRef = useRef(null);
  const footerRef = useRef(null);

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestFor, setSuggestFor] = useState(null);

  useHomeScrollFX({ heroRef, hiveRef, membersRef, footerRef });
  useHeroMouseParallax(heroRef);

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const m = await api.getMembers();
        if (!cancelled) setMembers(m);
      } catch {
        if (!cancelled) setMembers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const heroSrc =
    settingsReady && settings?.heroImagePath
      ? assetUrl(settings.heroImagePath)
      : null;
  const hiveSrc =
    settingsReady && settings?.hiveImagePath
      ? assetUrl(settings.hiveImagePath)
      : null;
  const footerLogoSrc =
    settingsReady && settings?.logoPath ? assetUrl(settings.logoPath) : "";

  return (
    <div className="page page--home">
      <section ref={heroRef} className="hero" id="accueil">
        <SectionHexagons theme="dark" />
        <div className="hero-bg" aria-hidden>
          <div
            className={`hero-parallax-layer ${!heroSrc ? "hero-parallax-layer--placeholder" : ""}`}
          >
            {heroSrc ? <img src={heroSrc} alt="" loading="eager" /> : null}
          </div>
        </div>
        <div className="hero-vignette" aria-hidden />
        <div className="hero-inner hero-inner--mouse">
          <div className="hero-reveal hero-reveal--title">
            <h1>
              <span className="hero-kicker">Nous sommes</span>{" "}
              <span className="accent">The BEES</span>
            </h1>
          </div>
          <div className="hero-reveal hero-reveal--lead">
            <p className="hero-lead">
              Une équipe qui travaille comme une ruche : chaque voix compte, chaque
              projet prend son envol. Jaune vif, noir profond, blanc pur — notre
              énergie, c’est vous.
            </p>
          </div>
          <div className="hero-reveal hero-reveal--cta">
            <div className="hero-cta-row">
              <a href="#membres" className="btn-primary">
                Découvrir l’équipe
              </a>
              <a href="#ruche" className="btn-ghost-light">
                Notre vision
              </a>
            </div>
          </div>
        </div>
        <a href="#ruche" className="hero-scroll-hint" aria-label="Descendre vers la suite">
          <span className="hero-scroll-hint__label">Entrer dans la ruche</span>
          <span className="hero-scroll-hint__mouse" aria-hidden>
            <span className="hero-scroll-hint__wheel" />
          </span>
          <span className="hero-scroll-hint__chev" aria-hidden />
        </a>
      </section>

      <section
        ref={hiveRef}
        className="section hive-section section--hex"
        id="ruche"
      >
        <SectionHexagons theme="light" />
        <div className="hive-split hive-split--parallax">
          <div className="hive-copy hive-copy--parallax">
            <div className="hive-sb hive-sb--0">
              <h2 className="hive-title">
                L’esprit <span className="accent">ruche</span>
              </h2>
            </div>
            <div className="hive-sb hive-sb--1">
              <p className="hive-lead">
                Ici, chaque rôle compte : comme dans une ruche, nous avançons
                ensemble, avec une{" "}
                <strong className="hive-accent">vision claire</strong> et une{" "}
                <strong className="hive-accent">énergie commune</strong>.
              </p>
            </div>
            <div className="hive-sb hive-sb--2">
              <p className="hive-para">
                Les abeilles ne construisent pas seulement du miel — elles
                coordonnent, protègent et font grandir leur communauté.{" "}
                <span className="hive-accent-strong">The BEES</span>, c’est le même
                engagement au service des étudiants : exigence, bienveillance et
                action concrète.
              </p>
            </div>
            <div className="hive-sb hive-sb--3">
              <h3 className="hive-subtitle">Ce qui nous rassemble</h3>
            </div>
            <div className="hive-sb hive-sb--4">
              <p className="hive-para">
                Des <strong className="hive-accent">projets porteurs de sens</strong>
                , une écoute réelle, et l’envie de{" "}
                <strong className="hive-accent">dépasser le statu quo</strong> pour
                que chaque année sur le campus soit plus vivante que la précédente.
              </p>
            </div>
          </div>
          <div className="hive-image-card hive-image-card--parallax">
            <div className="hive-sb hive-sb--5 hive-sb--media">
              <div
                className={`hive-image-inner ${!hiveSrc ? "hive-image-inner--placeholder" : ""}`}
              >
                {hiveSrc ? (
                  <img src={hiveSrc} alt="Ruche et abeilles — esprit The BEES" />
                ) : null}
              </div>
            </div>
            <div className="hive-sb hive-sb--6">
              <p className="hive-image-caption">
                Travail collectif, résultats visibles.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={membersRef}
        className="section section-dark section--hex"
        id="membres"
      >
        <SectionHexagons theme="dark" />
        <div className="section-head section-head--parallax">
          <div className="members-sb members-sb--0">
            <h2>Les membres</h2>
          </div>
          <div className="members-sb members-sb--1">
            <p>
              Cliquez sur « Qui suis-je ? » pour lire leur parcours et leur
              engagement. À côté, « Suggestions » pour leur écrire — anonyme pour
              les membres hommes, avec e-mail pour les membres féminins.
            </p>
          </div>
        </div>

        {loading && (
          <p className="empty-state" style={{ color: "rgba(255,255,255,0.5)" }}>
            Chargement…
          </p>
        )}
        {!loading && members.length === 0 && (
          <div className="empty-state" style={{ color: "rgba(255,255,255,0.5)" }}>
            <p>Aucun membre pour le moment.</p>
            <p style={{ fontSize: 14, marginTop: 8 }}>
              Ajoutez-les depuis l’administration (/admin).
            </p>
          </div>
        )}

        <div className="members-grid members-grid--parallax">
          {members.map((m) => (
            <article key={m._id} className="member-card">
              <div className="member-card-photo">
                {m.photoPath ? (
                  <img src={assetUrl(m.photoPath)} alt="" />
                ) : (
                  <div className="placeholder" aria-hidden>
                    🐝
                  </div>
                )}
              </div>
              <div className="member-card-body">
                <h3>{m.name}</h3>
                <p className="role">{m.role || "Membre du BDE"}</p>
                <div className="card-actions">
                  <Link
                    className="btn-card btn-card-primary"
                    to={`/membre/${m.slug}`}
                  >
                    Qui suis-je ?
                  </Link>
                  <button
                    type="button"
                    className="btn-card btn-card-secondary"
                    onClick={() => setSuggestFor(m)}
                  >
                    Suggestions
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer ref={footerRef} className="footer-hive footer-hive--hex">
        <div className="footer-hive__topfade" aria-hidden />
        <SectionHexagons theme="gold" />
        <div className="footer-hive-inner footer-hive-inner--parallax">
          <div className="footer-sb footer-sb--0">
            <div className="footer-brand">
              <FooterLogoOrbit logoSrc={footerLogoSrc} />
              <div className="footer-brand__text">
                <div className="logo-line">The BEES — Bureau des Étudiants</div>
              </div>
            </div>
          </div>
          <div className="footer-sb footer-sb--1">
            <p className="footer-tagline">
              Construire ensemble, comme dans une ruche.
            </p>
          </div>
        </div>
      </footer>

      {suggestFor && (
        <SuggestionModal
          member={suggestFor}
          onClose={() => setSuggestFor(null)}
        />
      )}
    </div>
  );
}
