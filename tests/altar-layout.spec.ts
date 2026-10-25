import { describe, expect, it } from "vitest";
import {
  ALTAR_POS,
  CAMERA_HOME,
  DESK_POS,
  DESK_ROT,
  DESK_TOP_Y,
  GROUND_Y,
  ITEM_HOME,
  ORBIT_LIMITS,
  RESPAWN_Y,
  shouldRespawn,
} from "@/lib/altar/layout";
import { ITEMS, type ItemId } from "@/lib/altar/items";
import { itemCollider } from "@/lib/altar/itemColliders";
import type { Vec3 } from "@/lib/altar/theme";

const ids = Object.keys(ITEMS) as ItemId[];

/** three.js yaw about Y: x' = x cos + z sin, z' = -x sin + z cos. */
function yaw([x, y, z]: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [x * c + z * s, y, -x * s + z * c];
}

/** An item's collider at its home pose: world centre, half extents and total yaw. */
function homeBox(id: ItemId) {
  const { half, offset, rotY } = itemCollider(id);
  const o = yaw(offset, DESK_ROT);
  const h = ITEM_HOME[id];
  return { centre: [h[0] + o[0], h[1] + o[1], h[2] + o[2]] as Vec3, half, yaw: DESK_ROT + rotY };
}

/** Does the segment from `from` to `to` pass through the box (slab test in the box's own frame)? */
function segmentHitsBox(from: Vec3, to: Vec3, box: ReturnType<typeof homeBox>): boolean {
  const rel = (p: Vec3): Vec3 =>
    yaw([p[0] - box.centre[0], p[1] - box.centre[1], p[2] - box.centre[2]], -box.yaw);
  const a = rel(from);
  const b = rel(to);
  let t0 = 0;
  let t1 = 1;
  for (let i = 0; i < 3; i++) {
    const d = b[i] - a[i];
    if (Math.abs(d) < 1e-9) {
      if (Math.abs(a[i]) > box.half[i]) return false;
      continue;
    }
    const ta = (-box.half[i] - a[i]) / d;
    const tb = (box.half[i] - a[i]) / d;
    t0 = Math.max(t0, Math.min(ta, tb));
    t1 = Math.min(t1, Math.max(ta, tb));
    if (t0 > t1) return false;
  }
  return true;
}

/** Fraction of an item's top face visible from the home camera, ignoring everything but the other items. */
function topFaceVisibility(id: ItemId): number {
  const mine = homeBox(id);
  const others = ids.filter((o) => o !== id).map(homeBox);
  const N = 8;
  let seen = 0;
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const local = yaw(
        [((i + 0.5) / N * 2 - 1) * mine.half[0], mine.half[1], ((j + 0.5) / N * 2 - 1) * mine.half[2]],
        mine.yaw,
      );
      const target: Vec3 = [
        mine.centre[0] + local[0],
        mine.centre[1] + local[1],
        mine.centre[2] + local[2],
      ];
      if (!others.some((box) => segmentHitsBox(CAMERA_HOME.position, target, box))) seen++;
    }
  }
  return seen / (N * N);
}

describe("shouldRespawn", () => {
  it("is true below RESPAWN_Y", () => {
    expect(RESPAWN_Y).toBe(-10);
    expect(shouldRespawn(-10.01)).toBe(true);
  });
  it("is false on the island", () => {
    expect(shouldRespawn(0)).toBe(false);
    expect(shouldRespawn(-10)).toBe(false);
  });
});

describe("ITEM_HOME", () => {
  it("has a home for every item", () => {
    expect(ids).toHaveLength(10);
    for (const id of ids) expect(ITEM_HOME[id]).toHaveLength(3);
    expect(Object.keys(ITEM_HOME).sort()).toEqual([...ids].sort());
  });
  it("keeps every home within 2 units of the desk on x/z", () => {
    for (const id of ids) {
      const [x, , z] = ITEM_HOME[id];
      expect(Math.hypot(x - DESK_POS[0], z - DESK_POS[2]), id).toBeLessThanOrEqual(2);
    }
  });
  it("puts homes on the desk top or the ground beside it", () => {
    for (const id of ids) {
      const y = ITEM_HOME[id][1];
      expect([DESK_TOP_Y, GROUND_Y], id).toContain(y);
    }
  });
  it("spreads homes so no two items overlap", () => {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = ITEM_HOME[ids[i]];
        const b = ITEM_HOME[ids[j]];
        expect(Math.hypot(a[0] - b[0], a[2] - b[2]), `${ids[i]}/${ids[j]}`).toBeGreaterThan(0.5);
      }
    }
  });
  it("keeps every item's top face visible from the home camera", () => {
    // A flat item behind a taller one is ungrabbable: the nearest hit wins the pointer.
    for (const id of ids) expect(topFaceVisibility(id), id).toBeGreaterThanOrEqual(0.75);
  });
  it("keeps homes clear of the altar", () => {
    for (const id of ids) {
      const [x, , z] = ITEM_HOME[id];
      expect(Math.hypot(x - ALTAR_POS[0], z - ALTAR_POS[2]), id).toBeGreaterThan(2.2);
    }
  });
});

describe("camera", () => {
  it("starts inside the orbit limits", () => {
    const [px, py, pz] = CAMERA_HOME.position;
    const [tx, ty, tz] = CAMERA_HOME.target;
    const dx = px - tx;
    const dy = py - ty;
    const dz = pz - tz;
    const distance = Math.hypot(dx, dy, dz);
    const polar = Math.acos(dy / distance);
    const azimuth = Math.atan2(dx, dz);
    const within = ([min, max]: readonly [number, number], v: number) =>
      v >= min && v <= max;
    expect(within(ORBIT_LIMITS.distance, distance)).toBe(true);
    expect(within(ORBIT_LIMITS.polar, polar)).toBe(true);
    expect(within(ORBIT_LIMITS.azimuth, azimuth)).toBe(true);
  });
  it("carries the approved limits", () => {
    expect(ORBIT_LIMITS).toEqual({
      distance: [14, 28],
      polar: [0.75, 1.35],
      azimuth: [0.1, 1.3],
    });
  });
});
