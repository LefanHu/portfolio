import { describe, expect, it } from "vitest";
import { ITEMS, type ItemId } from "@/lib/altar/items";
import { RECIPES, matchRecipe, type SectionId } from "@/lib/altar/recipes";
import { isRelic } from "@/lib/altar/relics";

const SECTIONS: SectionId[] = ["projects", "experience", "coding", "contact"];

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
    expect(matchRecipe(["coffeeMug", "notebook", "keyboard"])).toEqual({ kind: "invalid" });
  });

  it("matches the coding recipe: server rack + keyboard", () => {
    const r = matchRecipe(["serverRack", "keyboard"]);
    expect(r.kind === "match" && r.recipe.section).toBe("coding");
  });

  it("opens a relic dropped in alone", () => {
    expect(matchRecipe(["hiveHq"])).toEqual({ kind: "relic", relic: "hiveHq" });
    expect(matchRecipe(["drone"])).toEqual({ kind: "relic", relic: "drone" });
  });

  it("rejects a relic mixed with anything else", () => {
    expect(matchRecipe(["hiveHq", "keyboard"])).toEqual({ kind: "invalid" });
    expect(matchRecipe(["keyboard", "hiveHq"])).toEqual({ kind: "invalid" });
    expect(matchRecipe(["drone", "interqu"])).toEqual({ kind: "invalid" });
  });
});

describe("RECIPES", () => {
  it("covers every section exactly once", () => {
    expect(RECIPES).toHaveLength(4);
    expect(RECIPES.map((r) => r.section).sort()).toEqual([...SECTIONS].sort());
  });

  it("uses known items, and every non-relic item is used", () => {
    const used = new Set<ItemId>();
    for (const r of RECIPES) {
      for (const id of r.items) {
        expect(ITEMS[id]).toBeDefined();
        used.add(id);
      }
    }
    expect([...used].sort()).toEqual((Object.keys(ITEMS) as ItemId[]).filter((id) => !isRelic(id)).sort());
  });

  it("never uses a relic", () => {
    for (const r of RECIPES) for (const id of r.items) expect(isRelic(id), id).toBe(false);
  });

  it("has unique 7-char hex accents and titles", () => {
    const accents = RECIPES.map((r) => r.artifact.accent);
    for (const a of accents) expect(a).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(new Set(accents.map((a) => a.toLowerCase())).size).toBe(4);
    expect(new Set(RECIPES.map((r) => r.title)).size).toBe(4);
  });
});
