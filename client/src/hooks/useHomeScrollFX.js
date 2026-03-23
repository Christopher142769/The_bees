import { useLayoutEffect } from "react";

const HIVE_STAGGER_N = 7;

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

/** Progression 0→1 quand la section traverse le viewport ; retombe en sortant. */
function computeSectionReveal(rect, vh) {
  if (rect.bottom <= 0) return 0;
  if (rect.top >= vh) return 0;
  const enterEnd = vh * 0.92;
  const enterStart = vh * 0.2;
  const span = Math.max(1e-6, enterEnd - enterStart);
  let r = (enterEnd - rect.top) / span;
  r = clamp01(r);
  if (rect.bottom < vh * 0.52) {
    r *= clamp01(rect.bottom / (vh * 0.52));
  }
  return r;
}

function stagger(r, index, total, band = 0.13) {
  if (total <= 1) return clamp01(r);
  const start = (index / total) * (1 - band);
  const end = Math.min(1, start + band);
  if (end <= start) return clamp01(r);
  return clamp01((r - start) / (end - start));
}

/**
 * Parallax avancé (scroll) + variables CSS — pas de re-render React par frame.
 */
export function useHomeScrollFX({ heroRef, hiveRef, membersRef, footerRef }) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const vh = window.innerHeight;

      const hero = heroRef?.current;
      let heroProgress = 0;
      let bgShift = 0;
      let bgScale = 1.12;

      if (hero) {
        const rect = hero.getBoundingClientRect();
        const heroH = rect.height || 1;
        heroProgress = Math.min(
          1,
          Math.max(0, -rect.top / Math.max(vh * 0.62, heroH * 0.28))
        );

        const topAbs = y + rect.top;
        const span = heroH + vh;
        const u = Math.max(
          0,
          Math.min(1, (y - topAbs + vh * 0.28) / Math.max(1, span))
        );
        bgShift = u * heroH * 0.72 * 0.62 * 1.2;
        bgScale = 1.05 + u * 0.18;
      }

      root.style.setProperty("--hero-progress", String(heroProgress));
      root.style.setProperty("--hero-bg-shift", `${bgShift}px`);
      root.style.setProperty("--hero-bg-scale", String(bgScale));

      const hive = hiveRef?.current;
      let hiveReveal = 0;
      if (hive) {
        const hr = hive.getBoundingClientRect();
        const visible = hr.bottom > -100 && hr.top < vh + 100;
        const off = visible ? (hr.top - vh * 0.38) * -0.32 : 0;
        root.style.setProperty("--hive-parallax", `${off}px`);
        const hiveText = (hr.top - vh * 0.48) * 0.09;
        const hiveSplit = visible ? (hr.top - vh * 0.5) * 0.04 : 0;
        root.style.setProperty(
          "--hive-text-y",
          `${visible ? hiveText : 0}px`
        );
        root.style.setProperty("--hive-split-x", `${hiveSplit}px`);

        hiveReveal = computeSectionReveal(hr, vh);
        root.style.setProperty("--hive-reveal", String(hiveReveal));
        for (let i = 0; i < HIVE_STAGGER_N; i++) {
          root.style.setProperty(
            `--hive-s-${i}`,
            String(stagger(hiveReveal, i, HIVE_STAGGER_N, 0.11))
          );
        }
      } else {
        root.style.setProperty("--hive-parallax", "0px");
        root.style.setProperty("--hive-text-y", "0px");
        root.style.setProperty("--hive-split-x", "0px");
        root.style.setProperty("--hive-reveal", "0");
        for (let i = 0; i < HIVE_STAGGER_N; i++) {
          root.style.removeProperty(`--hive-s-${i}`);
        }
      }

      const mem = membersRef?.current;
      if (mem) {
        const mr = mem.getBoundingClientRect();
        const visible = mr.bottom > 0 && mr.top < vh;
        const headY = visible ? (mr.top - vh * 0.52) * 0.11 : 0;
        root.style.setProperty("--members-head-y", `${headY}px`);
        const gridY = visible ? (mr.top - vh * 0.36) * 0.07 : 0;
        root.style.setProperty("--members-grid-y", `${gridY}px`);

        const membersReveal = computeSectionReveal(mr, vh);
        root.style.setProperty("--members-reveal", String(membersReveal));
        root.style.setProperty(
          "--members-s-0",
          String(stagger(membersReveal, 0, 2, 0.2))
        );
        root.style.setProperty(
          "--members-s-1",
          String(stagger(membersReveal, 1, 2, 0.2))
        );
      } else {
        root.style.setProperty("--members-head-y", "0px");
        root.style.setProperty("--members-grid-y", "0px");
        root.style.removeProperty("--members-reveal");
        root.style.removeProperty("--members-s-0");
        root.style.removeProperty("--members-s-1");
      }

      const foot = footerRef?.current;
      if (foot) {
        const fr = foot.getBoundingClientRect();
        const visible = fr.bottom > -40 && fr.top < vh + 80;
        const fY = visible ? (fr.top - vh * 0.58) * 0.16 : 0;
        root.style.setProperty("--footer-parallax", `${fY}px`);

        const footerReveal = computeSectionReveal(fr, vh);
        root.style.setProperty("--footer-reveal", String(footerReveal));
        root.style.setProperty(
          "--footer-s-0",
          String(stagger(footerReveal, 0, 2, 0.22))
        );
        root.style.setProperty(
          "--footer-s-1",
          String(stagger(footerReveal, 1, 2, 0.22))
        );
      } else {
        root.style.setProperty("--footer-parallax", "0px");
        root.style.removeProperty("--footer-reveal");
        root.style.removeProperty("--footer-s-0");
        root.style.removeProperty("--footer-s-1");
      }

      root.style.setProperty("--hex-rotate", `${y * 0.042}deg`);
      root.style.setProperty("--hex-float", `${Math.sin(y * 0.0021) * 16}px`);
      root.style.setProperty("--hex-drift", `${Math.cos(y * 0.0018) * 10}px`);
    };

    const onFrame = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onFrame, { passive: true });
    window.addEventListener("resize", onFrame, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", onFrame);
      window.removeEventListener("resize", onFrame);
      root.style.removeProperty("--hero-progress");
      root.style.removeProperty("--hero-bg-shift");
      root.style.removeProperty("--hero-bg-scale");
      root.style.removeProperty("--hive-parallax");
      root.style.removeProperty("--hive-text-y");
      root.style.removeProperty("--hive-split-x");
      root.style.removeProperty("--hive-reveal");
      for (let i = 0; i < HIVE_STAGGER_N; i++) {
        root.style.removeProperty(`--hive-s-${i}`);
      }
      root.style.removeProperty("--members-head-y");
      root.style.removeProperty("--members-grid-y");
      root.style.removeProperty("--members-reveal");
      root.style.removeProperty("--members-s-0");
      root.style.removeProperty("--members-s-1");
      root.style.removeProperty("--footer-parallax");
      root.style.removeProperty("--footer-reveal");
      root.style.removeProperty("--footer-s-0");
      root.style.removeProperty("--footer-s-1");
      root.style.removeProperty("--hex-rotate");
      root.style.removeProperty("--hex-float");
      root.style.removeProperty("--hex-drift");
    };
  }, [heroRef, hiveRef, membersRef, footerRef]);
}
