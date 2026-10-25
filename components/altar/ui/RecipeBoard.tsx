"use client";

import { ITEMS } from "@/lib/altar/items";
import { RECIPES } from "@/lib/altar/recipes";
import { useAltarStore } from "@/lib/altar/store";
import { CheckIcon } from "./icons";
import { accentVars, uiVars } from "./tokens";
import "./ui.css";

/**
 * The always-visible recipe list: "Item + Item → Section", unlocked entries
 * marked in their artifact's accent. Plain DOM; the scene hangs it beside the
 * island through <Html transform> (RecipeBoardInScene), which sets its width
 * and base font. Purely informational: it never takes pointer input, and it
 * fades out while a section is open so it can't overlap the projection.
 */
export default function RecipeBoard() {
  const theme = useAltarStore((s) => s.theme);
  const unlocked = useAltarStore((s) => s.unlocked);
  const visible = useAltarStore((s) => s.phase === "idle");
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
      <ol className="au-board__list">
        {RECIPES.map((r) => {
          const done = unlocked.includes(r.section);
          const [a, b] = r.items;
          return (
            <li
              key={r.section}
              className="au-recipe"
              data-section={r.section}
              data-unlocked={done}
              style={accentVars(r.artifact.accent, theme)}
            >
              <span className="au-sigil" aria-hidden="true" />
              <span className="au-recipe__body">
                <span className="au-recipe__items">
                  {ITEMS[a].short}
                  <span className="au-recipe__plus"> + </span>
                  {ITEMS[b].short}
                </span>
                <span className="au-recipe__title">
                  <span className="au-recipe__arrow">→ </span>
                  {r.title}
                </span>
              </span>
              {done && (
                <span className="au-recipe__done">
                  <CheckIcon />
                  <span className="au-sr">Unlocked</span>
                </span>
              )}
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
