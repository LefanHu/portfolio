"use client";

import { useEffect, useRef, type KeyboardEvent } from "react";
import { ITEMS } from "@/lib/altar/items";
import { RECIPES } from "@/lib/altar/recipes";
import { RELICS, type RelicId } from "@/lib/altar/relics";
import { useAltarStore } from "@/lib/altar/store";
import { ALL_VIEWS, viewKicker, type ViewId } from "@/lib/altar/views";
import { CheckIcon, ChevronIcon, CloseIcon } from "./icons";
import { accentVars } from "./tokens";

const RELIC_IDS = Object.keys(RELICS) as RelicId[];

/**
 * The logbook: every recipe's section and every relic's project, openable
 * directly without crafting, in two groups (Recipes, Relics). The footer
 * counts all views. A modal drawer: focus moves in on open and is kept inside
 * (Tab wraps); the caller handles Escape and puts focus back on close.
 */
export default function LogbookDrawer({ onClose }: { onClose(openedSection?: boolean): void }) {
  const theme = useAltarStore((s) => s.theme);
  const unlocked = useAltarStore((s) => s.unlocked);
  const idle = useAltarStore((s) => s.phase === "idle");
  const openSection = useAltarStore((s) => s.openSection);
  const panel = useRef<HTMLDivElement>(null);
  const count = ALL_VIEWS.filter((v) => unlocked.includes(v)).length;

  // Focus the first section (or the close button if sections can't be opened right now).
  useEffect(() => {
    const first = panel.current?.querySelector<HTMLElement>("button:not(:disabled)[data-section]");
    (first ?? panel.current?.querySelector<HTMLElement>("button"))?.focus();
  }, []);

  const trapTab = (e: KeyboardEvent) => {
    if (e.key !== "Tab" || !panel.current) return;
    const focusables = [...panel.current.querySelectorAll<HTMLElement>("button:not(:disabled)")];
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && (document.activeElement === first || !panel.current.contains(document.activeElement))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const open = (id: ViewId) => {
    if (!idle) return;
    openSection(id);
    onClose(true);
  };

  return (
    <>
      <div className="au-scrim" onClick={() => onClose()} aria-hidden="true" />
      <div
        ref={panel}
        className="au-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="au-logbook-title"
        aria-describedby="au-logbook-desc"
        onKeyDown={trapTab}
      >
        <header className="au-drawer__head">
          <h2 id="au-logbook-title" className="au-drawer__title">
            Logbook
          </h2>
          <button type="button" className="au-icon-btn" onClick={() => onClose()} aria-label="Close logbook">
            <CloseIcon />
          </button>
        </header>
        <p id="au-logbook-desc" className="au-drawer__desc">
          {idle
            ? "Open any recipe or relic directly. No crafting needed."
            : "Return to the altar to open another section."}
        </p>
        <div className="au-drawer__list">
          <h3 id="au-logbook-recipes" className="au-drawer__group-title">
            Recipes
          </h3>
          <ul className="au-drawer__group" aria-labelledby="au-logbook-recipes">
            {RECIPES.map((r) => {
              const done = unlocked.includes(r.section);
              return (
                <li
                  key={r.section}
                  data-section={r.section}
                  data-unlocked={done}
                  style={accentVars(r.artifact.accent, theme)}
                >
                  <button
                    type="button"
                    className="au-entry"
                    data-section={r.section}
                    disabled={!idle}
                    onClick={() => open(r.section)}
                  >
                    <span className="au-sigil" aria-hidden="true" />
                    <span className="au-entry__text">
                      <span className="au-entry__title">{r.title}</span>
                      <span className="au-entry__artifact">{r.artifact.name}</span>
                      <span className="au-entry__recipe">
                        {ITEMS[r.items[0]].short} + {ITEMS[r.items[1]].short}
                      </span>
                    </span>
                    <EntryStatus done={done} />
                  </button>
                </li>
              );
            })}
          </ul>
          <h3 id="au-logbook-relics" className="au-drawer__group-title">
            Relics
          </h3>
          <ul className="au-drawer__group" aria-labelledby="au-logbook-relics">
            {RELIC_IDS.map((id) => {
              const { slug, accent } = RELICS[id];
              const done = unlocked.includes(slug);
              return (
                <li key={id} data-relic={slug} data-unlocked={done} style={accentVars(accent, theme)}>
                  <button type="button" className="au-entry" disabled={!idle} onClick={() => open(slug)}>
                    <span className="au-sigil" aria-hidden="true" />
                    <span className="au-entry__text">
                      <span className="au-entry__title">{ITEMS[id].short}</span>
                      <span className="au-entry__artifact">{viewKicker(slug)}</span>
                    </span>
                    <EntryStatus done={done} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <footer className="au-drawer__foot">
          <span>
            {count} of {ALL_VIEWS.length} unlocked
          </span>
          <span className="au-pips" aria-hidden="true">
            {RECIPES.map((r) => (
              <i key={r.section} data-on={unlocked.includes(r.section)} style={accentVars(r.artifact.accent, theme)} />
            ))}
          </span>
        </footer>
      </div>
    </>
  );
}

/** The entry's trailing mark: a tick once unlocked, a chevron before. */
function EntryStatus({ done }: { done: boolean }) {
  return (
    <span className="au-entry__status">
      {done ? (
        <>
          <CheckIcon />
          <span className="au-sr">Unlocked</span>
        </>
      ) : (
        <ChevronIcon />
      )}
    </span>
  );
}
