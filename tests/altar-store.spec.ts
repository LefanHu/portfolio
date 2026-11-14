import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAltarStore } from "@/lib/altar/store";
import { THEME_KEY, readTheme } from "@/lib/theme";

beforeEach(() => {
  vi.restoreAllMocks();
  sessionStorage.clear();
  // the theme actions write the site's shared preference (lib/theme.ts)
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("altar store", () => {
  it("reveals a section when a recipe matches", () => {
    const s = createAltarStore();
    s.getState().itemEntered("keyboard");
    s.getState().itemEntered("driveUnit");
    s.getState().evaluate();
    const st = s.getState();
    expect(st.phase).toBe("revealing");
    expect(st.activeSection).toBe("experience");
    expect(st.unlocked).toContain("experience");
  });

  it("opens a relic's project when a relic sits alone in the cauldron", () => {
    const s = createAltarStore();
    s.getState().itemEntered("hiveHq");
    s.getState().evaluate();
    const st = s.getState();
    expect(st.phase).toBe("revealing");
    expect(st.activeSection).toBe("hive-hq");
    expect(st.unlocked).toContain("hive-hq");
  });

  it("ejects a relic mixed with an ingredient", () => {
    const s = createAltarStore();
    s.getState().itemEntered("hiveHq");
    s.getState().itemEntered("keyboard");
    s.getState().evaluate();
    expect(s.getState().phase).toBe("idle");
    expect(s.getState().contents).toEqual([]);
  });

  it("ejects on an invalid combination", () => {
    const s = createAltarStore();
    s.getState().itemEntered("keyboard");
    s.getState().itemEntered("notebook");
    s.getState().evaluate();
    const st = s.getState();
    expect(st.phase).toBe("idle");
    expect(st.contents).toEqual([]);
    expect(st.ejectNonce).toBe(1);
  });

  it("ejects three items together", () => {
    const s = createAltarStore();
    s.getState().itemEntered("fpgaChip");
    s.getState().itemEntered("notebook");
    s.getState().itemEntered("keyboard");
    s.getState().evaluate();
    const st = s.getState();
    expect(st.phase).toBe("idle");
    expect(st.contents).toEqual([]);
    expect(st.ejectNonce).toBe(1);
  });

  it("leaves state unchanged for a single item", () => {
    const s = createAltarStore();
    s.getState().itemEntered("fpgaChip");
    s.getState().evaluate();
    expect(s.getState().phase).toBe("idle");
    expect(s.getState().contents).toEqual(["fpgaChip"]);
    expect(s.getState().ejectNonce).toBe(0);
  });

  it("entering then leaving leaves nothing to eject", () => {
    const s = createAltarStore();
    s.getState().itemEntered("fpgaChip");
    s.getState().itemLeft("fpgaChip");
    s.getState().evaluate();
    expect(s.getState().contents).toEqual([]);
    expect(s.getState().ejectNonce).toBe(0);
  });

  it("ignores itemEntered while viewing and clearAltar while revealing", () => {
    const s = createAltarStore();
    s.getState().openSection("contact");
    s.getState().clearAltar();
    expect(s.getState().ejectNonce).toBe(0);
    s.getState().revealDone();
    s.getState().itemEntered("fpgaChip");
    expect(s.getState().contents).toEqual([]);
  });

  it("clearAltar in idle empties contents and bumps ejectNonce", () => {
    const s = createAltarStore();
    s.getState().itemEntered("fpgaChip");
    s.getState().clearAltar();
    expect(s.getState().contents).toEqual([]);
    expect(s.getState().ejectNonce).toBe(1);
  });

  it("walks the reveal/view/return cycle", () => {
    const s = createAltarStore();
    s.getState().openSection("coding");
    expect(s.getState().phase).toBe("revealing");
    expect(s.getState().activeSection).toBe("coding");
    s.getState().revealDone();
    expect(s.getState().phase).toBe("viewing");
    s.getState().closeSection();
    expect(s.getState().phase).toBe("returning");
    expect(s.getState().resetNonce).toBe(1);
    s.getState().returnDone();
    expect(s.getState().phase).toBe("idle");
    expect(s.getState().activeSection).toBeNull();
    expect(s.getState().contents).toEqual([]);
  });

  it("ignores openSection unless idle", () => {
    const s = createAltarStore();
    s.getState().openSection("coding");
    s.getState().revealDone();
    s.getState().openSection("contact");
    expect(s.getState().activeSection).toBe("coding");
    expect(s.getState().phase).toBe("viewing");
  });

  it("does not duplicate entered items", () => {
    const s = createAltarStore();
    s.getState().itemEntered("fpgaChip");
    s.getState().itemEntered("fpgaChip");
    expect(s.getState().contents).toHaveLength(1);
  });

  it("toggles theme", () => {
    const s = createAltarStore();
    expect(s.getState().theme).toBe("dark");
    s.getState().toggleTheme();
    expect(s.getState().theme).toBe("light");
    s.getState().toggleTheme();
    expect(s.getState().theme).toBe("dark");
  });

  it("starts on the theme it is given", () => {
    expect(createAltarStore("light").getState().theme).toBe("light");
  });

  it("changing the theme changes the site's shared preference, and remembers it there", () => {
    const s = createAltarStore();
    s.getState().toggleTheme();
    expect(s.getState().theme).toBe("light");
    expect(readTheme()).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem(THEME_KEY)).toBe("light");
    s.getState().setTheme("dark");
    expect(s.getState().theme).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem(THEME_KEY)).toBe("dark");
  });
});

