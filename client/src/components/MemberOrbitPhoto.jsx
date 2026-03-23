import { useId } from "react";

/**
 * Photo circulaire + anneau lumineux + abeille en orbite (comme l’écran de chargement), boucle infinie.
 */
export default function MemberOrbitPhoto({ src, name }) {
  const uid = useId().replace(/:/g, "");
  const gid = `memberSparkTrail-${uid}`;
  const fid = `memberFairyGlow-${uid}`;

  return (
    <div className="member-orbit">
      <div className="member-orbit__layer member-orbit__layer--ring" aria-hidden>
        <svg className="member-orbit__svg" viewBox="0 0 240 240">
          <defs>
            <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f0c016" stopOpacity="0" />
              <stop offset="35%" stopColor="#fff" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#fffef0" stopOpacity="1" />
              <stop offset="65%" stopColor="#f0c016" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f0c016" stopOpacity="0" />
            </linearGradient>
            <filter id={fid} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="2.5" result="b" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b2" />
              <feMerge>
                <feMergeNode in="b2" />
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g className="member-orbit__sparkle-spin">
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
              stroke="rgba(255,255,255,0.75)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="10 90"
              pathLength="100"
              opacity="0.85"
              filter={`url(#${fid})`}
              transform="rotate(18 120 120)"
            />
          </g>
        </svg>
      </div>

      <div className="member-orbit__disk">
        {src ? (
          <img src={src} alt={name} />
        ) : (
          <span className="member-orbit__placeholder" aria-hidden>
            🐝
          </span>
        )}
      </div>

      <div className="member-orbit__layer member-orbit__layer--bee" aria-hidden>
        <div className="member-orbit__bee-spin">
          <span className="member-orbit__bee">🐝</span>
        </div>
      </div>
    </div>
  );
}
