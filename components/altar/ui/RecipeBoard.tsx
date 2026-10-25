"use client";

import type { SyntheticEvent } from "react";
import { ITEMS } from "@/lib/altar/items";
import { RECIPES } from "@/lib/altar/recipes";
import { useAltarStore } from "@/lib/altar/store";
import { CheckIcon } from "./icons";
import { accentVars, uiVars } from "./tokens";
import "./ui.css";

/** Keep pointer input on the list: a click or wheel on a row never reaches the canvas (camera orbit, zoom, raycast). */
const contain = (e: SyntheticEvent) => e.stopPropagation();

/**
 * The always-visible recipe list: "Item + Item → Section", unlocked entries
 * marked in their artifact's accent. Plain DOM; the scene hangs it beside the
 * island through <Html transform> (RecipeBoardInScene), which sets its width
 * and base font. Each row is a button: hovering or focusing it highlights the
 * recipe's two items on the desk, clicking it summons them into the cauldron.
 * Rows are disabled unless the altar is idle and no summon is under way. The
 * list takes pointer input, and contains it (no orbit, zoom or raycast from a
 * click or wheel on a row); the header and footer let it through to the scene.
 * The board fades out while a section is open so it can't overlap the projection.
 */
export default function RecipeBoard() {
  const theme = useAltarStore((s) => s.theme);
  const unlocked = useAltarStore((s) => s.unlocked);
  const visible = useAltarStore((s) => s.phase === "idle");
  const summoning = useAltarStore((s) => s.summoning);
  const summonSection = useAltarStore((s) => s.summonSection);
  const setHighlight = useAltarStore((s) => s.setHighlight);
  const summonRecipe = useAltarStore((s) => s.summonRecipe);
  const canSummon = visible && !summoning;
  const count = RECIPES.filter((r) => unlocked.includes(r.section)).length;

  return (
    <section
      className="au-themed au-board"
      data-theme={theme}
      data-visible={visible}
      aria-hidden={visible ? undefined : true}
      aria-labelledby="au-board-title"
      style={uiVars(theme)}
    >
      <header className="au-board__head">
        <p className="au-eyebrow">Altar recipes</p>
        <h2 id="au-board-title" className="au-board__title">
          Combine two items
        </h2>
      </header>
      <ol className="au-board__list" onPointerDown={contain} onWheel={contain}>
        {RECIPES.map((r) => {
          const done = unlocked.includes(r.section);
          const [a, b] = r.items;
          return (
            <li
              key={r.section}
              className="au-recipe"
              data-section={r.section}
              data-unlocked={done}
              data-summoning={summonSection === r.section ? true : undefined}
              style={accentVars(r.artifact.accent, theme)}
            >
              <button
                type="button"
                className="au-recipe__btn"
                aria-label={`${ITEMS[a].short} + ${ITEMS[b].short}: summon`}
                // the label replaces the button's text (and starts with it, WCAG 2.5.3); the description restores the destination and unlocked state
                aria-describedby={`au-recipe-${r.section}-title au-recipe-${r.section}-done`}
                disabled={!canSummon}
                onClick={() => summonRecipe(r.section)}
                onPointerEnter={() => canSummon && setHighlight(r.section)}
                onPointerLeave={() => setHighlight(null)}
                onFocus={() => canSummon && setHighlight(r.section)}
                onBlur={() => setHighlight(null)}
              >
                <span className="au-sigil" aria-hidden="true" />
                <span className="au-recipe__body">
                  <span className="au-recipe__items">
                    {ITEMS[a].short}
                    <span className="au-recipe__plus"> + </span>
                    {ITEMS[b].short}
                  </span>
                  <span id={`au-recipe-${r.section}-title`} className="au-recipe__title">
                    <span className="au-recipe__arrow" aria-hidden="true">
                      →{" "}
                    </span>
                    {r.title}
                  </span>
                </span>
                {done && (
                  <span id={`au-recipe-${r.section}-done`} className="au-recipe__done">
                    <CheckIcon />
                    <span className="au-sr">Unlocked</span>
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
      <footer className="au-board__foot">
        <span>
          {count} of {RECIPES.length} unlocked
        </span>
        <span className="au-pips" aria-hidden="true">
          {RECIPES.map((r) => (
            <i
              key={r.section}
              data-on={unlocked.includes(r.section)}
              style={accentVars(r.artifact.accent, theme)}
            />
          ))}
        </span>
      </footer>
    </section>
  );
}
