import { describe, expect, it } from "vitest";
import {
  CAULDRON_DROP_RADIUS,
  DRAG_GROUND_RADIUS,
  LIFT_HEIGHT,
  MAX_THROW_SPEED,
  RIM_TOP_Y,
  clampMagnitude,
  dragTarget,
  followStep,
  DRAGGED_GROUPS,
  ITEM_GROUPS,
  ejectVelocity,
  releaseMotion,
  clearanceY,
  resolveDragTarget,
  throwVelocity,
  type Ray,
} from "@/lib/altar/drag";
import { ITEMS, type ItemId } from "@/lib/altar/items";
import { ITEM_COLLIDERS, itemCollider } from "@/lib/altar/itemColliders";
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
} from "@/lib/altar/layout";
import { CAMERA, type Vec3 } from "@/lib/altar/theme";

/** A ray from the default camera position aimed at a world point. */
function rayAt(target: Vec3, origin: Vec3 = CAMERA.position): Ray {
  const d: Vec3 = [target[0] - origin[0], target[1] - origin[1], target[2] - origin[2]];
  const l = Math.hypot(...d);
  return { origin, direction: [d[0] / l, d[1] / l, d[2] / l] };
}

const distXZ = (p: Vec3, q: Vec3) => Math.hypot(p[0] - q[0], p[2] - q[2]);

describe("dragTarget", () => {
  it("intersects a downward ray with the plane", () => {
    expect(dragTarget({ origin: [0, 5, 0], direction: [0, -1, 0] }, 1)).toEqual([0, 1, 0]);
  });
  it("accepts {x,y,z} vectors (three.js Ray)", () => {
    const p = dragTarget({ origin: { x: 1, y: 3, z: 2 }, direction: { x: 0, y: -1, z: 0 } }, 0);
    expect(p).toEqual([1, 0, 2]);
  });
  it("follows an oblique ray", () => {
    const p = dragTarget({ origin: [0, 2, 0], direction: [Math.SQRT1_2, -Math.SQRT1_2, 0] }, 0)!;
    expect(p[0]).toBeCloseTo(2);
    expect(p[1]).toBeCloseTo(0);
    expect(p[2]).toBeCloseTo(0);
  });
  it("returns null for a ray parallel to the plane", () => {
    expect(dragTarget({ origin: [0, 5, 0], direction: [1, 0, 0] }, 1)).toBeNull();
  });
  it("returns null for a ray pointing away from the plane", () => {
    expect(dragTarget({ origin: [0, 5, 0], direction: [0, 1, 0] }, 1)).toBeNull();
    expect(dragTarget({ origin: [0, 0, 0], direction: [0, -1, 0] }, 1)).toBeNull();
  });
  it("lifts by 0.6", () => {
    expect(LIFT_HEIGHT).toBe(0.6);
  });
});

