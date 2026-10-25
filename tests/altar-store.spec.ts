import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAltarStore } from "@/lib/altar/store";

beforeEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
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
    s.getState().itemEntered("tool");
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
    s.getState().itemEntered("tool");
    s.getState().evaluate();
    expect(s.getState().phase).toBe("idle");
    expect(s.getState().contents).toEqual(["tool"]);
    expect(s.getState().ejectNonce).toBe(0);
  });

  it("entering then leaving leaves nothing to eject", () => {
    const s = createAltarStore();
    s.getState().itemEntered("tool");
    s.getState().itemLeft("tool");
    s.getState().evaluate();
    expect(s.getState().contents).toEqual([]);
    expect(s.getState().ejectNonce).toBe(0);
  });

  it("ignores itemEntered while viewing and clearAltar while revealing", () => {
    const s = createAltarStore();
    s.getState().openSection("about");
    s.getState().clearAltar();
    expect(s.getState().ejectNonce).toBe(0);
    s.getState().revealDone();
    s.getState().itemEntered("tool");
    expect(s.getState().contents).toEqual([]);
  });

  it("clearAltar in idle empties contents and bumps ejectNonce", () => {
    const s = createAltarStore();
    s.getState().itemEntered("tool");
    s.getState().clearAltar();
    expect(s.getState().contents).toEqual([]);
    expect(s.getState().ejectNonce).toBe(1);
  });

  it("walks the reveal/view/return cycle", () => {
    const s = createAltarStore();
    s.getState().openSection("skills");
    expect(s.getState().phase).toBe("revealing");
    expect(s.getState().activeSection).toBe("skills");
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
    s.getState().openSection("skills");
    s.getState().revealDone();
    s.getState().openSection("about");
    expect(s.getState().activeSection).toBe("skills");
    expect(s.getState().phase).toBe("viewing");
  });

  it("does not duplicate entered items", () => {
    const s = createAltarStore();
    s.getState().itemEntered("tool");
    s.getState().itemEntered("tool");
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

  it("uses the initial theme when nothing is persisted", () => {
    expect(createAltarStore("light").getState().theme).toBe("light");
  });
});

describe("altar store persistence", () => {
  it("persists only unlocked and theme", () => {
    const s = createAltarStore();
    s.getState().itemEntered("tool");
    s.getState().openSection("projects");
    const saved = JSON.parse(sessionStorage.getItem("altar")!);
    expect(Object.keys(saved.state).sort()).toEqual(["theme", "unlocked"]);
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

  it("persisted theme wins over the argument", () => {
    createAltarStore("dark").getState().setTheme("light");
    expect(createAltarStore("dark").getState().theme).toBe("light");
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

  it("ignores a persisted unlocked that is not an array", () => {
    sessionStorage.setItem("altar", JSON.stringify({ state: { theme: "dark", unlocked: "projects" }, version: 0 }));
    const s = createAltarStore("light");
    expect(s.getState().theme).toBe("dark");
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
    expect(() => s.getState().openSection("about")).not.toThrow();
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
});
