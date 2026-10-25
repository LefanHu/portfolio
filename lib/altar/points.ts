// Point-sprite sizing for the custom point shaders. gl_PointSize is in
// drawing-buffer pixels, while R3F reports the canvas size in CSS pixels, so
// the scale must include the device pixel ratio (three's PointsMaterial does
// the same). Drivers cap point size (ALIASED_POINT_SIZE_RANGE), so shaders
// clamp to maxPointSize too.

/** CSS px spanned by 1 world unit at view depth 1: viewport height / (2·tan(fov/2)). */
export function perspectivePxPerUnit(cssHeight: number, fovDeg: number): number {
  return cssHeight / (2 * Math.tan((fovDeg * Math.PI) / 360));
}

/**
 * The uScale for `gl_PointSize = worldSize * uScale / -mvPosition.z`, in
 * drawing-buffer px. At dpr 1 this equals perspectivePxPerUnit.
 */
export function pointScale(cssHeight: number, dpr: number, fovDeg: number): number {
  const ratio = Number.isFinite(dpr) && dpr > 0 ? dpr : 1;
  return perspectivePxPerUnit(cssHeight, fovDeg) * ratio;
}

/** Conservative cap when the driver's range is unknown (WebGL guarantees at least 1). */
const FALLBACK_MAX = 64;

/** The largest point size the driver draws, from gl.getParameter(ALIASED_POINT_SIZE_RANGE). */
export function maxPointSize(range: ArrayLike<number> | null | undefined): number {
  const max = range && range.length >= 2 ? range[1] : NaN;
  return Number.isFinite(max) && max >= 1 ? max : FALLBACK_MAX;
}
