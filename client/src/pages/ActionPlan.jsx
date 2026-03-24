import { useMemo } from "react";
import { useSiteSettings } from "../context/SettingsContext.jsx";
import { DEFAULT_ACTION_PLAN_TEXT } from "../constants/actionPlanDefault.js";
import SectionHexagons from "../components/SectionHexagons.jsx";
import { useActionPlanFX } from "../hooks/useActionPlanFX.js";

function parsePlan(text) {
  const lines = String(text || "")
    .split("\n")
    .map((l) => l.trimEnd());

  let title = "Plan d'action";
  const sections = [];
  let current = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith("*") && line.endsWith("*") && line.length > 2) {
      title = line.slice(1, -1).trim() || title;
      continue;
    }

    if (line.startsWith("_") && line.endsWith("_") && line.length > 2) {
      if (current) sections.push(current);
      current = { heading: line.slice(1, -1).trim(), items: [] };
      continue;
    }

    if (line.startsWith("-")) {
      if (!current) current = { heading: "Actions", items: [] };
      current.items.push(line.replace(/^-+\s*/, ""));
      continue;
    }

    if (!current) current = { heading: "Actions", items: [] };
    current.items.push(line);
  }

  if (current) sections.push(current);
  return { title, sections };
}

export default function ActionPlan() {
  const { settings } = useSiteSettings();
  const text = settings?.actionPlanText || DEFAULT_ACTION_PLAN_TEXT;
  const { title, sections } = useMemo(() => parsePlan(text), [text]);
  useActionPlanFX();

  return (
    <div className="page plan-page plan-page--hive">
      <section className="plan-hero plan-hero--tree">
        <SectionHexagons theme="light" />
        <div className="plan-tree-glow" aria-hidden />
        <div className="plan-tree-trunk" aria-hidden />
        <div className="plan-hero-content">
          <p className="plan-kicker">The BEES</p>
          <h1>{title}</h1>
          <p>
            Une feuille de route concrete pour accompagner les etudiants, renforcer la
            communaute et ameliorer la vie sur le campus.
          </p>
        </div>
      </section>

      <section className="plan-grid plan-grid--honeycomb" aria-label="Sections du plan d'action">
        {sections.map((sec, idx) => (
          <article
            key={`${sec.heading}-${idx}`}
            className={`plan-card plan-card--tree ${idx % 2 === 0 ? "plan-card--left" : "plan-card--right"}`}
            style={{ "--plan-i": idx }}
          >
            <span className="plan-branch plan-branch--stem" aria-hidden />
            <span className="plan-branch plan-branch--leaf" aria-hidden />
            <div className="plan-card-inner">
              <div className="plan-card-index">{String(idx + 1).padStart(2, "0")}</div>
              <h2>{sec.heading}</h2>
              <ul>
                {sec.items.map((item, i) => (
                  <li key={`${idx}-${i}`}>{item}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