describe("altar store summon and highlight", () => {
  it("summonRecipe starts a summon from idle", () => {
    const s = createAltarStore();
    s.getState().setHighlight("coding");
    s.getState().summonRecipe("projects");
    const st = s.getState();
    expect(st.summoning).toBe(true);
    expect(st.summonSection).toBe("projects");
    expect(st.summonNonce).toBe(1);
    expect(st.highlight).toBeNull();
  });

  it("ignores summonRecipe while already summoning", () => {
    const s = createAltarStore();
    s.getState().summonRecipe("projects");
    s.getState().summonRecipe("coding");
    expect(s.getState().summonSection).toBe("projects");
    expect(s.getState().summonNonce).toBe(1);
  });

  it("ignores summonRecipe outside idle", () => {
    const s = createAltarStore();
    s.getState().openSection("contact");
    s.getState().revealDone();
    expect(s.getState().phase).toBe("viewing");
    s.getState().summonRecipe("projects");
    expect(s.getState().summoning).toBe(false);
    expect(s.getState().summonNonce).toBe(0);
  });

  it("summonDone ends the summon", () => {
    const s = createAltarStore();
    s.getState().summonRecipe("projects");
    s.getState().summonDone();
    expect(s.getState().summoning).toBe(false);
    expect(s.getState().summonSection).toBeNull();
    expect(s.getState().summonNonce).toBe(1);
  });

  it("evaluate is a no-op while summoning", () => {
    const s = createAltarStore();
    s.getState().itemEntered("notebook");
    s.getState().itemEntered("keyboard");
    s.getState().summonRecipe("projects");
    s.getState().evaluate();
    expect(s.getState().phase).toBe("idle");
    expect(s.getState().ejectNonce).toBe(0);
  });

  it("openSection clears summon and highlight", () => {
    const s = createAltarStore();
    s.getState().summonRecipe("projects");
    s.getState().openSection("contact");
    const st = s.getState();
    expect(st.summoning).toBe(false);
    expect(st.summonSection).toBeNull();
    expect(st.highlight).toBeNull();
  });

  it("clearAltar clears summon and highlight", () => {
    const s = createAltarStore();
    s.getState().summonRecipe("projects");
    s.getState().clearAltar();
    expect(s.getState().summoning).toBe(false);
    expect(s.getState().summonSection).toBeNull();
    expect(s.getState().highlight).toBeNull();
  });

  it("clearAltar outside idle leaves summon state alone", () => {
    const s = createAltarStore();
    s.getState().summonRecipe("projects");
    s.setState({ phase: "viewing" });
    s.getState().clearAltar();
    expect(s.getState().summoning).toBe(true);
    expect(s.getState().summonSection).toBe("projects");
  });

  it("setHighlight only applies while idle", () => {
    const s = createAltarStore();
    s.getState().setHighlight("coding");
    expect(s.getState().highlight).toBe("coding");
    s.getState().setHighlight(null);
    expect(s.getState().highlight).toBeNull();
    s.getState().openSection("contact");
    s.getState().setHighlight("coding");
    expect(s.getState().highlight).toBeNull();
  });
});

