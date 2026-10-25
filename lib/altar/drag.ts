import {
  ALTAR_POS,
  CAULDRON,
  CAULDRON_WALL_TOP,
  DESK_POS,
  DESK_ROT,
  DESK_SCALE,
  DESK_SIZE,
  DESK_TOP_Y,
  GROUND_Y,
  ISLAND_RADIUS,
} from "./layout";
import { CAMERA, type Vec3 } from "./theme";

// Pure drag/throw/eject math for the altar items (no three.js, no rapier).

/** A dragged item floats this far above whatever surface is under the cursor. */
export const LIFT_HEIGHT = 0.6;
/** Release velocity is capped at this speed (world units / s), so items can't be flung absurdly. */
export const MAX_THROW_SPEED = 9;
/** Throw velocity is measured over this much recent drag motion (s). */
export const THROW_WINDOW_S = 0.1;

/** World y of the cauldron lip (the visible rim). */
export const RIM_TOP_Y = ALTAR_POS[1] + CAULDRON.basinBase + CAULDRON.lipTop;
/** Over the cauldron, the drag point is kept within this radius of its axis, so drops fall in. */
export const CAULDRON_DROP_RADIUS = CAULDRON.rimInner - 0.55;
/** On open ground, the drag point is kept within this radius of the island centre. */
export const DRAG_GROUND_RADIUS = ISLAND_RADIUS - 0.4;
/** World y of the plaza's top. */
const PLAZA_TOP_Y = ALTAR_POS[1] + 0.2;

type VecLike = readonly [number, number, number] | { x: number; y: number; z: number };
export interface Ray {
  origin: VecLike;
  direction: VecLike;
}

const tuple = (v: VecLike): Vec3 => ("x" in v ? [v.x, v.y, v.z] : [v[0], v[1], v[2]]);

/** Where a ray meets the horizontal plane y = planeY; null if parallel or behind the origin. */
export function dragTarget(ray: Ray, planeY: number): Vec3 | null {
  const [ox, oy, oz] = tuple(ray.origin);
  const [dx, dy, dz] = tuple(ray.direction);
  if (Math.abs(dy) < 1e-9) return null;
  const t = (planeY - oy) / dy;
  if (t < 0) return null;
  return [ox + dx * t, planeY, oz + dz * t];
}

/** Scale the xz offset of `p` from `center` down to at most `radius`. */
function clampXZ(p: Vec3, center: readonly [number, number, number], radius: number): Vec3 {
  const dx = p[0] - center[0];
  const dz = p[2] - center[2];
  const d = Math.hypot(dx, dz);
  if (d <= radius) return p;
  const k = radius / d;
  return [center[0] + dx * k, p[1], center[2] + dz * k];
}

const distToAltar = (p: Vec3) => Math.hypot(p[0] - ALTAR_POS[0], p[2] - ALTAR_POS[2]);

const DESK_HALF_X = (DESK_SIZE.w / 2) * DESK_SCALE;
const DESK_HALF_Z = (DESK_SIZE.d / 2) * DESK_SCALE;
/** A held item over the desk stays this far inside its edges, so a drop lands on the top. */
const DESK_EDGE_MARGIN = 0.12;

/** World xz offset from the desk origin to desk-local (lx, lz), undoing DESK_ROT. */
function toDeskLocal(x: number, z: number): [number, number] {
  const c = Math.cos(DESK_ROT);
  const s = Math.sin(DESK_ROT);
  return [x * c - z * s, x * s + z * c];
}

/** Desk-local (lx, lz) back to a world xz offset. */
function fromDeskLocal(lx: number, lz: number): [number, number] {
  const c = Math.cos(DESK_ROT);
  const s = Math.sin(DESK_ROT);
  return [lx * c + lz * s, -lx * s + lz * c];
}

