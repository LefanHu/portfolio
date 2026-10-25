import { ITEMS, type ItemId } from "./items";
import { ALTAR_POS, CAULDRON, CAULDRON_FLOOR_TOP_LOCAL, CAULDRON_WALL_TOP } from "./layout";
import type { Vec3 } from "./theme";

// What counts as "in the cauldron" (Ruling 14). An item counts when its centre
// of mass is in a column over the opening: narrower than the opening, from just
// under the basin floor to high enough for an item stacked on the tallest one
// (a standing server rack). An item resting on the rim band has its centre of
// mass over the band (r >= rimInner), or it would tip in, so it never counts.
// A held item never counts; it is counted once released.

/** Column radius around the cauldron axis (world): just inside the opening, so thin items standing on edge against the inner wall (centres up to ~1.28) count, while rim-resting centres (>= rimInner) never do. */
export const CAULDRON_SENSE_RADIUS = CAULDRON.rimInner - 0.02;
/** Column bottom (world): just under the basin floor. */
export const CAULDRON_SENSE_BOTTOM = ALTAR_POS[1] + CAULDRON_FLOOR_TOP_LOCAL - 0.2;
/** Column top (world): above an item stacked on a standing server rack. */
export const CAULDRON_SENSE_TOP = CAULDRON_WALL_TOP + 1.3;

/** Whether an item whose centre of mass is at `com` is in the cauldron. */
export function cauldronContains(com: Vec3, held: boolean): boolean {
  if (held) return false;
  if (com[1] < CAULDRON_SENSE_BOTTOM || com[1] > CAULDRON_SENSE_TOP) return false;
  return Math.hypot(com[0] - ALTAR_POS[0], com[2] - ALTAR_POS[2]) < CAULDRON_SENSE_RADIUS;
}

/** The ItemId carried in a rigid body's userData, or null if it is not an item. */
export function itemIdOf(userData: unknown): ItemId | null {
  if (!userData || typeof userData !== "object") return null;
  const id = (userData as { itemId?: unknown }).itemId;
  return typeof id === "string" && Object.hasOwn(ITEMS, id) ? (id as ItemId) : null;
}

export interface SensorTracker<B> {
  /** A collider of item `id` started overlapping the sensor. */
  enter(id: ItemId, body?: B): void;
  /** A collider of item `id` stopped overlapping the sensor. */
  leave(id: ItemId): void;
  /** Items currently inside, in entry order. */
  occupants(): ItemId[];
  /** The body last reported for an item that is inside, if any. */
  bodyOf(id: ItemId): B | undefined;
  /** Re-fire onEnter for every item still inside (store re-sync). */
  resync(): void;
}

/**
 * Turns per-collider sensor events into per-item enter/leave calls. A body with
 * several colliders fires several intersection events; the item counts as inside
 * while at least one of them overlaps the sensor. The tracker is the physical
 * truth; `resync` replays it into a store that may have dropped entries.
 */
export function createSensorTracker<B = unknown>(
  onEnter: (id: ItemId) => void,
  onLeave: (id: ItemId) => void,
): SensorTracker<B> {
  const counts = new Map<ItemId, number>();
  const bodies = new Map<ItemId, B>();
  return {
    enter(id, body) {
      const n = counts.get(id) ?? 0;
      counts.set(id, n + 1);
      if (body !== undefined) bodies.set(id, body);
      if (n === 0) onEnter(id);
    },
    leave(id) {
      const n = counts.get(id) ?? 0;
      if (n === 0) return;
      if (n === 1) {
        counts.delete(id);
        bodies.delete(id);
        onLeave(id);
      } else {
        counts.set(id, n - 1);
      }
    },
    occupants: () => [...counts.keys()],
    bodyOf: (id) => bodies.get(id),
    resync() {
      for (const id of counts.keys()) onEnter(id);
    },
  };
}

/** Feed one frame's presence of an item into a tracker: enter/leave only on change. */
export function setPresent<B>(tracker: SensorTracker<B>, id: ItemId, present: boolean, body?: B): void {
  const inside = tracker.occupants().includes(id);
  if (present && !inside) tracker.enter(id, body);
  else if (!present && inside) tracker.leave(id);
}
