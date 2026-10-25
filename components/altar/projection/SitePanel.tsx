"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type SyntheticEvent } from "react";
import { STAGE_MS, WIRE_SEGMENT_MS } from "@/lib/altar/projection";
import type { Theme } from "@/lib/altar/store";
import { THEMES } from "@/lib/altar/theme";
import { viewAccent, viewKicker, viewTarget, viewTitle, type ViewId } from "@/lib/altar/views";
import { contact } from "@/lib/portfolio/contact";
import { prepareFrame, setFrameStage, type PanelStage } from "./siteFrame";
import { openExternalInNewTab } from "./wireTags";
import "./projection.css";

export type { PanelStage };

/** Keep pointer input on the panel: it never reaches the scene or the camera. */
const contain = (e: SyntheticEvent) => e.stopPropagation();

/** Escape (or a link back to /altar) inside the frame: hand it to the Overlay's window handler. */
const escapeToAltar = () => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

/** The frame's accessible name: it stays right after an in-frame navigation, unlike the view's title. */
const FRAME_TITLE = "Lefan's website (live)";
/** A frame still not prepared this long after mount is shown anyway: a slow or error page beats a blank pane. */
export const REVEAL_ANYWAY_MS = 8000;
/** How long after the frame leaves a page it watches for the next page's document. */
const NEXT_PAGE_WATCH_MS = 10_000;

/**
 * One view as a projected page: the themed frame header over the live site
 * in a same-origin iframe, at the view's page and scrolled to its section.
 * Sized by its parent (Projection sets the pixel size and base font).
 */
export default function SitePanel({ view, stage, theme = "dark" }: { view: ViewId; stage: PanelStage; theme?: Theme }) {
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const release = useRef<(() => void) | null>(null);
  /** The frame document last prepared: each document is prepared once. */
  const prepared = useRef<Document | null>(null);
  const stopWatching = useRef<(() => void) | null>(null);
  const stageNow = useRef(stage);
  /** The first document has been prepared (scrolled to the anchor, wire-tagged). */
  const [loaded, setLoaded] = useState(false);
  const [overdue, setOverdue] = useState(false);
  const { path, anchor } = viewTarget(view);
  const colors = THEMES[theme].projection;
  const shown = loaded || overdue;

  useLayoutEffect(() => {
    stageNow.current = stage;
  }, [stage]);

  // Stage changes after load reach the frame's document.
  useEffect(() => {
    const doc = frame.current?.contentDocument;
    if (loaded && doc) return setFrameStage(doc, stage);
  }, [loaded, stage]);

  useEffect(() => {
    const id = setTimeout(() => setOverdue(true), REVEAL_ANYWAY_MS);
    return () => {
      clearTimeout(id);
      stopWatching.current?.();
      release.current?.();
      release.current = null;
    };
  }, []);

  // The wheel never reaches the canvas from the frame chrome (inside the
  // iframe it never leaves the frame's document). ctrl+wheel keeps its default.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.stopPropagation();
      if (!e.ctrlKey) e.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  /** Prepare the frame's current document, once (a later call for the same document does nothing). */
  const prepare = () => {
    const el = frame.current;
    const doc = el?.contentDocument;
    const win = el?.contentWindow;
    if (!el || !doc || !win || doc === prepared.current) return;
    stopWatching.current?.();
    release.current?.();
    // the view's section on its first page only: a page navigated to in the frame starts at its top
    const target = prepared.current ? null : anchor;
    prepared.current = doc;
    const releaseFrame = prepareFrame(el, { anchor: target, stage: stageNow.current, onEscape: escapeToAltar });
    const onLeave = () => watchNextPage(doc);
    win.addEventListener("pagehide", onLeave);
    release.current = () => {
      releaseFrame();
      win.removeEventListener("pagehide", onLeave);
    };
    setLoaded(true);
  };

  /**
   * The frame is leaving `old` (an in-frame navigation): prepare the next
   * page as soon as its document is interactive, long before its `load`, so
   * its links are routed (no history entry, /altar closes) from the start.
   * Polls on the parent window's animation frames (the frame's own window is being replaced),
   * for at most NEXT_PAGE_WATCH_MS; `load` stays the fallback.
   */
  const watchNextPage = (old: Document) => {
    stopWatching.current?.();
    let raf = 0;
    let pending: Document | null = null;
    const onReadyState = () => {
      if (pending && pending.readyState !== "loading") prepare();
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      clearTimeout(deadline);
      pending?.removeEventListener("readystatechange", onReadyState);
      stopWatching.current = null;
    };
    const poll = () => {
      const doc = frame.current?.contentDocument;
      if (doc && doc !== old) {
        if (doc.readyState !== "loading") return prepare();
        if (doc !== pending) {
          pending?.removeEventListener("readystatechange", onReadyState);
          pending = doc;
          doc.addEventListener("readystatechange", onReadyState);
        }
      }
      raf = requestAnimationFrame(poll);
    };
    const deadline = setTimeout(stop, NEXT_PAGE_WATCH_MS);
    stopWatching.current = stop;
    raf = requestAnimationFrame(poll);
  };

  const style = {
    "--proj-line": colors.line,
    "--proj-fill": colors.fill,
    "--proj-text": colors.text,
    "--proj-accent": viewAccent(view),
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
      data-view={view}
      style={style}
      // the frame and its links are only reachable (pointer or keyboard) once filled in
      inert={stage !== "filled"}
      onPointerDown={contain}
      onClickCapture={openExternalInNewTab}
    >
      {/* the header draws in with the wire stage too (projection.css), as the site does in the frame */}
      <header className="ap-head" data-wire="box">
        <span className="ap-sigil" aria-hidden />
        <div className="ap-head__titles">
          <p className="ap-eyebrow" data-wire="text">
            {viewKicker(view)}
          </p>
          <h2 className="ap-title" data-wire="text">
            {viewTitle(view)}
          </h2>
        </div>
        {/* a live region, so it stays mounted; only its text changes */}
        <p className="ap-eyebrow ap-head__status" aria-live="polite">
          {loaded ? "" : "Loading…"}
        </p>
        {view === "contact" ? (
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
      <iframe
        ref={frame}
        className="ap-frame"
        title={FRAME_TITLE}
        src={path}
        // the fallback: a page in the frame is normally prepared once interactive (watchNextPage)
        onLoad={prepare}
        // hidden and unclickable until its first page is prepared (scrolled, wire-tagged, links
        // routed), then it fades in; shown anyway after REVEAL_ANYWAY_MS
        style={{ opacity: shown ? 1 : 0, pointerEvents: shown ? undefined : "none" }}
      />
    </div>
  );
}
