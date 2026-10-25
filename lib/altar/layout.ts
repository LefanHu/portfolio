import type { ItemId } from "./items";
import { RELICS, type RelicId } from "./relics";
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

/** Brazier bases, cauldron-local (a 1.9 ring around the cauldron). */
export const BRAZIER_LOCAL: Vec3[] = [0.5, 2.6, 4.1].map((a) => [Math.cos(a) * 1.9, 0.2, Math.sin(a) * 1.9]);
/** Angle of the clear lever on the plaza's front edge (it faces the camera). */
export const LEVER_ANGLE = 1.3;
/** Clear lever base, cauldron-local. */
export const LEVER_LOCAL: Vec3 = [Math.cos(LEVER_ANGLE) * 1.82, 0.2, Math.sin(LEVER_ANGLE) * 1.82];

/** Ruin pillar bases on x/z (y is the ruins group's own, just under the grass). */
export const PILLAR_POS: Vec3[] = [
  [-3.7, 0, 0.7],
  [-1.4, 0, -3.8],
];
/** Centre of the fallen drum (in the ruins group). */
export const LOG_POS: Vec3 = [-2.2, 0.26, 2.6];
/** Flagstone path from the front lawn to the plaza: stone centres (in the ruins group). */
export const FLAGSTONE_POS: Vec3[] = [0, 1, 2, 3].map((i) => {
  const d = 2.75 + i * 0.62;
  const wob = Math.sin(i * 2.3) * 0.18;
  return [ALTAR_POS[0] + 0.63 * d - 0.77 * wob, 0.03, ALTAR_POS[2] + 0.77 * d + 0.63 * wob];
});
/** Rock chunks on the grass: centre and size. */
export const ROCK_SPOTS: [Vec3, number][] = [
  [[-3.9, GROUND_Y + 0.1, 1.3], 0.34],
  [[-3.5, GROUND_Y + 0.05, 1.8], 0.2],
  [[0.9, GROUND_Y + 0.08, -3.9], 0.38],
  [[1.6, GROUND_Y + 0.05, 3.3], 0.24],
  [[-0.8, GROUND_Y + 0.05, 3.9], 0.2],
  [[3.6, GROUND_Y + 0.05, 1.9], 0.18],
];
/** Pine bases. */
export const TREE_POS: Vec3[] = [
  [0.1, GROUND_Y, -3.75],
  [1.35, GROUND_Y, -3.65],
  [-2.4, GROUND_Y, 2.9],
];

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
 * The relic stand: one low plinth per relic on an arc around the island centre,
 * on the camera side. It splits into two wings so the flagstone path (and the
 * rock at its end, near 60°) runs through the gap; the wings frame the approach.
 * Angles are degrees, x = r cos θ, z = r sin θ.
 */
export const RELIC_STAND = {
  radius: 3.5,
  anglesDeg: [0, 15, 30, 44, 73, 85, 97],
  /** Plinth height above the grass. */
  height: 0.32,
} as const;
/** World y of the plinth tops, where the relics rest. */
export const RELIC_TOP_Y = GROUND_Y + RELIC_STAND.height;
/** Plinth bases (grass level), in RELICS order. */
export const RELIC_PLINTHS: Vec3[] = RELIC_STAND.anglesDeg.map((deg) => {
  const a = (deg * Math.PI) / 180;
  return [RELIC_STAND.radius * Math.cos(a), GROUND_Y, RELIC_STAND.radius * Math.sin(a)];
});

const RELIC_HOME = Object.fromEntries(
  (Object.keys(RELICS) as RelicId[]).map((id, i) => [id, [RELIC_PLINTHS[i][0], RELIC_TOP_Y, RELIC_PLINTHS[i][2]]]),
) as Record<RelicId, Vec3>;

/**
 * Where each item rests (the model's base). Six ingredients sit on the desk in
 * two rows; the server rack stands on the ground in front of the desk's right
 * end. The flat items (notebook, keyboard, FPGA chip) take the front row so the
 * camera, looking from the front, never sees one hidden behind a taller one. The rows
 * are staggered: from the home camera the front row reads about 0.18 left of the
 * back row, so each front item sits between two back ones on screen, never over
 * one. Each relic rests on its own plinth of the relic stand.
 */
export const ITEM_HOME: Record<ItemId, Vec3> = {
  notebook: deskToWorld(-1.12, 0.27),
  solderingIron: deskToWorld(-0.82, -0.27),
  keyboard: deskToWorld(-0.16, 0.27),
  driveUnit: deskToWorld(0.14, -0.27),
  fpgaChip: deskToWorld(0.8, 0.27),
  coffeeMug: deskToWorld(1.1, -0.27),
  serverRack: deskToWorld(1.35, 1.0, GROUND_Y),
  ...RELIC_HOME,
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