/** Ray parameter where the ray first enters the solid desk block (ground to top), or null. */
function hitDesk(o: Vec3, d: Vec3): number | null {
  const [ox, oz] = toDeskLocal(o[0] - DESK_POS[0], o[2] - DESK_POS[2]);
  const [dx, dz] = toDeskLocal(d[0], d[2]);
  let t0 = 0;
  let t1 = Infinity;
  const slabs: [number, number, number, number][] = [
    [ox, dx, -DESK_HALF_X, DESK_HALF_X],
    [o[1], d[1], GROUND_Y, DESK_TOP_Y],
    [oz, dz, -DESK_HALF_Z, DESK_HALF_Z],
  ];
  for (const [org, dir, lo, hi] of slabs) {
    if (Math.abs(dir) < 1e-12) {
      if (org < lo || org > hi) return null;
      continue;
    }
    let a = (lo - org) / dir;
    let b = (hi - org) / dir;
    if (a > b) [a, b] = [b, a];
    t0 = Math.max(t0, a);
    t1 = Math.min(t1, b);
    if (t0 > t1) return null;
  }
  return t0;
}

/** World y of the cauldron's stone tier: below this, the plaza and ground take over. */
const CAULDRON_BASE_Y = ALTAR_POS[1] + CAULDRON.tierTop;

/**
 * Ray parameter where the ray first meets the cauldron, modelled as a solid
 * vertical cylinder of radius rimOuter from the tier up to the rim (its top cap
 * is the opening), or null.
 */
function hitCauldron(o: Vec3, d: Vec3): number | null {
  const R = CAULDRON.rimOuter;
  const px = o[0] - ALTAR_POS[0];
  const pz = o[2] - ALTAR_POS[2];
  let best: number | null = null;
  const consider = (t: number) => {
    if (t >= 0 && (best === null || t < best)) best = t;
  };
  // side wall
  const a = d[0] * d[0] + d[2] * d[2];
  if (a > 1e-12) {
    const b = 2 * (px * d[0] + pz * d[2]);
    const c = px * px + pz * pz - R * R;
    const disc = b * b - 4 * a * c;
    if (disc >= 0) {
      const t = (-b - Math.sqrt(disc)) / (2 * a);
      const y = o[1] + d[1] * t;
      if (y >= CAULDRON_BASE_Y && y <= RIM_TOP_Y) consider(t);
    }
  }
  // top cap (the opening and lip)
  if (Math.abs(d[1]) > 1e-12) {
    const t = (RIM_TOP_Y - o[1]) / d[1];
    if (Math.hypot(px + d[0] * t, pz + d[2] * t) <= R) consider(t);
  }
  return best;
}

export type DragZone = "cauldron" | "desk" | "ground";

/**
 * Where a dragged item should be for a pointer ray: straight above the surface
 * the cursor points at, LIFT_HEIGHT up. The cursor is the landing point, so a
 * release drops the item where the visitor aimed. The camera looks down at a
 * shallow angle, so the surfaces are tested top-down (the cauldron's rim
 * occludes what lies behind it). Over the cauldron the item hovers above the
 * opening, clear of the walls; on open ground it is kept on the island.
 */
export interface DragTargetResult {
  /** Where the held item should be. */
  position: Vec3;
  /** Where the pointer aims, before keeping it on the island: throws follow this. */
  aim: Vec3;
  zone: DragZone;
}

