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
import ContactForm from "@/components/ContactForm";
import { AboutSummary, TechnicalSkills } from "@/components/portfolio/PortfolioAbout";
import Experiences from "@/components/portfolio/PortfolioExperiences";
import FavProjects from "@/components/portfolio/PortfolioProjects";
import Interests from "@/components/portfolio/PortfolioInterests";
import { contact } from "@/lib/portfolio/contact";
import { createWheelScroller } from "./panelScroll";
import { openExternalInNewTab, tagWireBlocks } from "./wireTags";
import "./projection.css";

/** wire: outlines draw in. filled: real content fades in. dissolve: collapses and fades out. */
export type PanelStage = "wire" | "filled" | "dissolve";

/** The main site's own section components, one per recipe. */
const PANELS: Record<SectionId, ComponentType> = {
  about: AboutSummary,
  skills: TechnicalSkills,
  experience: Experiences,
  projects: FavProjects,
  interests: Interests,
  contact: ContactForm,
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

  // The site's components carry no wire markup: tag their blocks, then stagger
  // the line-draw of every wire block in document order.
  useLayoutEffect(() => {
    const el = root.current;
    const scroller = el?.querySelector<HTMLElement>(".ap-scroll");
    if (!el || !scroller) return;
    tagWireBlocks(scroller);
    const blocks = el.querySelectorAll<HTMLElement>("[data-wire]");
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
      onClickCapture={openExternalInNewTab}
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
        {section === "contact" ? (
          // the main site's contact block has no resume link; this recipe is "Resume & Contact"
          <a className="ap-head__action" href={contact.resumeHref} target="_blank" rel="noopener noreferrer">
            Download résumé
          </a>
        ) : null}
        <span className="ap-head__ticks" aria-hidden>
          <i />
          <i />
          <i />
        </span>
      </header>
      {/* focusable so arrow keys / Page Up/Down / Space scroll it (natively) */}
      <div className="ap-scroll" tabIndex={0}>
        <div className="ap-site">
          <Body />
        </div>
      </div>
    </div>
  );
}