describe("altar store persistence", () => {
  it("persists only unlocked (the theme is the site's, kept in its own storage)", () => {
    const s = createAltarStore();
    s.getState().itemEntered("fpgaChip");
    s.getState().setHighlight("coding");
    s.getState().summonRecipe("projects");
    s.getState().openSection("projects");
    const saved = JSON.parse(sessionStorage.getItem("altar")!);
    expect(Object.keys(saved.state)).toEqual(["unlocked"]);
    expect(saved.state.unlocked).toEqual(["projects"]);
  });

  it("rehydrates unlocked with an idle phase", () => {
    createAltarStore().getState().openSection("projects");
    const s2 = createAltarStore();
    expect(s2.getState().unlocked).toEqual(["projects"]);
    expect(s2.getState().phase).toBe("idle");
    expect(s2.getState().contents).toEqual([]);
    expect(s2.getState().activeSection).toBeNull();
  });

  it("a theme change is not written to the altar's own storage", () => {
    const s = createAltarStore("dark");
    s.getState().openSection("projects");
    s.getState().setTheme("light");
    expect(JSON.parse(sessionStorage.getItem("altar")!).state).toEqual({ unlocked: ["projects"] });
    expect(createAltarStore("dark").getState().theme).toBe("dark");
  });

  it("ignores a theme persisted by an earlier version", () => {
    sessionStorage.setItem("altar", JSON.stringify({ state: { theme: "light", unlocked: ["projects"] }, version: 0 }));
    const s = createAltarStore("dark");
    expect(s.getState().theme).toBe("dark");
    expect(s.getState().unlocked).toEqual(["projects"]);
  });

  it("drops invalid persisted values", () => {
    sessionStorage.setItem(
      "altar",
      JSON.stringify({ state: { theme: "purple", unlocked: ["bogus", "projects", 7] }, version: 0 }),
    );
    const s = createAltarStore("light");
    expect(s.getState().theme).toBe("light");
    expect(s.getState().unlocked).toEqual(["projects"]);
  });

  it("sanitizes persisted views: dropped sections go, sections and project slugs stay", () => {
    sessionStorage.setItem(
      "altar",
      JSON.stringify({ state: { theme: "dark", unlocked: ["about", "skills", "projects", "drone"] }, version: 0 }),
    );
    const s = createAltarStore();
    expect(s.getState().unlocked).toEqual(["projects", "drone"]);
  });

  it("persists a relic's slug as unlocked", () => {
    const s = createAltarStore();
    s.getState().itemEntered("drone");
    s.getState().evaluate();
    const saved = JSON.parse(sessionStorage.getItem("altar")!);
    expect(Object.keys(saved.state)).toEqual(["unlocked"]);
    expect(saved.state.unlocked).toEqual(["drone"]);
  });

  it("ignores a persisted unlocked that is not an array", () => {
    sessionStorage.setItem("altar", JSON.stringify({ state: { theme: "dark", unlocked: "projects" }, version: 0 }));
    const s = createAltarStore("light");
    expect(s.getState().theme).toBe("light");
    expect(s.getState().unlocked).toEqual([]);
  });

  it("survives a throwing sessionStorage", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    const s = createAltarStore();
    expect(() => s.getState().openSection("contact")).not.toThrow();
    expect(s.getState().phase).toBe("revealing");
  });

  it("survives sessionStorage access itself throwing", () => {
    vi.spyOn(window, "sessionStorage", "get").mockImplementation(() => {
      throw new Error("denied");
    });
    const s = createAltarStore();
    expect(() => s.getState().toggleTheme()).not.toThrow();
    expect(s.getState().theme).toBe("light");
  });

  it("the theme still switches for this page when localStorage is denied", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    const s = createAltarStore();
    expect(() => s.getState().toggleTheme()).not.toThrow();
    expect(s.getState().theme).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
});
