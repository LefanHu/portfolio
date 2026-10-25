import { describe, expect, it } from "vitest";
import { THEMES, THEME_TRANSITION_S, PALETTE, initialTheme } from "@/lib/altar/theme";

describe("initialTheme", () => {
  it("returns dark when the dark scheme matches", () => {
    expect(initialTheme(() => ({ matches: true }))).toBe("dark");
  });
  it("returns light when it does not", () => {
    expect(initialTheme(() => ({ matches: false }))).toBe("light");
  });
  it("defaults to dark without matchMedia", () => {
    expect(initialTheme(undefined)).toBe("dark");
  });
  it("queries prefers-color-scheme: dark", () => {
    let q = "";
    initialTheme((query) => {
      q = query;
      return { matches: true };
    });
    expect(q).toBe("(prefers-color-scheme: dark)");
  });
});

describe("THEMES", () => {
  it("lantern is on only in dark", () => {
    expect(THEMES.dark.lanternOn).toBe(true);
    expect(THEMES.light.lanternOn).toBe(false);
  });
  it("projection blend differs per theme", () => {
    expect(THEMES.dark.projection.blend).toBe("additive");
    expect(THEMES.light.projection.blend).toBe("normal");
  });
  it("carries approved values and shared tokens", () => {
    expect(THEMES.dark.sky).toEqual(["#081230", "#1d2d55", "#0a1230"]);
    expect(THEMES.light.sun.intensity).toBe(2.1);
    expect(PALETTE.stone).toBe("#8f8a80");
    expect(THEME_TRANSITION_S).toBe(1.5);
  });
});