describe("resolveDragTarget", () => {
  const altarCenter: Vec3 = [ALTAR_POS[0], RIM_TOP_Y, ALTAR_POS[2]];

  it("hovers above the opening when the cursor is over the cauldron, clear of the walls", () => {
    const r = resolveDragTarget(rayAt(altarCenter))!;
    expect(r.zone).toBe("cauldron");
    expect(distXZ(r.position, ALTAR_POS)).toBeCloseTo(0, 5);
    expect(r.position[1]).toBeCloseTo(RIM_TOP_Y + LIFT_HEIGHT);
    expect(r.position[1]).toBeGreaterThan(CAULDRON_WALL_TOP);
  });
  it("clamps cauldron hovers inside the opening", () => {
    const edge: Vec3 = [ALTAR_POS[0] + CAULDRON.rimOuter - 0.05, RIM_TOP_Y, ALTAR_POS[2]];
    const r = resolveDragTarget(rayAt(edge))!;
    expect(r.zone).toBe("cauldron");
    expect(distXZ(r.position, ALTAR_POS)).toBeLessThanOrEqual(CAULDRON_DROP_RADIUS + 1e-9);
  });
  it("treats a ray through the cauldron belly as the cauldron", () => {
    // Aim at the plaza floor directly behind the cauldron's front wall.
    const belly: Vec3 = [ALTAR_POS[0] + 0.5, GROUND_Y, ALTAR_POS[2] + 0.5];
    expect(resolveDragTarget(rayAt(belly))!.zone).toBe("cauldron");
  });
  it("lifts above the desk top over the desk", () => {
    const r = resolveDragTarget(rayAt([DESK_POS[0], DESK_TOP_Y, DESK_POS[2]]))!;
    expect(r.zone).toBe("desk");
    expect(r.position[0]).toBeCloseTo(DESK_POS[0]);
    expect(r.position[2]).toBeCloseTo(DESK_POS[2]);
    expect(r.position[1]).toBeCloseTo(DESK_TOP_Y + LIFT_HEIGHT);
  });
  it("lifts above the grass elsewhere", () => {
    const grass: Vec3 = [2.5, GROUND_Y, 2.0];
    const r = resolveDragTarget(rayAt(grass))!;
    expect(r.zone).toBe("ground");
    expect(r.position[0]).toBeCloseTo(2.5);
    expect(r.position[2]).toBeCloseTo(2.0);
    expect(r.position[1]).toBeCloseTo(GROUND_Y + LIFT_HEIGHT);
  });
  it("keeps the drag point on the island", () => {
    const r = resolveDragTarget(rayAt([9, GROUND_Y, 9]))!;
    expect(r.zone).toBe("ground");
    expect(Math.hypot(r.position[0], r.position[2])).toBeCloseTo(DRAG_GROUND_RADIUS);
    expect(DRAG_GROUND_RADIUS).toBeLessThan(ISLAND_RADIUS);
    // ...but a fling past the edge still aims past it, so the throw carries on.
    expect(Math.hypot(r.aim[0], r.aim[2])).toBeGreaterThan(ISLAND_RADIUS);
  });
  it("aims where it holds everywhere else", () => {
    const r = resolveDragTarget(rayAt([DESK_POS[0], DESK_TOP_Y, DESK_POS[2]]))!;
    expect(r.aim).toEqual(r.position);
  });
  it("returns null for a ray that never comes down", () => {
    expect(resolveDragTarget({ origin: [0, 5, 0], direction: [1, 0, 0] })).toBeNull();
    expect(resolveDragTarget({ origin: [0, 5, 0], direction: [0, 1, 0] })).toBeNull();
  });
});

describe("resolveDragTarget: solid faces", () => {
  const cam = CAMERA.position;
  const toCam = (() => {
    const dx = cam[0] - ALTAR_POS[0];
    const dz = cam[2] - ALTAR_POS[2];
    const l = Math.hypot(dx, dz);
    return [dx / l, dz / l] as const;
  })();
  const surface: [number, number][] = [];
  for (const side of [0, 0.8, 1.3]) for (const y of [0.8, 1.4, 2.0, 2.5]) surface.push([side, y]);
  it.each(surface)("pointing at the cauldron's front wall (side %f, y %f) holds the item over the opening", (side, y) => {
    const fwd = Math.sqrt(1.6 * 1.6 - side * side);
    const p: Vec3 = [
      ALTAR_POS[0] + toCam[0] * fwd - toCam[1] * side,
      y,
      ALTAR_POS[2] + toCam[1] * fwd + toCam[0] * side,
    ];
    const r = resolveDragTarget(rayAt(p))!;
    expect(r.zone).toBe("cauldron");
    expect(distXZ(r.position, ALTAR_POS)).toBeLessThanOrEqual(CAULDRON_DROP_RADIUS + 1e-9);
    expect(r.position[1]).toBeCloseTo(RIM_TOP_Y + LIFT_HEIGHT);
  });

  const hx = (DESK_SIZE.w / 2) * DESK_SCALE;
  const hz = (DESK_SIZE.d / 2) * DESK_SCALE;
  const faces: [number, number, number][] = [];
  for (const lz of [hz, -hz]) for (const lx of [-hx * 0.5, 0, hx * 0.5]) for (const h of [0.2, 0.5, 0.8]) faces.push([lx, lz, h]);
  it.each(faces)("pointing at the desk's side (lx %f, lz %f, h %f) holds the item above the desk top", (lx, lz, h) => {
    const c = Math.cos(DESK_ROT);
    const s = Math.sin(DESK_ROT);
    const w: Vec3 = [DESK_POS[0] + lx * c + lz * s, GROUND_Y + h, DESK_POS[2] - lx * s + lz * c];
    const r = resolveDragTarget(rayAt(w))!;
    expect(r.zone).toBe("desk");
    expect(r.position[1]).toBeCloseTo(DESK_TOP_Y + LIFT_HEIGHT);
    const dx = r.position[0] - DESK_POS[0];
    const dz = r.position[2] - DESK_POS[2];
    expect(Math.abs(dx * c - dz * s)).toBeLessThan(hx);
    expect(Math.abs(dx * s + dz * c)).toBeLessThan(hz);
  });
});

