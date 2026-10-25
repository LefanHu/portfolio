import { describe, expect, it } from "vitest";
import {
  PANEL_CENTER,
  PANEL_FILL,
  PANEL_SIZE,
  PANEL_TILT,
  PANEL_YAW,
  STAGE_MS,
  fitDistance,
  htmlDistanceFactor,
  panelCameraPose,
  panelNormal,
  panelPixels,
  wireDelays,
} from "@/lib/altar/projection";
import { ALTAR_POS, CAMERA_HOME, RELAXED_LIMITS } from "@/lib/altar/layout";

const deg = (d: number) => (d * Math.PI) / 180;
/** Fraction of the viewport (w, h) the panel covers at distance d. */
function coverage(d: number, fovDeg: number, aspect: number) {
  const visH = 2 * d * Math.tan(deg(fovDeg) / 2);
  return { h: PANEL_SIZE.height / visH, w: PANEL_SIZE.width / (visH * aspect) };
}

describe("panel placement", () => {
  it("floats above the cauldron", () => {
    expect(PANEL_CENTER[0]).toBe(ALTAR_POS[0]);
    expect(PANEL_CENTER[2]).toBe(ALTAR_POS[2]);
    expect(PANEL_CENTER[1] - PANEL_SIZE.height / 2).toBeGreaterThan(4);
  });
  it("faces the home camera", () => {
    const n = panelNormal(PANEL_YAW, 0);
    const toCam = [
      CAMERA_HOME.position[0] - PANEL_CENTER[0],
      CAMERA_HOME.position[2] - PANEL_CENTER[2],
    ];
    const len = Math.hypot(toCam[0], toCam[1]);
    expect(n[0]).toBeCloseTo(toCam[0] / len, 6);
    expect(n[2]).toBeCloseTo(toCam[1] / len, 6);
    expect(n[1]).toBeCloseTo(0, 6);
  });
  it("tilts its normal upward for a negative tilt, staying unit length", () => {
    const n = panelNormal(PANEL_YAW, PANEL_TILT);
    expect(PANEL_TILT).toBeLessThan(0);
    expect(n[1]).toBeCloseTo(Math.sin(-PANEL_TILT), 6);
    expect(Math.hypot(...n)).toBeCloseTo(1, 6);
  });
});

describe("fitDistance", () => {
  it("fills the limiting dimension to the fill fraction (wide viewport: height-bound)", () => {
    const d = fitDistance(PANEL_SIZE, 32, 16 / 9, 0.9);
    const c = coverage(d, 32, 16 / 9);
    expect(c.h).toBeCloseTo(0.9, 6);
    expect(c.w).toBeLessThanOrEqual(0.9 + 1e-9);
  });
  it("is width-bound on a narrow viewport", () => {
    const d = fitDistance(PANEL_SIZE, 32, 4 / 3, 0.9);
    const c = coverage(d, 32, 4 / 3);
    expect(c.w).toBeCloseTo(0.9, 6);
    expect(c.h).toBeLessThanOrEqual(0.9 + 1e-9);
  });
  it("defaults to PANEL_FILL", () => {
    expect(fitDistance(PANEL_SIZE, 32, 16 / 9)).toBe(fitDistance(PANEL_SIZE, 32, 16 / 9, PANEL_FILL));
  });
  it("lands closer than the orbit minimum, which is why limits relax", () => {
    expect(fitDistance(PANEL_SIZE, 32, 16 / 9)).toBeLessThan(14);
    expect(RELAXED_LIMITS.distance[0]).toBeLessThan(fitDistance(PANEL_SIZE, 32, 16 / 9));
  });
});

describe("panelPixels", () => {
  it("matches the panel's on-screen size at the fit distance (1:1 DOM)", () => {
    for (const [w, h] of [
      [1280, 720],
      [1600, 900],
      [2560, 1440],
      [1024, 768],
    ]) {
      const px = panelPixels(PANEL_SIZE, { width: w, height: h });
      const d = fitDistance(PANEL_SIZE, 32, w / h);
      const c = coverage(d, 32, w / h);
      expect(px.width).toBeCloseTo(c.w * w, 0);
      expect(px.height).toBeCloseTo(c.h * h, 0);
    }
  });
  it("keeps the panel's aspect ratio", () => {
    const px = panelPixels(PANEL_SIZE, { width: 1600, height: 900 });
    expect(px.width / px.height).toBeCloseTo(PANEL_SIZE.width / PANEL_SIZE.height, 2);
  });
  it("never collapses on a zero-size canvas", () => {
    const px = panelPixels(PANEL_SIZE, { width: 0, height: 0 });
    expect(px.width).toBeGreaterThan(0);
    expect(px.height).toBeGreaterThan(0);
  });
});

describe("htmlDistanceFactor", () => {
  it("maps the CSS width onto the world width (drei: 1 css px = factor / 400 world units)", () => {
    const f = htmlDistanceFactor(PANEL_SIZE.width, 1200);
    expect((1200 * f) / 400).toBeCloseTo(PANEL_SIZE.width, 9);
  });
});

describe("panelCameraPose", () => {
  it("puts the camera on the panel normal, looking at its centre", () => {
    const n = panelNormal(PANEL_YAW, PANEL_TILT);
    const pose = panelCameraPose(PANEL_CENTER, n, 4);
    expect(pose.target).toEqual(PANEL_CENTER);
    const dx = pose.position.map((p, i) => p - PANEL_CENTER[i]);
    expect(Math.hypot(...dx)).toBeCloseTo(4, 9);
    dx.forEach((v, i) => expect(v / 4).toBeCloseTo(n[i], 9));
  });
});

describe("wireDelays", () => {
  it("staggers evenly so the last segment finishes with the wire stage", () => {
    const seg = 500;
    const d = wireDelays(5, STAGE_MS.wire, seg);
    expect(d).toHaveLength(5);
    expect(d[0]).toBe(0);
    expect(d[4] + seg).toBeCloseTo(STAGE_MS.wire, 6);
    for (let i = 1; i < d.length; i++) expect(d[i]).toBeGreaterThan(d[i - 1]);
  });
  it("handles zero and one element", () => {
    expect(wireDelays(0, 1000, 400)).toEqual([]);
    expect(wireDelays(1, 1000, 400)).toEqual([0]);
  });
});
