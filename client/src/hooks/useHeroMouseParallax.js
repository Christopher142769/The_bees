import { useLayoutEffect } from "react";

/**
 * Parallax souris subtil sur le hero (desktop) — met à jour --hero-mx / --hero-my en px.
 */
export function useHeroMouseParallax(heroRef) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia("(pointer: fine)");

    function reset() {
      root.style.setProperty("--hero-mx", "0px");
      root.style.setProperty("--hero-my", "0px");
    }

    function onMove(e) {
      const el = heroRef?.current;
      if (!el || !mq.matches) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const nx = (e.clientX - cx) / (r.width / 2);
      const ny = (e.clientY - cy) / (r.height / 2);
      const mx = Math.max(-1, Math.min(1, nx)) * 28;
      const my = Math.max(-1, Math.min(1, ny)) * 22;
      root.style.setProperty("--hero-mx", `${mx}px`);
      root.style.setProperty("--hero-my", `${my}px`);
    }

    function onLeave() {
      reset();
    }

    const el = heroRef?.current;
    if (!el) return;
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    window.addEventListener("scroll", reset, { passive: true });

    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("scroll", reset);
      reset();
    };
  }, [heroRef]);
}

