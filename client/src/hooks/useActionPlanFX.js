import { useEffect } from "react";

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

export function useActionPlanFX() {
  useEffect(() => {
    const root = document.documentElement;
    let rafId = 0;
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY || 0;
      const vh = window.innerHeight || 1;
      const progress = clamp01(y / Math.max(vh * 1.35, 1));
      root.style.setProperty("--plan-progress", String(progress));
      root.style.setProperty("--plan-y", `${y}px`);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      rafId = window.requestAnimationFrame(update);
    };

    let bounds = { cx: window.innerWidth / 2, cy: window.innerHeight / 2 };
    const onResize = () => {
      bounds = { cx: window.innerWidth / 2, cy: window.innerHeight / 2 };
      onScroll();
    };

    const onMouseMove = (e) => {
      const nx = (e.clientX - bounds.cx) / Math.max(bounds.cx, 1);
      const ny = (e.clientY - bounds.cy) / Math.max(bounds.cy, 1);
      root.style.setProperty("--plan-mx", `${nx * 24}px`);
      root.style.setProperty("--plan-my", `${ny * 20}px`);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("mousemove", onMouseMove);
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      if (rafId) window.cancelAnimationFrame(rafId);
      root.style.removeProperty("--plan-progress");
      root.style.removeProperty("--plan-y");
      root.style.removeProperty("--plan-mx");
      root.style.removeProperty("--plan-my");
    };
  }, []);
}