describe("clearanceY", () => {
  const reach = 0.4;
  it("keeps a held item above the wall band (and so the sensor) anywhere near the cauldron", () => {
    for (const r of [0, 1.0, CAULDRON.rimInner, CAULDRON.rimOuter, CAULDRON.rimOuter + reach - 0.01]) {
      expect(clearanceY([ALTAR_POS[0] + r, 0, ALTAR_POS[2]], reach)).toBeGreaterThan(CAULDRON_WALL_TOP);
    }
  });
  it("keeps a held item out of the desk block", () => {
    expect(clearanceY([DESK_POS[0], 0, DESK_POS[2]], reach)).toBeGreaterThanOrEqual(DESK_TOP_Y);
  });
  it("is unconstrained over open ground", () => {
    expect(clearanceY([2.5, 0, 2.0], reach)).toBe(-Infinity);
  });
});

describe("releaseMotion", () => {
  const fast = [
    { t: 0.0, p: [0, 3, 0] as Vec3 },
    { t: 0.05, p: [0.4, 3, 0] as Vec3 },
  ];
  it("drops straight in over the cauldron, snapped to the held point", () => {
    const target: Vec3 = [ALTAR_POS[0] + 0.5, RIM_TOP_Y + LIFT_HEIGHT, ALTAR_POS[2]];
    const m = releaseMotion("cauldron", target, fast);
    expect(m.velocity).toEqual([0, 0, 0]);
    expect(m.snapTo).toEqual(target);
    expect(m.snapTo![1]).toBeGreaterThan(CAULDRON_WALL_TOP);
  });
  it("throws everywhere else", () => {
    const m = releaseMotion("ground", [0, 0.84, 0], fast);
    expect(m.snapTo).toBeNull();
    expect(m.velocity[0]).toBeGreaterThan(5);
  });
  it("is a plain drop with no target", () => {
    expect(releaseMotion(null, null, fast).velocity[0]).toBeGreaterThan(5);
  });
});

