import * as THREE from "three";
import { describe, expect, it } from "vitest";
import {
  ALTAR_POS,
  BRAZIER_LOCAL,
  CAMERA_HOME,
  DESK_POS,
  DESK_ROT,
  DESK_SCALE,
  DESK_SIZE,
  DESK_TOP_Y,
  FLAGSTONE_POS,
  GROUND_Y,
  ISLAND_RADIUS,
  ITEM_HOME,
  LEVER_LOCAL,
  LOG_POS,
  ORBIT_LIMITS,
  PILLAR_POS,
  RELIC_TOP_Y,
  RESPAWN_Y,
  ROCK_SPOTS,
  TREE_POS,
  shouldRespawn,
} from "@/lib/altar/layout";
import { ITEMS, type ItemId } from "@/lib/altar/items";
import { itemCollider } from "@/lib/altar/itemColliders";
import { isRelic } from "@/lib/altar/relics";
import { CAMERA, type Vec3 } from "@/lib/altar/theme";

const ids = Object.keys(ITEMS) as ItemId[];
const deskIds = ids.filter((id) => !isRelic(id));
const relicIds = ids.filter(isRelic);

/** Distance on x/z from a point to the desk's footprint rectangle (0 inside it). */
function deskFootprintDistance([x, , z]: Vec3): number {
  const c = Math.cos(DESK_ROT);
  const s = Math.sin(DESK_ROT);
  const ox = x - DESK_POS[0];
  const oz = z - DESK_POS[2];
  const lx = ox * c - oz * s;
  const lz = ox * s + oz * c;
  const dx = Math.max(0, Math.abs(lx) - (DESK_SIZE.w / 2) * DESK_SCALE);
  const dz = Math.max(0, Math.abs(lz) - (DESK_SIZE.d / 2) * DESK_SCALE);
  return Math.hypot(dx, dz);
}

/** Scenery a relic plinth must keep clear of, on x/z (world). */
const toWorld = ([x, , z]: Vec3): [number, number] => [ALTAR_POS[0] + x, ALTAR_POS[2] + z];
const SCENERY: [string, [number, number]][] = [
  ["lever", toWorld(LEVER_LOCAL)],
  ...BRAZIER_LOCAL.map((p, i): [string, [number, number]] => [`brazier ${i}`, toWorld(p)]),
  ...PILLAR_POS.map((p, i): [string, [number, number]] => [`pillar ${i}`, [p[0], p[2]]]),
  ["log", [LOG_POS[0], LOG_POS[2]]],
  ...TREE_POS.map((p, i): [string, [number, number]] => [`tree ${i}`, [p[0], p[2]]]),
  ...FLAGSTONE_POS.map((p, i): [string, [number, number]] => [`flagstone ${i}`, [p[0], p[2]]]),
  ...ROCK_SPOTS.map(([p], i): [string, [number, number]] => [`rock ${i}`, [p[0], p[2]]]),
];

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

/**
 * Gap between two home boxes: the largest separation along any axis that can
 * split them (each box's own x and z axes on the ground plane, plus y).
 * Negative means they overlap.
 */
