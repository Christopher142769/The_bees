/**
 * Hexagones SVG — vrais contours, trait gras (flat-top).
 */
const STROKE = {
  dark: "#f0c016",
  light: "#d9ac00",
  gold: "#0a0a0a",
  /** Fond jaune écran de chargement */
  loading: "#1c1810",
};

/** Centre 50,50, rayon 34 — marge pour gros stroke */
const HEX_POINTS =
  "50,16 79.44,33 79.44,67 50,84 20.56,67 20.56,33";

export function HexSvg({ theme, strokeWidth, className = "" }) {
  const stroke = STROKE[theme] || STROKE.light;

  return (
    <svg
      className={`hex-svg${className ? ` ${className}` : ""}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      overflow="visible"
      aria-hidden
    >
      <polygon
        points={HEX_POINTS}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="miter"
        strokeMiterlimit="3.5"
        strokeLinecap="butt"
        vectorEffect="nonScalingStroke"
      />
    </svg>
  );
}

export default function SectionHexagons({ theme = "light" }) {
  const sw = { xl: 11, lg: 10, md: 9, sm: 8 };

  return (
    <div className={`hex-layer hex-layer--${theme}`} aria-hidden>
      <div className="hex-wrap hex--xl hex--tl">
        <HexSvg theme={theme} strokeWidth={sw.xl} />
      </div>
      <div className="hex-wrap hex--lg hex--tr">
        <HexSvg theme={theme} strokeWidth={sw.lg} />
      </div>
      <div className="hex-wrap hex--md hex--bl">
        <HexSvg theme={theme} strokeWidth={sw.md} />
      </div>
      <div className="hex-wrap hex--sm hex--br">
        <HexSvg theme={theme} strokeWidth={sw.sm} />
      </div>
      <div className="hex-wrap hex--md hex--mid-right">
        <HexSvg theme={theme} strokeWidth={sw.md} />
      </div>
    </div>
  );
}
