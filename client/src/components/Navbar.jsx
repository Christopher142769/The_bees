import { Link, useLocation } from "react-router-dom";
import { assetUrl } from "../api.js";
import { useSiteSettings } from "../context/SettingsContext.jsx";

export default function Navbar() {
  const { pathname } = useLocation();
  const { settings } = useSiteSettings();
  const onHome = pathname === "/";
  const logoSrc = settings?.logoPath ? assetUrl(settings.logoPath) : "";

  return (
    <div className="nav-wrap">
      <nav className="nav-bar" aria-label="Navigation principale">
        <Link
          to="/"
          className="nav-brand"
          aria-label="The BEES — Retour à l’accueil"
        >
          <span className="nav-logo-chip">
            {logoSrc ? (
              <img className="nav-logo" src={logoSrc} alt="" />
            ) : (
              <span className="nav-logo-fallback" aria-hidden>
                🐝
              </span>
            )}
          </span>
        </Link>
        <div className="nav-links">
          {onHome ? (
            <a href="#accueil">Accueil</a>
          ) : (
            <Link to="/#accueil">Accueil</Link>
          )}
          {onHome ? (
            <a href="#ruche">Vision</a>
          ) : (
            <Link to="/#ruche">Vision</Link>
          )}
          {onHome ? (
            <a href="#membres" className="nav-cta">
              Voir les membres
            </a>
          ) : (
            <Link to="/#membres" className="nav-cta">
              Voir les membres
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