export function resolveDragTarget(ray: Ray): DragTargetResult | null {
  const o = tuple(ray.origin);
  const d = tuple(ray.direction);
  const at = (t: number): Vec3 => [o[0] + d[0] * t, o[1] + d[1] * t, o[2] + d[2] * t];
  const cauldron = (p: Vec3): DragTargetResult => {
    const c = clampXZ(p, ALTAR_POS, CAULDRON_DROP_RADIUS);
    const position: Vec3 = [c[0], RIM_TOP_Y + LIFT_HEIGHT, c[2]];
    return { position, aim: position, zone: "cauldron" };
  };

  // Solid things first, nearest wins: the cauldron (rim, walls) and the desk (top, sides).
  const tc = hitCauldron(o, d);
  const td = hitDesk(o, d);
  if (tc !== null && (td === null || tc <= td)) return cauldron(at(tc));
  if (td !== null) {
    const p = at(td);
    const [lx, lz] = toDeskLocal(p[0] - DESK_POS[0], p[2] - DESK_POS[2]);
    const cx = Math.max(-DESK_HALF_X + DESK_EDGE_MARGIN, Math.min(DESK_HALF_X - DESK_EDGE_MARGIN, lx));
    const cz = Math.max(-DESK_HALF_Z + DESK_EDGE_MARGIN, Math.min(DESK_HALF_Z - DESK_EDGE_MARGIN, lz));
    const [wx, wz] = fromDeskLocal(cx, cz);
    const position: Vec3 = [DESK_POS[0] + wx, DESK_TOP_Y + LIFT_HEIGHT, DESK_POS[2] + wz];
    return { position, aim: position, zone: "desk" };
  }

  const ground = dragTarget(ray, GROUND_Y);
  if (!ground) return null;
  const dist = distToAltar(ground);
  // Under the tier, the ray is still inside the cauldron's footprint.
  if (dist <= CAULDRON.rimOuter) return cauldron(ground);
  if (dist <= CAULDRON.plazaRadius) {
    const position: Vec3 = [ground[0], PLAZA_TOP_Y + LIFT_HEIGHT, ground[2]];
    return { position, aim: position, zone: "ground" };
  }
  const g = clampXZ(ground, [0, 0, 0], DRAG_GROUND_RADIUS);
  return {
    position: [g[0], GROUND_Y + LIFT_HEIGHT, g[2]],
    aim: [ground[0], GROUND_Y + LIFT_HEIGHT, ground[2]],
    zone: "ground",
  };
}

/** Time constants (s) of the drag follow: rise quickly, glide a little slower. */
const FOLLOW_Y_S = 0.04;
const FOLLOW_XZ_S = 0.07;

/**
 * One frame of a held item easing toward its drag target. Climbing to a higher
 * target (desk → cauldron) it rises first and only glides sideways once nearly
 * level, so it never sweeps through the cauldron wall.
 */
export function followStep(p: Vec3, target: Vec3, dt: number): Vec3 {
  const ky = 1 - Math.exp(-dt / FOLLOW_Y_S);
  const kxz = 1 - Math.exp(-dt / FOLLOW_XZ_S);
  const y = p[1] + (target[1] - p[1]) * ky;
  const below = target[1] - y;
  const gate = Math.min(1, Math.max(0, 1 - (below - 0.05) / 0.2));
  const k = kxz * gate;
  return [p[0] + (target[0] - p[0]) * k, y, p[2] + (target[2] - p[2]) * k];
}

/** A held item passing over the cauldron's walls keeps this much air under it. */
const WALL_CLEARANCE = 0.05;

/**
 * The lowest a held item's base may be at xz `p`, given its horizontal reach
 * (collider half-diagonal plus offset): above the cauldron's wall band anywhere
 * near the cauldron, and above the desk top over the desk. Kinematic bodies pass through fixed colliders, so this keeps a carried
 * item from sweeping through the wall or the desk.
 */
export function clearanceY(p: Vec3, reach: number): number {
  let floor = -Infinity;
  if (distToAltar(p) < CAULDRON.rimOuter + reach) floor = CAULDRON_WALL_TOP + WALL_CLEARANCE;
  const [lx, lz] = toDeskLocal(p[0] - DESK_POS[0], p[2] - DESK_POS[2]);
  if (Math.abs(lx) < DESK_HALF_X + reach && Math.abs(lz) < DESK_HALF_Z + reach) floor = Math.max(floor, DESK_TOP_Y);
  return floor;
}

/**
 * rapier collision groups (membership << 16 | filter). Resting items are in
 * group 1; a held item is in group 2 and ignores group 1, so dragging never
 * shoves other items around. Both still meet the world.
 */
export const ITEM_GROUPS = (0x0001 << 16) | 0xffff;
export const DRAGGED_GROUPS = (0x0002 << 16) | 0xfffe;

/** `v` scaled down to at most `max` in length. */
export function clampMagnitude(v: Vec3, max: number): Vec3 {
  const l = Math.hypot(v[0], v[1], v[2]);
  if (l <= max || l === 0) return v;
  const k = max / l;
  return [v[0] * k, v[1] * k, v[2] * k];
}

export interface DragSample {
  /** Seconds. */
  t: number;
  p: Vec3;
}

/**
 * Release velocity from the drag's recent positions: the average motion over
 * the last `windowS`, clamped to `maxSpeed`. Zero if the pointer was resting.
 */