describe("throw velocity", () => {
  it("clamps a vector's magnitude", () => {
    expect(clampMagnitude([3, 4, 0], 10)).toEqual([3, 4, 0]);
    const c = clampMagnitude([30, 40, 0], 10);
    expect(Math.hypot(...c)).toBeCloseTo(10);
    expect(c[0] / c[1]).toBeCloseTo(0.75);
  });
  it("is zero with fewer than two samples", () => {
    expect(throwVelocity([])).toEqual([0, 0, 0]);
    expect(throwVelocity([{ t: 0, p: [1, 1, 1] }])).toEqual([0, 0, 0]);
  });
  it("averages the motion over the recent window", () => {
    const samples = [
      { t: 0.0, p: [0, 0, 0] as Vec3 },
      { t: 0.5, p: [0, 0, 0] as Vec3 },
      { t: 0.55, p: [0.1, 0, 0] as Vec3 },
      { t: 0.6, p: [0.2, 0, 0] as Vec3 },
    ];
    const v = throwVelocity(samples, { windowS: 0.1 });
    expect(v[0]).toBeCloseTo(2);
    expect(v[1]).toBeCloseTo(0);
  });
  it("is zero after the pointer rests", () => {
    const samples = [
      { t: 0.0, p: [0, 0, 0] as Vec3 },
      { t: 0.1, p: [1, 0, 0] as Vec3 },
      { t: 0.5, p: [1, 0, 0] as Vec3 },
      { t: 0.6, p: [1, 0, 0] as Vec3 },
    ];
    expect(throwVelocity(samples, { windowS: 0.1 })).toEqual([0, 0, 0]);
  });
  it("never exceeds the max throw speed", () => {
    const samples = [
      { t: 0.0, p: [0, 0, 0] as Vec3 },
      { t: 0.05, p: [50, 0, 0] as Vec3 },
    ];
    expect(Math.hypot(...throwVelocity(samples))).toBeCloseTo(MAX_THROW_SPEED);
  });
});

describe("ejectVelocity", () => {
  const g = 9.81;
  /** Simulate the flight (no drag) and report where it lands on the ground. */
  function flight(start: Vec3, v: Vec3) {
    let maxYAtWall = Infinity;
    for (let t = 0; t < 5; t += 0.001) {
      const x = start[0] + v[0] * t;
      const z = start[2] + v[2] * t;
      const y = start[1] + v[1] * t - (g * t * t) / 2;
      const r = Math.hypot(x - ALTAR_POS[0], z - ALTAR_POS[2]);
      if (r >= CAULDRON.rimInner && r <= CAULDRON.rimOuter + 0.4) maxYAtWall = Math.min(maxYAtWall, y);
      if (y <= GROUND_Y && t > 0.2) return { x, z, lowestOverWall: maxYAtWall };
    }
    throw new Error("never landed");
  }
  const floorY = ALTAR_POS[1] + CAULDRON.basinBase + CAULDRON.energyY;
  const starts: Vec3[] = [
    [ALTAR_POS[0], floorY, ALTAR_POS[2]],
    [ALTAR_POS[0] + 1.0, floorY, ALTAR_POS[2]],
    [ALTAR_POS[0], floorY, ALTAR_POS[2] - 1.0],
    [ALTAR_POS[0] - 0.7, floorY, ALTAR_POS[2] + 0.7],
  ];
  it.each(starts.map((s, i) => [i, s] as const))("carries body %i over the wall and onto the island", (_i, s) => {
    const v = ejectVelocity(s, ALTAR_POS, 0.3);
    const land = flight(s, v);
    expect(land.lowestOverWall).toBeGreaterThan(CAULDRON_WALL_TOP + 0.3);
    const r = Math.hypot(land.x - ALTAR_POS[0], land.z - ALTAR_POS[2]);
    expect(r).toBeGreaterThan(CAULDRON.plazaRadius);
    expect(Math.hypot(land.x, land.z)).toBeLessThan(ISLAND_RADIUS - 0.3);
  });
  const ring: Vec3[] = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return [ALTAR_POS[0] + Math.cos(a) * 1.0, floorY, ALTAR_POS[2] + Math.sin(a) * 1.0];
  });
  const camDir = (() => {
    const dx = CAMERA.position[0] - ALTAR_POS[0];
    const dz = CAMERA.position[2] - ALTAR_POS[2];
    const l = Math.hypot(dx, dz);
    return [dx / l, dz / l];
  })();
  it.each(ring.map((s, i) => [i, s] as const))("lands body %i on the camera's side, clear of the cauldron", (_i, s) => {
    const v = ejectVelocity(s, ALTAR_POS, 0);
    const land = flight(s, v);
    expect(land.lowestOverWall).toBeGreaterThan(CAULDRON_WALL_TOP + 0.3);
    const dx = land.x - ALTAR_POS[0];
    const dz = land.z - ALTAR_POS[2];
    expect(dx * camDir[0] + dz * camDir[1]).toBeGreaterThanOrEqual(-1e-6);
    expect(Math.hypot(dx, dz)).toBeGreaterThan(CAULDRON.plazaRadius);
    expect(Math.hypot(land.x, land.z)).toBeLessThan(ISLAND_RADIUS - 0.3);
  });
  it("points outward from the centre", () => {
    const v = ejectVelocity([ALTAR_POS[0] + 0.8, floorY, ALTAR_POS[2]], ALTAR_POS, 0);
    expect(v[0]).toBeGreaterThan(0);
    expect(Math.abs(v[2])).toBeLessThan(1e-9);
    expect(v[1]).toBeGreaterThan(0);
  });
});

