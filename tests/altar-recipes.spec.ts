import { describe, expect, it } from "vitest";
import { ITEMS, type ItemId } from "@/lib/altar/items";
import { RECIPES, matchRecipe, type SectionId } from "@/lib/altar/recipes";

const SECTIONS: SectionId[] = ["about", "experience", "projects", "skills", "interests", "contact"];

describe("matchRecipe", () => {
  it("returns empty and partial", () => {
    expect(matchRecipe([])).toEqual({ kind: "empty" });
    expect(matchRecipe(["keyboard"])).toEqual({ kind: "partial" });
  });

  it("matches in either order", () => {
    for (const pair of [["keyboard", "driveUnit"], ["driveUnit", "keyboard"]] as ItemId[][]) {
      const r = matchRecipe(pair);
      expect(r.kind).toBe("match");
      if (r.kind === "match") expect(r.recipe.section).toBe("experience");
    }
  });

  it("rejects wrong pairs and oversized contents", () => {
    expect(matchRecipe(["keyboard", "notebook"])).toEqual({ kind: "invalid" });
    expect(matchRecipe(["tool", "notebook", "keyboard"])).toEqual({ kind: "invalid" });
  });
});

describe("RECIPES", () => {
  it("covers every section exactly once", () => {
    expect(RECIPES).toHaveLength(6);
    expect(RECIPES.map((r) => r.section).sort()).toEqual([...SECTIONS].sort());
  });

  it("uses known items, and every item is used", () => {
    const used = new Set<ItemId>();
    for (const r of RECIPES) {
      for (const id of r.items) {
        expect(ITEMS[id]).toBeDefined();
        used.add(id);
      }
    }
    expect([...used].sort()).toEqual((Object.keys(ITEMS) as ItemId[]).sort());
  });

  it("has unique 7-char hex accents and titles", () => {
    const accents = RECIPES.map((r) => r.artifact.accent);
    for (const a of accents) expect(a).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(new Set(accents.map((a) => a.toLowerCase())).size).toBe(6);
    expect(new Set(RECIPES.map((r) => r.title)).size).toBe(6);
  });
});