export function throwVelocity(
  samples: readonly DragSample[],
  { windowS = THROW_WINDOW_S, maxSpeed = MAX_THROW_SPEED } = {},
): Vec3 {
  if (samples.length < 2) return [0, 0, 0];
  const last = samples[samples.length - 1];
  let i = samples.length - 2;
  while (i > 0 && samples[i - 1].t >= last.t - windowS - 1e-9) i--;
  const ref = samples[i];
  const dt = last.t - ref.t;
  if (dt <= 1e-6) return [0, 0, 0];
  return clampMagnitude(
    [(last.p[0] - ref.p[0]) / dt, (last.p[1] - ref.p[1]) / dt, (last.p[2] - ref.p[2]) / dt],
    maxSpeed,
  );
}

/**
 * How a held item leaves the hand. Over the cauldron it drops straight in from
 * the (clamped, wall-clearing) held point: a sideways flick would otherwise
 * carry it onto the rim during the short fall. Elsewhere it is thrown with the
 * pointer's recent motion.
 */
export function releaseMotion(
  zone: DragZone | null,
  target: Vec3 | null,
  samples: readonly DragSample[],
): { velocity: Vec3; snapTo: Vec3 | null } {
  if (zone === "cauldron" && target) return { velocity: [0, 0, 0], snapTo: target };
  return { velocity: throwVelocity(samples), snapTo: null };
}

const GRAVITY = 9.81;
/** Upward launch speed of an ejected item: high enough to clear the cauldron's wall band. */
export const EJECT_UP_SPEED = 6.4;
/** Ejected items aim to land this far from the cauldron's axis (past the plaza, well inside the island). */
export const EJECT_LAND_RADIUS = 2.9;
const EJECT_MIN_OUT_SPEED = 0.8;
/** Extra launch speed (m/s) per metre of hop beyond the shortest one. */
const EJECT_LONG_HOP_LIFT = 0.8;

/**
 * Launch velocity that throws an item out of the cauldron: mostly up, then
 * outward from the axis so it lands about EJECT_LAND_RADIUS out on the grass,
 * always on the camera's half of the island so it stays in view. Items near
 * the axis fly toward the camera. `spin` rotates the outward
 * direction (radians) for a little variety.
 */
export function ejectVelocity(pos: Vec3, center: readonly [number, number, number], spin = 0): Vec3 {
  const wx = pos[0] - center[0];
  const wz = pos[2] - center[2];
  const r = Math.hypot(wx, wz);
  // Horizontal direction to the camera: ejected items land on its half of the island, in view.
  const cl = Math.hypot(CAMERA.position[0] - center[0], CAMERA.position[2] - center[2]);
  const cx = (CAMERA.position[0] - center[0]) / cl;
  const cz = (CAMERA.position[2] - center[2]) / cl;
  let dx = r < 0.15 ? cx : wx / r;
  let dz = r < 0.15 ? cz : wz / r;
  const back = dx * cx + dz * cz;
  if (back < 0) {
    // Mirror a direction pointing away from the camera into the camera's half.
    dx -= 2 * back * cx;
    dz -= 2 * back * cz;
  }
  const c = Math.cos(spin);
  const s = Math.sin(spin);
  const ux = dx * c - dz * s;
  const uz = dx * s + dz * c;
  // Distance along u that ends EJECT_LAND_RADIUS from the axis: |w + D u| = R.
  const wu = wx * ux + wz * uz;
  const R = EJECT_LAND_RADIUS;
  const D = -wu + Math.sqrt(Math.max(0, wu * wu - r * r + R * R));
  // A long hop (from the far side, across the opening) launches higher so it still clears the near wall.
  const vy = EJECT_UP_SPEED + EJECT_LONG_HOP_LIFT * Math.max(0, D - (R - CAULDRON.rimInner));
  const drop = Math.max(0, pos[1] - GROUND_Y);
  const flight = (vy + Math.sqrt(vy * vy + 2 * GRAVITY * drop)) / GRAVITY;
  const out = Math.max(EJECT_MIN_OUT_SPEED, D / flight);
  return [ux * out, vy, uz * out];
}