describe("item colliders", () => {
  const ids = Object.keys(ITEMS) as ItemId[];
  it("has one collider per item", () => {
    expect(Object.keys(ITEM_COLLIDERS).sort()).toEqual([...ids].sort());
  });
  it.each(ids)("%s rests on its base and fits through the opening", (id) => {
    const c = itemCollider(id);
    expect(c.half.every((h) => h > 0)).toBe(true);
    const bottom = c.offset[1] - c.half[1];
    expect(bottom).toBeGreaterThanOrEqual(-1e-9);
    expect(bottom).toBeLessThan(0.08);
    const reach = Math.hypot(c.half[0], c.half[2]) + Math.hypot(c.offset[0], c.offset[2]);
    // Even at the clamp edge, no corner reaches past the opening onto the wall band.
    expect(CAULDRON_DROP_RADIUS + reach).toBeLessThanOrEqual(CAULDRON.rimInner);
  });
});

describe("followStep", () => {
  it("converges on the target", () => {
    let p: Vec3 = [0, 1, 0];
    for (let i = 0; i < 120; i++) p = followStep(p, [1, 1, 1], 1 / 60);
    expect(p[0]).toBeCloseTo(1, 3);
    expect(p[2]).toBeCloseTo(1, 3);
  });
  it("rises before it moves sideways onto a higher target (clears walls)", () => {
    const p = followStep([0, 0.8, 0], [3, 3.2, 0], 1 / 60);
    expect(p[1]).toBeGreaterThan(0.8);
    expect(p[0]).toBe(0);
  });
  it("moves sideways while descending", () => {
    const p = followStep([0, 3.2, 0], [3, 0.8, 0], 1 / 60);
    expect(p[0]).toBeGreaterThan(0);
    expect(p[1]).toBeLessThan(3.2);
  });
  it("is frame-rate independent-ish and never overshoots", () => {
    const slow = followStep([0, 1, 0], [1, 1, 0], 0.25);
    expect(slow[0]).toBeGreaterThan(0.9);
    expect(slow[0]).toBeLessThanOrEqual(1);
  });
});

describe("collision groups", () => {
  const interacts = (a: number, b: number) =>
    ((a >>> 16) & (b & 0xffff)) !== 0 && ((b >>> 16) & (a & 0xffff)) !== 0;
  const DEFAULT = 0xffffffff;
  it("held items pass through other items but still hit the world", () => {
    expect(interacts(DRAGGED_GROUPS, ITEM_GROUPS)).toBe(false);
    expect(interacts(DRAGGED_GROUPS, DEFAULT)).toBe(true);
    expect(interacts(ITEM_GROUPS, ITEM_GROUPS)).toBe(true);
    expect(interacts(ITEM_GROUPS, DEFAULT)).toBe(true);
  });
});
