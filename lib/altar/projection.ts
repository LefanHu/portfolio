import { ALTAR_POS, CAMERA_HOME } from "./layout";
import type { Vec3 } from "./theme";

// Geometry and timing of the section projection: a pane floating above the
// cauldron that the camera flies up to until it fills the screen.

export interface Size2 {
  width: number;
  height: number;
}

/** World size of the pane (16:10). Fixed: the camera distance adapts instead. */
export const PANEL_SIZE: Size2 = { width: 3.0, height: 1.875 };
/** Pane centre, high enough to clear the orbiting fragments. */
export const PANEL_CENTER: Vec3 = [ALTAR_POS[0], 5.05, ALTAR_POS[2]];
/** Yaw that turns the pane toward the home camera. */
export const PANEL_YAW = Math.atan2(
  CAMERA_HOME.position[0] - PANEL_CENTER[0],
  CAMERA_HOME.position[2] - PANEL_CENTER[2],
);
/** Slight backward lean (rotation about the pane's own x axis, Euler order YXZ). */
export const PANEL_TILT = -0.08;
/** Fraction of the viewport's limiting dimension the pane fills at the close-up. */
export const PANEL_FILL = 0.9;
/** Base font size as a fraction of the pane's CSS width (layout is em-based, so it scales as one). */
export const PANEL_EM = 1 / 60;

/** Stage durations. `wire` is the draw-in; `fill` the content fade; `dissolve` the exit. */
export const STAGE_MS = { wire: 1500, fill: 600, dissolve: 800 } as const;
/** Length of one box's line-draw animation inside the wire stage. */
export const WIRE_SEGMENT_MS = 520;
/** camera-controls smoothTime while flying to/from the pane (default is 0.25). */
export const FLY_SMOOTH_TIME = 0.6;
/** Give up waiting for the camera's rest event after this long. */
export const FLY_TIMEOUT_MS = 6000;

/** Unit normal of the pane's front face for rotation [tilt, yaw, 0] in Euler order YXZ. */
export function panelNormal(yaw: number, tilt: number): Vec3 {
  return [Math.cos(tilt) * Math.sin(yaw), -Math.sin(tilt), Math.cos(tilt) * Math.cos(yaw)];
}

/** Camera distance at which the pane fills `fill` of the viewport's limiting dimension. */
export function fitDistance(size: Size2, fovDeg: number, aspect: number, fill = PANEL_FILL): number {
  const span = 2 * Math.tan((fovDeg * Math.PI) / 360) * fill;
  return Math.max(size.height / span, size.width / (span * aspect));
}

/**
 * The pane's on-screen size in CSS px at the fit distance. Laying the DOM out at
 * exactly this size makes it render 1:1 (crisp) once the camera arrives.
 */
export function panelPixels(size: Size2, viewport: Size2, fill = PANEL_FILL): Size2 {
  const vw = Math.max(viewport.width, 320);
  const vh = Math.max(viewport.height, 200);
  const pxPerUnit = fill * Math.min(vh / size.height, vw / size.width);
  return { width: Math.round(size.width * pxPerUnit), height: Math.round(size.height * pxPerUnit) };
}

/** drei <Html transform> maps 1 CSS px to distanceFactor / 400 world units. */
export function htmlDistanceFactor(worldWidth: number, cssWidth: number): number {
  return (400 * worldWidth) / cssWidth;
}

/** Camera pose `distance` along the pane's normal, looking at its centre. */
export function panelCameraPose(center: Vec3, normal: Vec3, distance: number): { position: Vec3; target: Vec3 } {
  return {
    position: [
      center[0] + normal[0] * distance,
      center[1] + normal[1] * distance,
      center[2] + normal[2] * distance,
    ],
    target: center,
  };
}

/** Start delays (ms) for `count` line-draw animations, evenly staggered to end with the stage. */
export function wireDelays(count: number, totalMs: number, segmentMs: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [0];
  const span = Math.max(0, totalMs - segmentMs);
  return Array.from({ length: count }, (_, i) => (span * i) / (count - 1));
}