function homeBoxGap(a: ReturnType<typeof homeBox>, b: ReturnType<typeof homeBox>): number {
  type V2 = [number, number];
  // three.js yaw takes local x to (cos, -sin) and local z to (sin, cos) on world x/z.
  const axes = (box: typeof a): [V2, V2] => [
    [Math.cos(box.yaw), -Math.sin(box.yaw)],
    [Math.sin(box.yaw), Math.cos(box.yaw)],
  ];
  const dot = (p: V2, q: V2) => p[0] * q[0] + p[1] * q[1];
  /** Half-width of a box's footprint projected on axis `n`. */
  const reach = (box: typeof a, [u, v]: [V2, V2], n: V2) =>
    box.half[0] * Math.abs(dot(u, n)) + box.half[2] * Math.abs(dot(v, n));
  const aAxes = axes(a);
  const bAxes = axes(b);
  const d: V2 = [b.centre[0] - a.centre[0], b.centre[2] - a.centre[2]];
  let gap = -Infinity;
  for (const n of [...aAxes, ...bAxes]) {
    gap = Math.max(gap, Math.abs(dot(d, n)) - reach(a, aAxes, n) - reach(b, bAxes, n));
  }
  const yGap = Math.abs(b.centre[1] - a.centre[1]) - a.half[1] - b.half[1];
  return Math.max(gap, yGap);
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

/**
 * Where a world point lands on screen from the home camera (fov CAMERA.fov,
 * 16:9), in units of the viewport height: x right, y down.
 */
function homeScreen(p: Vec3): [number, number] {
  const camera = new THREE.PerspectiveCamera(CAMERA.fov, 16 / 9, 0.5, 200);
  camera.position.set(...CAMERA_HOME.position);
  camera.lookAt(...CAMERA_HOME.target);
  camera.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(camera);
  return [(v.x * 16) / 9 / 2, -v.y / 2];
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
    expect(ids).toHaveLength(14);
    expect(relicIds).toHaveLength(7);
    for (const id of ids) expect(ITEM_HOME[id]).toHaveLength(3);
    expect(Object.keys(ITEM_HOME).sort()).toEqual([...ids].sort());
  });
  it("keeps every desk item's home within 2 units of the desk on x/z", () => {
    for (const id of deskIds) {
      const [x, , z] = ITEM_HOME[id];
      expect(Math.hypot(x - DESK_POS[0], z - DESK_POS[2]), id).toBeLessThanOrEqual(2);
    }
  });
  it("puts desk item homes on the desk top or the ground beside it", () => {
    for (const id of deskIds) {
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
  it("never overlaps any two items' colliders at home", () => {
    // Overlapping homes make rapier shove the bodies apart on every load, reset and respawn.
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        expect(homeBoxGap(homeBox(ids[i]), homeBox(ids[j])), `${ids[i]}/${ids[j]}`).toBeGreaterThanOrEqual(0.03);
      }
    }
  });
  it("keeps every item's top face visible from the home camera", () => {
    // A flat item behind a taller one is ungrabbable: the nearest hit wins the pointer.
    for (const id of ids) expect(topFaceVisibility(id), id).toBeGreaterThanOrEqual(0.75);
  });
  it("keeps the desk items apart on screen from the home camera", () => {
    // Two rows at different depths shift sideways on screen: a front item can
    // land on a back one, and then a press meant for one grabs the other.
    const desk = deskIds.map((id) => [id, homeScreen(homeBox(id).centre)] as const);
    for (let i = 0; i < desk.length; i++) {
      for (let j = i + 1; j < desk.length; j++) {
        const [a, pa] = desk[i];
        const [b, pb] = desk[j];
        expect(Math.hypot(pa[0] - pb[0], pa[1] - pb[1]), `${a}/${b}`).toBeGreaterThanOrEqual(0.03);
      }
    }
  });
  it("keeps homes clear of the altar", () => {
    for (const id of ids) {
      const [x, , z] = ITEM_HOME[id];
      expect(Math.hypot(x - ALTAR_POS[0], z - ALTAR_POS[2]), id).toBeGreaterThan(2.2);
    }
  });
});

describe("relic homes", () => {
  it("rest on the relic stand's plinth tops", () => {
    for (const id of relicIds) expect(ITEM_HOME[id][1], id).toBe(RELIC_TOP_Y);
  });
  it("stay well inside the island's edge", () => {
    for (const id of relicIds) {
      const [x, , z] = ITEM_HOME[id];
      expect(Math.hypot(x, z), id).toBeLessThanOrEqual(ISLAND_RADIUS - 0.45);
    }
  });
  it("stay off the plaza, with room to spare", () => {
    for (const id of relicIds) {
      const [x, , z] = ITEM_HOME[id];
      expect(Math.hypot(x - ALTAR_POS[0], z - ALTAR_POS[2]), id).toBeGreaterThanOrEqual(2.65);
    }
  });
  it("keep clear of the desk", () => {
    for (const id of relicIds) expect(deskFootprintDistance(ITEM_HOME[id]), id).toBeGreaterThanOrEqual(0.6);
  });
  it("keep apart from each other and from the scenery", () => {
    for (let i = 0; i < relicIds.length; i++) {
      const [x, , z] = ITEM_HOME[relicIds[i]];
      for (let j = i + 1; j < relicIds.length; j++) {
        const b = ITEM_HOME[relicIds[j]];
        expect(Math.hypot(x - b[0], z - b[2]), `${relicIds[i]}/${relicIds[j]}`).toBeGreaterThanOrEqual(0.55);
      }
      for (const [name, [sx, sz]] of SCENERY) {
        expect(Math.hypot(x - sx, z - sz), `${relicIds[i]}/${name}`).toBeGreaterThanOrEqual(0.55);
      }
    }
  });
  it("keep every relic's top face visible from the home camera", () => {
    for (const id of relicIds) expect(topFaceVisibility(id), id).toBeGreaterThanOrEqual(0.75);
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
