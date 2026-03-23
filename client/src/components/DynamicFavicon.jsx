import { useEffect } from "react";
import { assetUrl } from "../api.js";
import { useSiteSettings } from "../context/SettingsContext.jsx";

const DEFAULT_FAVICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🐝</text></svg>`
  );

/**
 * Favicon à partir du logo : disque blanc, liseré or, deux abeilles (fixes — les onglets
 * ne gèrent pas d’animation comme l’écran de chargement).
 */
function buildFaviconDataUrl(logoSrc) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    /* Pas de crossOrigin : même origine OK ; sinon canvas peut rester « tainted » → fallback URL brute. */
    img.onload = () => {
      const s = 64;
      const canvas = document.createElement("canvas");
      canvas.width = s;
      canvas.height = s;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("no canvas"));
        return;
      }
      const cx = s / 2;
      const cy = s / 2;

      ctx.beginPath();
      ctx.arc(cx, cy, s / 2 - 1, 0, Math.PI * 2);
      ctx.fillStyle = "#e8b800";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, s / 2 - 5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      ctx.strokeStyle = "rgba(240, 192, 22, 0.9)";
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.arc(cx, cy, s / 2 - 5, 0, Math.PI * 2);
      ctx.stroke();

      const r = s / 2 - 9;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      const aspect = iw / ih;
      let dw;
      let dh;
      if (aspect >= 1) {
        dh = r * 2;
        dw = dh * aspect;
      } else {
        dw = r * 2;
        dh = dw / aspect;
      }
      ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
      ctx.restore();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(cx, cy, s / 2 - 3, -0.25, 0.95);
      ctx.stroke();

      ctx.font = `${Math.round(s * 0.16)}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🐝", cx, 6);
      ctx.fillText("🐝", cx, s - 6);

      try {
        resolve(canvas.toDataURL("image/png"));
      } catch {
        reject(new Error("toDataURL"));
      }
    };
    img.onerror = () => reject(new Error("img"));
    img.src = logoSrc;
  });
}

export default function DynamicFavicon() {
  const { settings, ready } = useSiteSettings();

  useEffect(() => {
    const link =
      document.querySelector("link#app-favicon") ||
      document.querySelector('link[rel="icon"]');
    if (!link) return;

    if (!ready || !settings?.logoPath) {
      link.href = DEFAULT_FAVICON;
      link.type = "image/svg+xml";
      return;
    }

    const url = assetUrl(settings.logoPath);
    let cancelled = false;

    buildFaviconDataUrl(url)
      .then((dataUrl) => {
        if (!cancelled) {
          link.href = dataUrl;
          link.type = "image/png";
        }
      })
      .catch(() => {
        if (!cancelled) {
          link.href = url;
          link.removeAttribute("type");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [ready, settings?.logoPath]);

  return null;
}
