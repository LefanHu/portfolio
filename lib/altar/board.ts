import { CAMERA_HOME } from "./layout";
import type { Size2 } from "./projection";
import { CAMERA, type Vec3 } from "./theme";

// Placement of the recipe board: a pane hanging in the sky left of the island
// (the desk is on the right), squarely facing the camera at the island's
// depth. It is laid out in CSS px at exactly its on-screen size from the home
// view, so its text renders 1:1 (crisp) there, and its margins and size are
// the same at any window size. `local` is that pose in camera space: the scene
// eases the board toward it as the visitor orbits, so it drifts back into the
// same spot instead of swinging off screen.

export interface BoardLayout {
  /** World position of the pane centre. */
  position: Vec3;
  /** Centre in camera space (x right, y up, -z forward); `position` is this from the home camera. */
  local: Vec3;
  /** Euler [tilt, yaw, 0] in order YXZ (same convention as the projection pane). */
  rotation: [number, number, number];
  /** drei <Html transform> distanceFactor that makes 1 CSS px = 1 screen px at home. */
  distanceFactor: number;
  /** CSS width of the board, px. */
  cssWidth: number;
  /** Base font size, px (the board is em-based). */
  fontSize: number;
  /** Where the centre lands on screen from the home camera, CSS px. */
  screen: { x: number; y: number };
}

/** Board width as a fraction of the viewport height, clamped. */
const WIDTH_VH = 0.36;
const WIDTH_MIN = 280;
const WIDTH_MAX = 520;
/** Board width never exceeds this fraction of the viewport width. */
const WIDTH_MAX_VW = 0.23;
/** Right edge of the board as a fraction of the viewport width (the island starts near 0.29). */
const RIGHT_VW = 0.255;
const MIN_MARGIN = 20;
/** Vertical centre as a fraction of the viewport height (low enough to clear the moon). */
const CENTER_VH = 0.555;
/** Base font = width / EMS_PER_WIDTH. */
const EMS_PER_WIDTH = 20;

type V = [number, number, number];
const sub = (a: Vec3, b: Vec3): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const norm = (a: V): V => {
  const l = Math.hypot(a[0], a[1], a[2]);
  return [a[0] / l, a[1] / l, a[2] / l];
};

export function boardLayout(
  viewport: Size2,
  camera: { position: Vec3; target: Vec3 } = CAMERA_HOME,
  fovDeg: number = CAMERA.fov,
): BoardLayout {
  const vw = Math.max(viewport.width, 320);
  const vh = Math.max(viewport.height, 200);

  const cssWidth = Math.round(Math.min(Math.max(vh * WIDTH_VH, WIDTH_MIN), WIDTH_MAX, vw * WIDTH_MAX_VW));
  const left = Math.max(MIN_MARGIN, vw * RIGHT_VW - cssWidth);
  const screen = { x: left + cssWidth / 2, y: vh * CENTER_VH };

  // Camera basis (no roll) and the pane's depth: the home target's.
  const toTarget = sub(camera.target, camera.position);
  const depth = Math.hypot(...toTarget);
  const f = norm(toTarget);
  const r = norm([-f[2], 0, f[0]]);
  const u: V = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];

  const pxPerUnit = vh / (2 * depth * Math.tan((fovDeg * Math.PI) / 360));
  const sx = (screen.x - vw / 2) / pxPerUnit;
  const sy = (vh / 2 - screen.y) / pxPerUnit;
  const position: Vec3 = [0, 1, 2].map(
    (i) => camera.position[i] + f[i] * depth + r[i] * sx + u[i] * sy,
  ) as Vec3;

  // Normal points back at the camera: n = -f = (cos t sin y, -sin t, cos t cos y).
  const yaw = Math.atan2(-f[0], -f[2]);
  const tilt = Math.asin(f[1]);

  return {
    position,
    local: [sx, sy, -depth],
    rotation: [tilt, yaw, 0],
    distanceFactor: 400 / pxPerUnit,
    cssWidth,
    fontSize: cssWidth / EMS_PER_WIDTH,
    screen,
  };
}
