import { describe, expect, it } from "vitest";
import {
  altarMood,
  hintColors,
  leverResponse,
  splashEnvelope,
  sputterEnvelope,
  surgeEnvelope,
  type Mood,
} from "@/lib/altar/mood";
import { RECIPES } from "@/lib/altar/recipes";
import { RELICS } from "@/lib/altar/relics";

const accent = (section: string) => RECIPES.find((r) => r.section === section)!.artifact.accent;

describe("hintColors", () => {
  it("is the accent of the one recipe an item belongs to", () => {
    expect(hintColors("fpgaChip")).toEqual([accent("projects")]);
    expect(hintColors("coffeeMug")).toEqual([accent("contact")]);
  });
  it("lists both accents, in recipe order, for an item in two recipes", () => {
    expect(hintColors("keyboard")).toEqual([accent("experience"), accent("coding")]);
  });
  it("is a relic's own accent for a relic", () => {
    expect(hintColors("hiveHq")).toEqual([RELICS.hiveHq.accent]);
    expect(hintColors("drone")).toEqual([RELICS.drone.accent]);
  });
  it("covers every item with at least one accent", () => {
    for (const r of RECIPES) for (const id of r.items) expect(hintColors(id).length).toBeGreaterThan(0);
  });
});

describe("altarMood", () => {
  it("is idle with nothing inside", () => {
    const m = altarMood([], "idle", null, "dark");
    expect(m.kind).toBe("idle");
    expect(m.colors).toEqual([]);
    expect(m.tint).toBe(0);
    expect(m.intensity).toBe(1);
    expect(m.spin).toBe(1);
    expect(m.drain).toBe(0);
  });

  it("hints the item's recipe accent with one item inside", () => {
    const m = altarMood(["solderingIron"], "idle", null, "dark");
    expect(m.kind).toBe("hint");
    expect(m.colors).toEqual([accent("projects")]);
    expect(m.tint).toBeGreaterThan(0.5);
    expect(m.intensity).toBeGreaterThan(1);
  });

  it("hints both accents for an item in two recipes", () => {
    expect(altarMood(["keyboard"], "idle", null, "dark").colors).toEqual([accent("experience"), accent("coding")]);
  });

  it("surges in the recipe accent as soon as a valid pair is inside (settle window)", () => {
    const m = altarMood(["notebook", "coffeeMug"], "idle", null, "dark");
    expect(m.kind).toBe("surge");
    expect(m.colors).toEqual([accent("contact")]);
  });

  it("surges harder than it hints", () => {
    const hint = altarMood(["coffeeMug"], "idle", null, "dark");
    const surge = altarMood(["coffeeMug", "notebook"], "idle", null, "dark");
    expect(surge.intensity).toBeGreaterThan(hint.intensity);
    expect(surge.spin).toBeGreaterThan(hint.spin);
  });

  it("goes unstable (drained, no accent) on an invalid pair before the eject", () => {
    const m = altarMood(["driveUnit", "fpgaChip"], "idle", null, "dark");
    expect(m.kind).toBe("unstable");
    expect(m.colors).toEqual([]);
    expect(m.drain).toBeGreaterThan(0);
    expect(altarMood(["driveUnit", "fpgaChip", "keyboard"], "idle", null, "dark").kind).toBe("unstable");
  });

  it("surges in the active section's accent while revealing, whatever the contents", () => {
    const m = altarMood([], "revealing", "coding", "dark");
    expect(m.kind).toBe("surge");
    expect(m.colors).toEqual([accent("coding")]);
  });

  it("hints a lone relic in its own accent, and surges in its project's accent once open", () => {
    const hint = altarMood(["interqu"], "idle", null, "dark");
    expect(hint.kind).toBe("hint");
    expect(hint.colors).toEqual([RELICS.interqu.accent]);
    const open = altarMood([], "revealing", "interqu", "dark");
    expect(open.kind).toBe("surge");
    expect(open.colors).toEqual([RELICS.interqu.accent]);
  });

  it("goes unstable for a relic mixed with anything", () => {
    expect(altarMood(["interqu", "keyboard"], "idle", null, "dark").kind).toBe("unstable");
  });

  it("holds the accent, calmer than the surge, while viewing", () => {
    const hold = altarMood([], "viewing", "projects", "dark");
    const surge = altarMood([], "revealing", "projects", "dark");
    expect(hold.kind).toBe("hold");
    expect(hold.colors).toEqual([accent("projects")]);
    expect(hold.intensity).toBeLessThan(surge.intensity);
    expect(hold.intensity).toBeGreaterThan(1);
  });

  it("returns to idle while returning (the cyan comes back with the dissolve)", () => {
    expect(altarMood(["coffeeMug", "notebook"], "returning", "contact", "dark").kind).toBe("idle");
  });

  it("falls back to idle outside idle without an active section", () => {
    expect(altarMood([], "revealing", null, "dark").kind).toBe("idle");
  });

  it("is restrained in daylight: every boost is smaller than at night", () => {
    const cases: [Parameters<typeof altarMood>[0], Parameters<typeof altarMood>[1], Parameters<typeof altarMood>[2]][] = [
      [["coffeeMug"], "idle", null],
      [["keyboard", "serverRack"], "idle", null],
      [["driveUnit", "fpgaChip"], "idle", null],
      [[], "revealing", "contact"],
      [[], "viewing", "contact"],
    ];
    for (const [c, p, s] of cases) {
      const d: Mood = altarMood(c, p, s, "dark");
      const l: Mood = altarMood(c, p, s, "light");
      expect(l.kind).toBe(d.kind);
      expect(l.colors).toEqual(d.colors);
      expect(Math.abs(l.intensity - 1)).toBeLessThan(Math.abs(d.intensity - 1));
      expect(l.tint).toBeLessThanOrEqual(d.tint);
      expect(l.intensity).toBeGreaterThan(0);
    }
    expect(altarMood([], "idle", null, "light")).toEqual(altarMood([], "idle", null, "dark"));
  });
});

