import { CAULDRON_DROP_RADIUS, RIM_TOP_Y } from "./drag";
import { ALTAR_POS, CAULDRON_WALL_TOP } from "./layout";
import type { ItemId } from "./recipes";
import type { Vec3 } from "./theme";

// Pure math for the cauldron summoning a recipe's two items (no three.js, no rapier).

/** One item's flight, from where it rests to the drop point (ms). */
export const SUMMON_FLIGHT_MS = 1100;
/** The second item starts this much after the first (ms). */
export const SUMMON_STAGGER_MS = 550;
/** Wait this long for ejected extras to clear the cauldron before any flight starts (ms). */
export const SUMMON_EJECT_WAIT_MS = 600;
/** Downward speed (units / s) the body is given when it turns dynamic again. */
export const SUMMON_RELEASE_SPEED = 2;
/** Where a flight ends: on the cauldron axis, just above the rim. */
export const SUMMON_DROP_POINT: Vec3 = [ALTAR_POS[0], RIM_TOP_Y + 0.45, ALTAR_POS[2]];

/** Fraction of the eased flight spent on the arc; the rest is the spiral. */
const ARC_END = 0.6;
/** Turns the spiral makes around the axis. */
const SPIRAL_TURNS = 1.5;
/** The arc peaks this far above the wall top, and ends this far above it. */
const ARC_PEAK_Y = CAULDRON_WALL_TOP + 1.2;
const ARC_END_Y = CAULDRON_WALL_TOP + 0.8;
/**
 * The arc holds its xz until the item is this high above the wall top, enough
 * to clear it with any item's collider half-height, so it rises before it approaches.
 */
const ARC_CLEAR_Y = CAULDRON_WALL_TOP + 0.7;

/**
 * Which of a recipe's items must fly in, and which cauldron occupants are
 * extras to eject first. Items already inside stay put.
 */
export function summonPlan(
  pair: readonly [ItemId, ItemId],
  occupants: readonly ItemId[],
): { extras: ItemId[]; fly: ItemId[] } {
  return {
    extras: occupants.filter((id) => !pair.includes(id)),
    fly: pair.filter((id) => !occupants.includes(id)),
  };
}

const smoothstep = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/**
 * Height along the arc, p in [0,1]: a parabola through the start and end
 * heights that peaks at ARC_PEAK_Y. A start already above the peak just
 * descends to the end.
 */
function arcY(startY: number, p: number): number {
  const rise = ARC_PEAK_Y - startY;
  if (rise <= 0) return lerp(startY, ARC_END_Y, p);
  // y = peak - a (p - p0)^2 through (0, startY) and (1, ARC_END_Y)
  const s1 = Math.sqrt(rise);
  const s2 = Math.sqrt(ARC_PEAK_Y - ARC_END_Y);
  const p0 = s1 / (s1 + s2);
  return ARC_PEAK_Y - (rise / (p0 * p0)) * (p - p0) * (p - p0);
}

/**
 * Arc progress at which the item first reaches ARC_CLEAR_Y (0 if it starts
 * there or higher). Later the arc stays above it: the parabola only falls
 * back to ARC_END_Y, which is higher still.
 */
function arcClearP(startY: number): number {
  if (startY >= ARC_CLEAR_Y) return 0;
  const s1 = Math.sqrt(ARC_PEAK_Y - startY);
  const s2 = Math.sqrt(ARC_PEAK_Y - ARC_END_Y);
  const p0 = s1 / (s1 + s2);
  return p0 * (1 - Math.sqrt(ARC_PEAK_Y - ARC_CLEAR_Y) / s1);
}

/**
 * Position of a summoned item at t in [0,1] (clamped), flying from `from` to
 * SUMMON_DROP_POINT. First an arc that climbs over the wall onto a circle
 * inside the opening (on the item's own side) after first rising clear of the
 * wall, then a spiral that winds in
 * to the axis while sinking to the drop point.
 */
export function summonPath(from: Vec3, t: number): Vec3 {
  if (!(t > 0)) return [from[0], from[1], from[2]];
  if (t >= 1) return [SUMMON_DROP_POINT[0], SUMMON_DROP_POINT[1], SUMMON_DROP_POINT[2]];
  const u = smoothstep(t);

  // Direction from the axis toward the item; +z if it sits on the axis.
  const dx = from[0] - ALTAR_POS[0];
  const dz = from[2] - ALTAR_POS[2];
  const d = Math.hypot(dx, dz);
  const ux = d > 1e-6 ? dx / d : 0;
  const uz = d > 1e-6 ? dz / d : 1;
  const arcX = ALTAR_POS[0] + ux * CAULDRON_DROP_RADIUS;
  const arcZ = ALTAR_POS[2] + uz * CAULDRON_DROP_RADIUS;

  if (u <= ARC_END) {
    const p = u / ARC_END;
    const pClear = arcClearP(from[1]);
    const q = Math.max(0, (p - pClear) / (1 - pClear));
    return [lerp(from[0], arcX, q), arcY(from[1], p), lerp(from[2], arcZ, q)];
  }

  const v = (u - ARC_END) / (1 - ARC_END);
  const angle = Math.atan2(uz, ux) + v * SPIRAL_TURNS * 2 * Math.PI;
  const radius = CAULDRON_DROP_RADIUS * (1 - v);
  return [
    ALTAR_POS[0] + radius * Math.cos(angle),
    lerp(ARC_END_Y, SUMMON_DROP_POINT[1], v),
    ALTAR_POS[2] + radius * Math.sin(angle),
  ];
}
