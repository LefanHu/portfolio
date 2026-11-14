import { describe, expect, it } from "vitest";
import { THEMES, THEME_TRANSITION_S, PALETTE } from "@/lib/altar/theme";

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
