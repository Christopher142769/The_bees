import { useId } from "react";

/**
 * Logo dans disque blanc + anneau lumineux + deux abeilles en orbite (comme l’écran de chargement).
 */
export default function FooterLogoOrbit({ logoSrc }) {
  const uid = useId().replace(/:/g, "");
  const gid = `footerSparkTrail-${uid}`;
  const fid = `footerFairyGlow-${uid}`;

  return (
    <div className="footer-orbit">
      <div className="footer-orbit__layer footer-orbit__layer--ring" aria-hidden>
        <svg className="footer-orbit__svg" viewBox="0 0 240 240">
          <defs>
            <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0" />
              <stop offset="35%" stopColor="#fff" stopOpacity="1" />
              <stop offset="50%" stopColor="#fffef0" stopOpacity="1" />
              <stop offset="65%" stopColor="#1a1510" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <filter id={fid} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="2.2" result="b" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="b2" />
              <feMerge>
                <feMergeNode in="b2" />
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g className="footer-orbit__sparkle-spin">
            <circle
              cx="120"
              cy="120"
              r="102"
              fill="none"
              stroke={`url(#${gid})`}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="28 72"
              pathLength="100"
              filter={`url(#${fid})`}
            />
            <circle
              cx="120"
              cy="120"
              r="102"
              fill="none"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="10 90"
              pathLength="100"
              opacity="0.75"
              filter={`url(#${fid})`}
              transform="rotate(18 120 120)"
            />
          </g>
        </svg>
      </div>

      <div className="footer-orbit__disk">
        {logoSrc ? (
          <img src={logoSrc} alt="" />
        ) : (
          <span className="footer-orbit__placeholder" aria-hidden>
            🐝
          </span>
        )}
      </div>

      <div className="footer-orbit__layer footer-orbit__layer--bee" aria-hidden>
        <div className="footer-orbit__bee-spin">
          <span className="footer-orbit__bee footer-orbit__bee--a">🐝</span>
          <span className="footer-orbit__bee footer-orbit__bee--b">🐝</span>
        </div>
      </div>
    </div>
  );
}
