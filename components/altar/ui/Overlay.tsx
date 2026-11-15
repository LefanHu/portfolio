"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAltarStore } from "@/lib/altar/store";
import { ArrowLeftIcon, BookIcon, CloseIcon, HomeIcon, MoonIcon, SparkIcon, SunIcon } from "./icons";
import LogbookDrawer from "./LogbookDrawer";
import { uiVars } from "./tokens";
import "./ui.css";

/**
 * DOM controls over the canvas (z-index 50, above the projection's 40):
 * Classic site link + Logbook + theme toggle (top right), Back while a section is open (top left),
 * and a first-visit hint (bottom). Escape closes the logbook if it is open,
 * otherwise the open section. The container ignores the pointer, so orbit and
 * item dragging work everywhere except on the controls themselves.
 */
export default function Overlay() {
  const theme = useAltarStore((s) => s.theme);
  const phase = useAltarStore((s) => s.phase);
  const firstVisit = useAltarStore((s) => s.unlocked.length === 0);
  const toggleTheme = useAltarStore((s) => s.toggleTheme);
  const closeSection = useAltarStore((s) => s.closeSection);
  const [logbookOpen, setLogbookOpen] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
  const logbookButton = useRef<HTMLButtonElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  /** Whether focus goes back to the Logbook button once the drawer has closed. */
  const refocusLogbook = useRef(false);

  const idle = phase === "idle";
  const sectionOpen = phase === "revealing" || phase === "viewing";

  const closeLogbook = useCallback((openedSection = false) => {
    // a section it opened takes focus itself (below)
    refocusLogbook.current = !openedSection;
    setLogbookOpen(false);
  }, []);

  // After the drawer closes on its own, focus goes back to its opener.
  useEffect(() => {
    if (logbookOpen || !refocusLogbook.current) return;
    refocusLogbook.current = false;
    logbookButton.current?.focus();
  }, [logbookOpen]);

  // A reveal, however it started (logbook, board summon or cauldron), puts
  // focus on its Back button: Back mounts in the same commit.
  useEffect(() => {
    if (phase === "revealing") backButton.current?.focus();
  }, [phase]);

  // Closing a section removes whatever had focus (Back, or something in the
  // framed page). Rather than leave the keyboard nowhere, it goes to the
  // Logbook, the way back to every section.
  const sectionWasOpen = useRef(false);
  useEffect(() => {
    const closed = sectionWasOpen.current && !sectionOpen;
    sectionWasOpen.current = sectionOpen;
    // `.ap-root` is the projected page (SitePanel): it is still dissolving, and its frame may hold focus.
    const focused = document.activeElement;
    if (closed && (!focused || focused === document.body || focused.closest(".ap-root"))) {
      logbookButton.current?.focus();
    }
  }, [sectionOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // A held key repeats keydown; one press must not close the drawer and then the section.
      if (e.key !== "Escape" || e.defaultPrevented || e.repeat) return;
      if (logbookOpen) {
        e.preventDefault();
        closeLogbook();
        return;
      }
      const s = useAltarStore.getState();
      if (s.phase === "viewing" || s.phase === "revealing") {
        e.preventDefault();
        s.closeSection();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [logbookOpen, closeLogbook]);

  const showHint = firstVisit && !hintDismissed;

  return (
    <div className="au-themed au-overlay" data-theme={theme} style={uiVars(theme)}>
      {sectionOpen && (
        <div className="au-corner au-corner--left">
          <button
            ref={backButton}
            type="button"
            className="au-btn au-btn--back"
            onClick={closeSection}
            aria-label="Back to the altar"
            aria-keyshortcuts="Escape"
          >
            <ArrowLeftIcon />
            <span>Back</span>
            <kbd className="au-kbd" aria-hidden="true">
              Esc
            </kbd>
          </button>
        </div>
      )}

      <div className="au-corner au-corner--right" data-compact={!idle}>
        {idle && (
          <Link href="/" className="au-btn">
            <HomeIcon />
            <span className="au-btn__label">Classic site</span>
          </Link>
        )}
        <button
          ref={logbookButton}
          type="button"
          className="au-btn"
          data-compact={!idle}
          aria-label="Logbook"
          aria-haspopup="dialog"
          aria-expanded={logbookOpen}
          onClick={() => setLogbookOpen(true)}
        >
          <BookIcon />
          <span className="au-btn__label">Logbook</span>
        </button>
        <button
          type="button"
          className="au-btn au-btn--icon"
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          onClick={toggleTheme}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      {showHint && (
        <div className="au-hint" role="note" data-visible={idle && !logbookOpen}>
          <SparkIcon />
          <span>
            Drag two items into the cauldron, drop a relic in alone, click a recipe, or{" "}
            <button type="button" className="au-link" onClick={() => setLogbookOpen(true)}>
              open the Logbook
            </button>
            .
          </span>
          <button
            type="button"
            className="au-icon-btn au-icon-btn--small"
            aria-label="Dismiss hint"
            onClick={() => setHintDismissed(true)}
          >
            <CloseIcon />
          </button>
        </div>
      )}

      {logbookOpen && <LogbookDrawer onClose={closeLogbook} />}
    </div>
  );
}