describe("envelopes", () => {
  const sample = (f: (t: number) => number) => Array.from({ length: 81 }, (_, i) => f(i * 0.05));

  it("are silent before they start and after they end", () => {
    for (const f of [surgeEnvelope, splashEnvelope, sputterEnvelope]) {
      expect(f(-0.1)).toBe(0);
      expect(f(Infinity)).toBe(0);
      expect(f(10)).toBe(0);
    }
  });

  it("stay within 0..1 and peak at 1", () => {
    for (const f of [surgeEnvelope, splashEnvelope, sputterEnvelope]) {
      const s = sample(f);
      expect(Math.min(...s)).toBeGreaterThanOrEqual(0);
      expect(Math.max(...s)).toBeLessThanOrEqual(1);
      expect(Math.max(...s)).toBeGreaterThan(0.95);
    }
  });

  it("surge attacks fast, then fades out by about 1.5 s (handing off to the beam)", () => {
    expect(surgeEnvelope(0.1)).toBeGreaterThan(0.8);
    expect(surgeEnvelope(0.8)).toBeLessThan(0.5);
    expect(surgeEnvelope(1.6)).toBe(0);
  });

  it("splash is short and soft", () => {
    expect(splashEnvelope(0.05)).toBeGreaterThan(0.5);
    expect(splashEnvelope(0.8)).toBe(0);
  });

  it("sputter holds briefly, then lets the cyan back by about 1.4 s", () => {
    expect(sputterEnvelope(0.2)).toBeGreaterThan(0.9);
    expect(sputterEnvelope(0.9)).toBeLessThan(0.5);
    expect(sputterEnvelope(1.4)).toBe(0);
  });

  it("decay without jumps", () => {
    for (const f of [surgeEnvelope, splashEnvelope, sputterEnvelope]) {
      const s = Array.from({ length: 400 }, (_, i) => f(i * 0.005));
      for (let i = 1; i < s.length; i++) expect(Math.abs(s[i] - s[i - 1])).toBeLessThan(0.15);
    }
  });
});

describe("leverResponse", () => {
  it("pulls only when idle with something in the cauldron", () => {
    expect(leverResponse("idle", 1)).toBe("pull");
    expect(leverResponse("idle", 3)).toBe("pull");
  });
  it("is locked on an empty cauldron", () => {
    expect(leverResponse("idle", 0)).toBe("locked");
  });
  it("is locked while a section is open", () => {
    for (const p of ["revealing", "viewing", "returning"] as const) expect(leverResponse(p, 2)).toBe("locked");
  });
});
