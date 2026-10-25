import { describe, expect, it } from "vitest";
import { maxPointSize, perspectivePxPerUnit, pointScale } from "@/lib/altar/points";

describe("perspectivePxPerUnit", () => {
  it("is viewport height over 2·tan(fov/2)", () => {
    expect(perspectivePxPerUnit(900, 32)).toBeCloseTo(900 / (2 * Math.tan((16 * Math.PI) / 180)), 6);
  });
  it("makes a 1-unit point at depth d span 1/d of the projected unit height", () => {
    // a unit-tall object at depth 10 with fov 90 covers half of a 1000 px viewport / 10
    expect(perspectivePxPerUnit(1000, 90)).toBeCloseTo(500, 6);
  });
});

describe("pointScale", () => {
  it("is unchanged at dpr 1", () => {
    expect(pointScale(900, 1, 32)).toBeCloseTo(perspectivePxPerUnit(900, 32), 6);
  });
  it("scales with the device pixel ratio (gl_PointSize is in drawing-buffer px)", () => {
    expect(pointScale(900, 2, 32)).toBeCloseTo(2 * pointScale(900, 1, 32), 6);
    expect(pointScale(900, 1.5, 32)).toBeCloseTo(1.5 * pointScale(900, 1, 32), 6);
  });
  it("treats a missing or bad dpr as 1", () => {
    expect(pointScale(900, 0, 32)).toBeCloseTo(pointScale(900, 1, 32), 6);
    expect(pointScale(900, Number.NaN, 32)).toBeCloseTo(pointScale(900, 1, 32), 6);
  });
});

describe("maxPointSize", () => {
  it("reads the upper bound of ALIASED_POINT_SIZE_RANGE", () => {
    expect(maxPointSize(new Float32Array([1, 1024]))).toBe(1024);
    expect(maxPointSize([1, 255])).toBe(255);
  });
  it("falls back to a conservative size when the range is unavailable", () => {
    expect(maxPointSize(null)).toBe(64);
    expect(maxPointSize(undefined)).toBe(64);
    expect(maxPointSize([1])).toBe(64);
    expect(maxPointSize([1, 0])).toBe(64);
  });
});
