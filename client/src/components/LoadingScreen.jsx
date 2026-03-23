import { useEffect, useId, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { assetUrl } from "../api.js";
import { useSiteSettings } from "../context/SettingsContext.jsx";
import { HexSvg } from "./SectionHexagons.jsx";

const WORDS = ["Welcome", "to", "the", "hive"];

/** Hexagones dispersés, vitesses / délais variés pour effet ruche */
const LOADING_HEXES = [
  { key: "a", cls: "loading-hex--a", sw: 10, d: 0, dur: 5.6, rev: false },
  { key: "b", cls: "loading-hex--b", sw: 9, d: -0.8, dur: 4.9, rev: true },
  { key: "c", cls: "loading-hex--c", sw: 8, d: -1.4, dur: 5.2, rev: false },
  { key: "d", cls: "loading-hex--d", sw: 9, d: -0.3, dur: 4.4, rev: true },
  { key: "e", cls: "loading-hex--e", sw: 7, d: -2.1, dur: 6.1, rev: false },
  { key: "f", cls: "loading-hex--f", sw: 10, d: -1, dur: 5, rev: true },
  { key: "g", cls: "loading-hex--g", sw: 8, d: -0.5, dur: 4.7, rev: false },
  { key: "h", cls: "loading-hex--h", sw: 7, d: -1.8, dur: 5.5, rev: true },
  { key: "i", cls: "loading-hex--i", sw: 9, d: -2.6, dur: 6.3, rev: false },
  { key: "j", cls: "loading-hex--j", sw: 8, d: -0.2, dur: 4.2, rev: true },
  { key: "k", cls: "loading-hex--k", sw: 6, d: -3, dur: 5.8, rev: false },
  { key: "l", cls: "loading-hex--l", sw: 7, d: -1.2, dur: 4.6, rev: true },
];

function LoadingHexHive() {
  return (
    <div className="loading-screen__hex-field" aria-hidden>
      {LOADING_HEXES.map((h) => (
        <div
          key={h.key}
          className={`loading-hex ${h.cls} ${h.rev ? "loading-hex--rev" : ""}`}
          style={{
            "--hex-delay": `${h.d}s`,
            "--hex-dur": `${h.dur}s`,
          }}
        >
          <HexSvg theme="loading" strokeWidth={h.sw} />
        </div>
      ))}
    </div>
  );
}

/** Anneau lumineux (traînée type « poussière de fée ») + même durée que l’abeille */
function SparkleOrbitRing() {
  const uid = useId().replace(/:/g, "");
  const gid = `loadingSparkTrail-${uid}`;
  const fid = `loadingFairyGlow-${uid}`;

  return (
    <svg
      className="loading-screen__sparkle-svg"
      viewBox="0 0 240 240"
      aria-hidden
    >
      <defs>
        <linearGradient
          id={gid}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="35%" stopColor="#fff" stopOpacity="1" />
          <stop offset="50%" stopColor="#fffef0" stopOpacity="1" />
          <stop offset="65%" stopColor="#f0c016" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter
          id={fid}
          x="-80%"
          y="-80%"
          width="260%"
          height="260%"
        >
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b2" />
          <feMerge>
            <feMergeNode in="b2" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g className="loading-screen__sparkle-spin">
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
          stroke="#fff"
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
  );
}

export default function LoadingScreen({ onComplete }) {
  const { pathname } = useLocation();
  const { settings, ready } = useSiteSettings();
  const [wordCount, setWordCount] = useState(0);
  const [exit, setExit] = useState(false);
  const [logoIn, setLogoIn] = useState(false);
  const finished = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const finish = () => {
      if (finished.current) return;
      finished.current = true;
      onCompleteRef.current();
    };

    if (pathname === "/admin" || pathname === "/dashboard") {
      finish();
      return;
    }

    if (!ready) return;

    const t0 = 900;
    const step = 400;
    const lastWordAt = t0 + (WORDS.length - 1) * step;

    const tLogo = setTimeout(() => setLogoIn(true), 180);
    const wordTimers = WORDS.map((_, i) =>
      setTimeout(() => setWordCount(i + 1), t0 + i * step)
    );
    const tExit = setTimeout(() => setExit(true), lastWordAt + 850);
    const tDone = setTimeout(() => finish(), lastWordAt + 1950);

    return () => {
      clearTimeout(tLogo);
      wordTimers.forEach(clearTimeout);
      clearTimeout(tExit);
      clearTimeout(tDone);
    };
  }, [ready, pathname]);

  if (pathname === "/admin" || pathname === "/dashboard") return null;

  const logoSrc = settings?.logoPath ? assetUrl(settings.logoPath) : "";

  return (
    <div className={`loading-screen ${exit ? "loading-screen--exit" : ""}`}>
      <div className="loading-screen__yellow-bg" aria-hidden />
      <LoadingHexHive />
      <div className="loading-screen__grain" aria-hidden />

      <div className="loading-screen__inner">
        <div className="loading-screen__orbit-stage">
          <div className="loading-screen__orbit-layer loading-screen__orbit-layer--ring">
            <SparkleOrbitRing />
          </div>

          <div
            className={`loading-screen__logo-disk ${logoIn ? "loading-screen__logo-disk--in" : ""}`}
          >
            {logoSrc ? (
              <img
                className="loading-screen__logo-img"
                src={logoSrc}
                alt=""
              />
            ) : (
              <span className="loading-screen__logo-fallback" aria-hidden>
                🐝
              </span>
            )}
          </div>

          <div className="loading-screen__orbit-layer loading-screen__orbit-layer--bee">
            <div className="loading-screen__bee-orbit">
              <span className="loading-screen__bee" aria-hidden>
                🐝
              </span>
            </div>
          </div>
        </div>

        <p className="loading-screen__tagline">
          {WORDS.map((w, i) => (
            <span
              key={`${w}-${i}`}
              className={`loading-screen__word ${
                i < wordCount ? "loading-screen__word--visible" : ""
              }`}
            >
              {w}
            </span>
          ))}
        </p>

        {!ready && (
          <p className="loading-screen__wait" aria-live="polite">
            Loading…
          </p>
        )}
      </div>
    </div>
  );
}
