"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  type ComponentType,
  type CSSProperties,
  type RefObject,
  type SyntheticEvent,
} from "react";
import { STAGE_MS, WIRE_SEGMENT_MS, wireDelays } from "@/lib/altar/projection";
import { RECIPES, type SectionId } from "@/lib/altar/recipes";
import type { Theme } from "@/lib/altar/store";
import { THEMES } from "@/lib/altar/theme";
import { createWheelScroller } from "./panelScroll";
import AboutPanel from "./sections/AboutPanel";
import ContactPanel from "./sections/ContactPanel";
import ExperiencePanel from "./sections/ExperiencePanel";
import InterestsPanel from "./sections/InterestsPanel";
import ProjectsPanel from "./sections/ProjectsPanel";
import SkillsPanel from "./sections/SkillsPanel";
import "./projection.css";

/** wire: outlines draw in. filled: real content fades in. dissolve: collapses and fades out. */
export type PanelStage = "wire" | "filled" | "dissolve";

const PANELS: Record<SectionId, ComponentType> = {
  about: AboutPanel,
  experience: ExperiencePanel,
  projects: ProjectsPanel,
  skills: SkillsPanel,
  interests: InterestsPanel,
  contact: ContactPanel,
};

/** Keep pointer input on the panel: it never reaches the scene or the camera. */
const contain = (e: SyntheticEvent) => e.stopPropagation();

/**
 * Wheel over the panel scrolls it (see panelScroll.ts for why this is done in
 * JS) and never reaches the canvas. ctrl+wheel (pinch) keeps its default.
 */
function useWheelScroll(root: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = root.current;
    const scroller = el?.querySelector<HTMLElement>(".ap-scroll");
    if (!el || !scroller) return;
    const wheel = createWheelScroller(scroller);
    const onWheel = (e: WheelEvent) => {
      e.stopPropagation();
      if (wheel.onWheel(e)) e.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      wheel.dispose();
    };
  }, [root]);
}

/**
 * One portfolio section as a projected page. Plain DOM; sized by its parent
 * (Projection sets the pixel size and base font), colored by CSS variables.
 */
export default function SectionPanel({
  section,
  stage,
  theme = "dark",
}: {
  section: SectionId;
  stage: PanelStage;
  theme?: Theme;
}) {
  const root = useRef<HTMLDivElement>(null);
  const recipe = RECIPES.find((r) => r.section === section)!;
  const colors = THEMES[theme].projection;
  const Body = PANELS[section];
  useWheelScroll(root);

  // Stagger the line-draw of every wire block in document order.
  useLayoutEffect(() => {
    const blocks = root.current?.querySelectorAll<HTMLElement>("[data-wire]");
    if (!blocks) return;
    const delays = wireDelays(blocks.length, STAGE_MS.wire, WIRE_SEGMENT_MS);
    blocks.forEach((el, i) => el.style.setProperty("--wd", `${Math.round(delays[i])}ms`));
  }, [section]);

  const style = {
    "--proj-line": colors.line,
    "--proj-fill": colors.fill,
    "--proj-text": colors.text,
    "--proj-accent": recipe.artifact.accent,
    "--ap-seg": `${WIRE_SEGMENT_MS}ms`,
    "--ap-fill": `${STAGE_MS.fill}ms`,
    "--ap-dissolve": `${STAGE_MS.dissolve}ms`,
  } as CSSProperties;

  return (
    <div
      ref={root}
      className="ap-root"
      data-stage={stage}
      data-theme={theme}
      data-section={section}
      style={style}
      // links are only reachable (pointer or keyboard) once the content is filled in
      inert={stage !== "filled"}
      onPointerDown={contain}
    >
      <header className="ap-head" data-wire="box">
        <span className="ap-sigil" aria-hidden />
        <div className="ap-head__titles">
          <p className="ap-eyebrow" data-wire="text">
            {recipe.artifact.name}
          </p>
          <h2 className="ap-title" data-wire="text">
            {recipe.title}
          </h2>
        </div>
        <span className="ap-head__ticks" aria-hidden>
          <i />
          <i />
          <i />
        </span>
      </header>
      {/* focusable so arrow keys / Page Up/Down / Space scroll it (natively) */}
      <div className="ap-scroll" tabIndex={0}>
        <Body />
      </div>
    </div>
  );
}
