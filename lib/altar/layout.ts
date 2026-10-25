import type { ItemId } from "./items";
import { CAMERA, type Vec3 } from "./theme";

// World layout of the altar island (revision 2 of the approved look).
// The island itself does not bob: physics colliders are static, so anything
// that items can land on stays put in world space.

/** Top of the grass cap. */
export const GROUND_Y = 0.24;
/** Rock top radius; the grass cap overhangs it by about 0.2. */
export const ISLAND_RADIUS = 4.7;

/** Cauldron group origin (plaza level). */
export const ALTAR_POS: Vec3 = [-0.8, GROUND_Y - 0.02, -0.4];

/** Cauldron dimensions in the cauldron group's local space (y = 0 is the plaza's grass level). */
export const CAULDRON = {
  plazaRadius: 2.15,
  /** Top of the stone tier the claw feet stand on. */
  tierTop: 0.4,
  /** Basin base, above the tier. */
  basinBase: 0.6,
  /** Radius of the opening. */
  rimInner: 1.32,
  /** Outer radius of the lip. */
  rimOuter: 1.78,
  /** Lip top, measured from the basin base. */
  lipTop: 1.82,
  /** Swirling surface height, measured from the basin base. */
  energyY: 1.72,
} as const;

/** Top of the basin's solid collision floor, local: just under the energy surface, so contents stay visible. */
export const CAULDRON_FLOOR_TOP_LOCAL = CAULDRON.basinBase + CAULDRON.energyY - 0.04;
/** Top of the basin's wall colliders, local: 0.2 above the lip, so items that land inside stay inside. */
export const CAULDRON_WALL_TOP_LOCAL = CAULDRON.basinBase + CAULDRON.lipTop + 0.2;
/** World y of the cauldron's wall-collider top. */
export const CAULDRON_WALL_TOP = ALTAR_POS[1] + CAULDRON_WALL_TOP_LOCAL;

/** Desk origin (floor level), yaw and uniform scale. */
export const DESK_POS: Vec3 = [2.35, GROUND_Y, -1.95];
export const DESK_ROT = 0.25;
export const DESK_SCALE = 1.1;
/** Desk size in desk-local units (before DESK_SCALE). */
export const DESK_SIZE = { w: 2.9, d: 1.15, h: 0.85 } as const;
/** World y of the desk top surface. */
export const DESK_TOP_Y = GROUND_Y + DESK_SIZE.h * DESK_SCALE;

/** Uniform scale applied to item models (base item scale × desk scale). */
export const ITEM_SCALE = 1.35 * DESK_SCALE;

/** Desk-local x/z (before DESK_SCALE) to world x/z. */
export function deskToWorld(x: number, z: number, y = DESK_TOP_Y): Vec3 {
  const c = Math.cos(DESK_ROT);
  const s = Math.sin(DESK_ROT);
  const lx = x * DESK_SCALE;
  const lz = z * DESK_SCALE;
  return [DESK_POS[0] + lx * c + lz * s, y, DESK_POS[2] - lx * s + lz * c];
}

/**
 * Where each item rests (the model's base). Nine sit on the desk in two rows;
 * the server rack stands on the ground in front of the desk's right end.
 * Flat items (wrench, keyboard) take the front row so the camera, looking from
 * the front, never sees them hidden behind a taller one.
 */
export const ITEM_HOME: Record<ItemId, Vec3> = {
  tool: deskToWorld(-0.9, 0.27),
  notebook: deskToWorld(-0.55, -0.27),
  keyboard: deskToWorld(0.3, 0.27),
  coffeeMug: deskToWorld(0.62, -0.27),
  chalkBag: deskToWorld(1.18, -0.27),
  driveUnit: deskToWorld(-1.1, -0.27),
  fpgaChip: deskToWorld(-0.3, 0.27),
  solderingIron: deskToWorld(0.05, -0.27),
  fpvDrone: deskToWorld(0.9, 0.27),
  serverRack: deskToWorld(1.35, 1.0, GROUND_Y),
};

/** Items that fall below this y are teleported back to their home. */
export const RESPAWN_Y = -10;

export function shouldRespawn(y: number): boolean {
  return y < RESPAWN_Y;
}

export const CAMERA_HOME: { position: Vec3; target: Vec3 } = {
  position: CAMERA.position,
  target: CAMERA.target,
};

/** CameraControls limits (radians / world units). Pan is disabled. */
export const ORBIT_LIMITS = {
  azimuth: [0.1, 1.3],
  polar: [0.75, 1.35],
  distance: [14, 28],
} as const satisfies Record<string, readonly [number, number]>;

/**
 * Limits while a section is open (revealing → returning): the close-up sits far
 * inside ORBIT_LIMITS, so the camera must be free to fly there and back.
 * Orbit input is off in those phases; only programmatic flights use this.
 */
export const RELAXED_LIMITS = {
  azimuth: [-Infinity, Infinity],
  polar: [0, Math.PI],
  distance: [0.5, 60],
} as const satisfies Record<string, readonly [number, number]>;
