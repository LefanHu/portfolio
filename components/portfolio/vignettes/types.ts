import type * as THREE from "three";

/**
 * The site's colour tokens as three.js colours, for the surface a vignette
 * sits on. The engine owns these objects and rewrites them in place when the
 * theme changes, so a material that keeps the reference (the kit's material
 * helpers do) follows a theme switch live.
 */
export interface Palette {
  /** Main forms and outlines. */
  ink: THREE.Color;
  body: THREE.Color;
  /** Secondary structure. */
  mute: THREE.Color;
  /** Hairlines: grids, guides. Already blended onto the surface. */
  line: THREE.Color;
  lineStrong: THREE.Color;
  /** Signal and data in motion. */
  rune: THREE.Color;
  /** Warnings, faults. */
  ember: THREE.Color;
  /** The experience section's own colour: the thing the role was about. */
  accent: THREE.Color;
  ok: THREE.Color;
  bad: THREE.Color;
  /** The surface behind the vignette, for fills that should read as "paper". */
  pane: THREE.Color;
}

/** How the engine's orthographic camera looks at a vignette. */
export interface View {
  /** Radians around the vertical axis; 0 looks along -z. */
  yaw: number;
  /** Radians above the horizon. */
  pitch: number;
  /**
   * Width and height, in world units on the camera's plane, that must stay
   * in view. The figure is 4:3 on wide screens and up to 2:1 on phones; the
   * camera shows at least this box and whatever else the wider shape reveals.
   */
  frame: [number, number];
  /** The point the camera looks at. */
  target: [number, number, number];
}

/**
 * One role's animation. `update` must be a pure function of `t`: everything it
 * moves is set from `t` alone, never accumulated between calls. That is what
 * lets one clock drive every vignette, a paused one hold its frame, and the
 * engine rebuild a scene mid-run without a visible jump.
 */
export interface Vignette {
  /** Everything the scene draws. Y is up; the ground is the plane y = 0. */
  root: THREE.Object3D;
  view?: Partial<View>;
  /** The moment to show when motion is off, in seconds. Pick a frame that explains the scene. */
  still?: number;
  /** Pose the scene for time `t`, in seconds. */
  update(t: number): void;
}

export type VignetteFactory = (palette: Palette) => Vignette;
