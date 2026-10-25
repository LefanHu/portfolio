import { describe, expect, it } from "vitest";
import { CAULDRON_DROP_RADIUS } from "@/lib/altar/drag";
import { ALTAR_POS, CAULDRON, CAULDRON_WALL_TOP, DESK_TOP_Y, ITEM_HOME } from "@/lib/altar/layout";
import { ITEMS } from "@/lib/altar/items";
import { itemCollider } from "@/lib/altar/itemColliders";
import {
  SUMMON_DROP_POINT,
  SUMMON_FLIGHT_MS,
  SUMMON_STAGGER_MS,
  summonPath,
  summonPlan,
} from "@/lib/altar/summon";
import type { ItemId } from "@/lib/altar/items";
import type { Vec3 } from "@/lib/altar/theme";

const ITEM_IDS = Object.keys(ITEMS) as ItemId[];
const smoothstep = (t: number) => t * t * (3 - 2 * t);
const axisDist = (p: Vec3) => Math.hypot(p[0] - ALTAR_POS[0], p[2] - ALTAR_POS[2]);

// Resting spots an item is summoned from: on the desk, on the ground, and the
// far side of the cauldron from the camera.
const STARTS: Record<string, Vec3> = {
  desk: [ITEM_HOME.keyboard[0], DESK_TOP_Y + 0.3, ITEM_HOME.keyboard[2]],
  ground: [ALTAR_POS[0] + 1.6, 0.5, ALTAR_POS[2] + 3],
  farSide: [ALTAR_POS[0] - 0.4, 0.5, ALTAR_POS[2] - 2.5],
};

const samples = (from: Vec3) =>
  Array.from({ length: 101 }, (_, i) => {
    const t = i / 100;
    return { t, u: smoothstep(t), p: summonPath(from, t) };
  });

describe("summonPath", () => {
  it("starts at the item, ends at the drop point, and clamps t", () => {
    const from: Vec3 = [3, 1.2, -2];
    expect(summonPath(from, 0)).toEqual(from);
    expect(summonPath(from, 1)).toEqual(SUMMON_DROP_POINT);
    expect(summonPath(from, -3)).toEqual(from);
    expect(summonPath(from, 7)).toEqual(SUMMON_DROP_POINT);
  });

  for (const [name, from] of Object.entries(STARTS)) {
    describe(`from the ${name}`, () => {
      const path = samples(from);

      it("arcs above the cauldron wall", () => {
        expect(Math.max(...path.map((s) => s.p[1]))).toBeGreaterThanOrEqual(CAULDRON_WALL_TOP + 1.0);
      });

      it("never clips the wall", () => {
        // The item starts low and outside, so only the wall's own footprint
        // (rimInner to rimOuter) must be cleared.
        for (const { t, p } of path) {
          const d = axisDist(p);
          if (d >= CAULDRON.rimInner && d <= CAULDRON.rimOuter) {
            expect(p[1], `t=${t}`).toBeGreaterThan(CAULDRON_WALL_TOP);
          }
        }
      });

      it("spirals inward over the opening", () => {
        const spiral = path.filter((s) => s.u >= 0.6);
        let prev = Infinity;
        for (const { t, p } of spiral) {
          const d = axisDist(p);
          expect(d, `t=${t}`).toBeLessThanOrEqual(CAULDRON_DROP_RADIUS + 1e-9);
          expect(d, `t=${t}`).toBeLessThanOrEqual(prev + 1e-9);
          prev = d;
        }
      });
    });
  }

  describe("clears the wall for a collider with extent", () => {
    const starts: [string, ItemId, Vec3][] = [
      ...ITEM_IDS.map((id): [string, ItemId, Vec3] => [`${id} home`, id, ITEM_HOME[id]]),
      // A resting ground item just outside the cauldron's footprint.
      ["ground 2.3 out", "coffeeMug", [ALTAR_POS[0] + 2.3, 0.24, ALTAR_POS[2]]],
    ];
    for (const [name, id, from] of starts) {
      it(name, () => {
        const { half, offset } = itemCollider(id);
        const reach = Math.hypot(half[0], half[2]) + Math.hypot(offset[0], offset[2]);
        const startDist = axisDist(from);
        for (const { t, p } of samples(from)) {
          const d = axisDist(p);
          if (d >= startDist) continue;
          if (d >= CAULDRON.rimInner - reach && d <= CAULDRON.rimOuter + reach) {
            expect(p[1] - half[1], `t=${t} d=${d.toFixed(2)}`).toBeGreaterThan(CAULDRON_WALL_TOP);
          }
        }
      });
    }
  });

  it("leaves room at the drop point when the second item is released", () => {
    const at = 1 - SUMMON_STAGGER_MS / SUMMON_FLIGHT_MS;
    for (const id of ITEM_IDS) {
      const p = summonPath(ITEM_HOME[id], at);
      expect(Math.hypot(p[0] - SUMMON_DROP_POINT[0], p[1] - SUMMON_DROP_POINT[1], p[2] - SUMMON_DROP_POINT[2]), id).toBeGreaterThanOrEqual(1.1);
    }
  });

  it("descends monotonically when the item starts above the arc's peak", () => {
    const from: Vec3 = [4, CAULDRON_WALL_TOP + 3, 0];
    const ys = samples(from).map((s) => s.p[1]);
    for (let i = 1; i < ys.length; i++) expect(ys[i]).toBeLessThanOrEqual(ys[i - 1] + 1e-9);
  });

  it("copes with an item right on the axis", () => {
    const p = summonPath([ALTAR_POS[0], 1, ALTAR_POS[2]], 0.5);
    expect(p.every(Number.isFinite)).toBe(true);
  });
});

describe("summonPlan", () => {
  const pair = ["keyboard", "driveUnit"] as const;

  it("flies both items into an empty cauldron", () => {
    expect(summonPlan(pair, [])).toEqual({ extras: [], fly: ["keyboard", "driveUnit"] });
  });

  it("skips an item that is already inside", () => {
    expect(summonPlan(pair, ["keyboard"])).toEqual({ extras: [], fly: ["driveUnit"] });
  });

  it("ejects occupants that are not part of the recipe", () => {
    expect(summonPlan(pair, ["notebook", "keyboard"])).toEqual({ extras: ["notebook"], fly: ["driveUnit"] });
  });
});
