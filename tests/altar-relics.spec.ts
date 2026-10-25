import { describe, expect, it } from "vitest";
import { ITEMS, type ItemId } from "@/lib/altar/items";
import { RELICS, isRelic, type RelicId } from "@/lib/altar/relics";
import { acceleratorProject, projects, type ProjectSlug } from "@/lib/portfolioProjects";

const RELIC_IDS: RelicId[] = ["accelerator", "drone", "mediaStack", "sdxlLora", "hiveHq", "autoTrader", "interqu"];
/** Every project the site shows: the gallery's, plus the LLM accelerator's own page. */
const SLUGS: ProjectSlug[] = [...projects.map((p) => p.slug), acceleratorProject.slug];

describe("RELICS", () => {
  it("covers exactly the seven relic ids", () => {
    expect(Object.keys(RELICS).sort()).toEqual([...RELIC_IDS].sort());
  });

  it("gives every project slug exactly one relic", () => {
    expect(new Set(SLUGS).size).toBe(SLUGS.length);
    const slugs = Object.values(RELICS).map((r) => r.slug);
    for (const s of slugs) expect(SLUGS).toContain(s);
    expect([...slugs].sort()).toEqual([...SLUGS].sort());
  });

  it("has distinct 7-char hex accents", () => {
    const accents = Object.values(RELICS).map((r) => r.accent);
    for (const a of accents) expect(a).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(new Set(accents.map((a) => a.toLowerCase())).size).toBe(RELIC_IDS.length);
  });
});

describe("isRelic", () => {
  it("is true for the seven relics only", () => {
    for (const id of Object.keys(ITEMS) as ItemId[]) {
      expect(isRelic(id), id).toBe((RELIC_IDS as ItemId[]).includes(id));
    }
  });
});

describe("relic items", () => {
  it("name each relic after its project", () => {
    for (const id of RELIC_IDS) {
      const item = ITEMS[id];
      expect(item.id).toBe(id);
      expect(item.name, id).toContain(item.short);
      expect(item.flavor.length, id).toBeGreaterThan(0);
    }
  });
});
