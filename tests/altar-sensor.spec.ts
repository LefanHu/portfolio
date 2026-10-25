import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createOccupancy } from "@/lib/altar/occupancy";
import { createAltarStore } from "@/lib/altar/store";
import { ejectVelocity } from "@/lib/altar/drag";
import { ITEMS, type ItemId } from "@/lib/altar/items";
import { itemCollider } from "@/lib/altar/itemColliders";
import { ALTAR_POS, CAULDRON, CAULDRON_FLOOR_TOP_LOCAL } from "@/lib/altar/layout";
import { EJECT_RESYNC_MS } from "@/lib/altar/occupancy";
import {
  CAULDRON_SENSE_RADIUS,
  CAULDRON_SENSE_TOP,
  cauldronContains,
  createSensorTracker,
  itemIdOf,
  setPresent,
} from "@/lib/altar/sensor";
import type { Vec3 } from "@/lib/altar/theme";

describe("itemIdOf", () => {
  it("reads a valid item id from userData", () => {
    expect(itemIdOf({ itemId: "keyboard" })).toBe("keyboard");
  });
  it("ignores missing or unknown ids", () => {
    expect(itemIdOf(undefined)).toBeNull();
    expect(itemIdOf({})).toBeNull();
    expect(itemIdOf({ itemId: "banana" })).toBeNull();
  });
});

describe("createSensorTracker", () => {
  it("reports enter once and leave once per item, across several colliders", () => {
    const log: string[] = [];
    const t = createSensorTracker(
      (id) => log.push(`in:${id}`),
      (id) => log.push(`out:${id}`),
    );
    t.enter("notebook");
    t.enter("notebook"); // second collider of the same body
    t.leave("notebook");
    expect(log).toEqual(["in:notebook"]);
    t.leave("notebook");
    expect(log).toEqual(["in:notebook", "out:notebook"]);
  });
  it("never goes negative on stray exits", () => {
    const log: string[] = [];
    const t = createSensorTracker(
      (id) => log.push(`in:${id}`),
      (id) => log.push(`out:${id}`),
    );
    t.leave("tool");
    t.enter("tool");
    expect(log).toEqual(["in:tool"]);
  });
});

describe("tracker occupancy", () => {
  it("lists occupants and their bodies, forgetting items that leave", () => {
    const t = createSensorTracker<string>(() => {}, () => {});
    t.enter("keyboard", "kb-body");
    t.enter("driveUnit", "du-body");
    t.enter("driveUnit", "du-body");
    expect(t.occupants()).toEqual(["keyboard", "driveUnit"]);
    expect(t.bodyOf("driveUnit")).toBe("du-body");
    t.leave("keyboard");
    expect(t.occupants()).toEqual(["driveUnit"]);
    expect(t.bodyOf("keyboard")).toBeUndefined();
    t.leave("driveUnit");
    expect(t.occupants()).toEqual(["driveUnit"]); // one collider still inside
    t.leave("driveUnit");
    expect(t.occupants()).toEqual([]);
  });
  it("resync re-fires onEnter for every occupant", () => {
    const log: string[] = [];
    const t = createSensorTracker((id) => log.push(id), () => {});
    t.enter("tool");
    t.enter("notebook");
    log.length = 0;
    t.resync();
    expect(log).toEqual(["tool", "notebook"]);
  });
});

describe("createOccupancy", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  it("feeds the store and re-enters occupants when the phase returns to idle", () => {
    const store = createAltarStore();
    const occ = createOccupancy(store);
    const off = occ.connect();
    occ.enter("keyboard");
    occ.enter("driveUnit");
    expect(store.getState().contents).toEqual(["keyboard", "driveUnit"]);
    store.getState().openSection("experience");
    // ignored by the store outside idle, but physically inside
    occ.enter("tool");
    expect(store.getState().contents).not.toContain("tool");
    store.getState().closeSection();
    store.getState().returnDone(); // empties contents, back to idle
    expect(store.getState().phase).toBe("idle");
    expect(store.getState().contents).toEqual(["keyboard", "driveUnit", "tool"]);
    off();
  });

  it("re-syncs stragglers a while after an eject", () => {
    const store = createAltarStore();
    const occ = createOccupancy(store, 1000);
    const off = occ.connect();
    occ.enter("keyboard");
    occ.enter("notebook");
    store.getState().clearAltar();
    expect(store.getState().contents).toEqual([]);
    occ.leave("notebook"); // ejected clear
    vi.advanceTimersByTime(999);
    expect(store.getState().contents).toEqual([]);
    vi.advanceTimersByTime(1);
    expect(store.getState().contents).toEqual(["keyboard"]);
    off();
  });

  it("stops re-syncing after disconnect", () => {
    const store = createAltarStore();
    const occ = createOccupancy(store, 1000);
    const off = occ.connect();
    occ.enter("keyboard");
    store.getState().clearAltar();
    off();
    vi.advanceTimersByTime(5000);
    expect(store.getState().contents).toEqual([]);
  });
});

describe("cauldronContains", () => {
  const ids = Object.keys(ITEMS) as ItemId[];
  const floorY = ALTAR_POS[1] + CAULDRON_FLOOR_TOP_LOCAL;
  const at = (r: number, y: number, a = 0.7): Vec3 => [ALTAR_POS[0] + Math.cos(a) * r, y, ALTAR_POS[2] + Math.sin(a) * r];
  /** Collider-centre height of `id` standing on a surface at `base`. */
  const comY = (id: ItemId, base: number) => base + itemCollider(id).offset[1];
  const height = (id: ItemId) => itemCollider(id).offset[1] + itemCollider(id).half[1];

  it.each(ids)("counts %s resting on the floor, anywhere it fits", (id) => {
    const c = itemCollider(id);
    expect(cauldronContains(at(0, comY(id, floorY)), false)).toBe(true);
    // lying flat against the inner wall: centre one horizontal half-extent inside
    const flatHalf = Math.min(c.half[0], c.half[2]);
    expect(cauldronContains(at(CAULDRON.rimInner - flatHalf, comY(id, floorY)), false)).toBe(true);
    // standing on edge flush against the wall: its vertical half-extent is perpendicular to the wall
    const edgeUp = Math.max(c.half[0], c.half[2]);
    expect(cauldronContains(at(CAULDRON.rimInner - c.half[1], floorY + edgeUp), false)).toBe(true);
  });

  const tall: ItemId[] = ["serverRack", "chalkBag", "coffeeMug", "driveUnit"];
  for (const base of tall) {
    it.each(ids.filter((i) => i !== base))(`counts %s stacked on a standing ${base}`, (top) => {
      expect(cauldronContains(at(0.3, comY(top, floorY + height(base))), false)).toBe(true);
    });
  }

  it("senses up to just inside the opening, short of any rim-resting centre", () => {
    expect(CAULDRON_SENSE_RADIUS).toBeGreaterThan(1.29);
    expect(CAULDRON.rimInner - CAULDRON_SENSE_RADIUS).toBeGreaterThanOrEqual(0.02 - 1e-9);
  });

  it.each(ids)("does not count %s resting on the rim band", (id) => {
    const rimTop = ALTAR_POS[1] + CAULDRON.basinBase + CAULDRON.lipTop + 0.2;
    // Resting on the band, its centre of mass is over the band (r >= rimInner), or it would tip in.
    for (const r of [CAULDRON.rimInner, (CAULDRON.rimInner + CAULDRON.rimOuter) / 2, CAULDRON.rimOuter]) {
      expect(cauldronContains(at(r, comY(id, rimTop)), false)).toBe(false);
    }
    expect(CAULDRON_SENSE_RADIUS).toBeLessThan(CAULDRON.rimInner);
  });

  it("never counts a held item, even right over the opening", () => {
    expect(cauldronContains(at(0, floorY + 0.1), true)).toBe(false);
    expect(cauldronContains(at(0.4, floorY + 0.8), true)).toBe(false);
  });

  it("ignores things outside the column", () => {
    expect(cauldronContains(at(0, CAULDRON_SENSE_TOP + 0.01), false)).toBe(false);
    expect(cauldronContains(at(0, floorY - 0.5), false)).toBe(false);
    expect(cauldronContains(at(2.0, 0.4), false)).toBe(false);
  });

  it("lets ejected items leave the column before the post-eject re-sync", () => {
    const g = 9.81;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      for (const r of [0, 0.6, 1.0]) {
        const p0 = at(r, floorY + 0.1, a);
        const v = ejectVelocity(p0, ALTAR_POS, 0.3);
        for (let t = EJECT_RESYNC_MS / 1000; t < 3; t += 0.01) {
          const p: Vec3 = [p0[0] + v[0] * t, p0[1] + v[1] * t - (g * t * t) / 2, p0[2] + v[2] * t];
          expect(cauldronContains(p, false)).toBe(false);
        }
      }
    }
  });
});

describe("setPresent", () => {
  it("turns per-frame presence into one enter and one leave", () => {
    const log: string[] = [];
    const t = createSensorTracker<string>(
      (id) => log.push(`+${id}`),
      (id) => log.push(`-${id}`),
    );
    setPresent(t, "keyboard", true, "body");
    setPresent(t, "keyboard", true, "body");
    expect(t.bodyOf("keyboard")).toBe("body");
    setPresent(t, "keyboard", false);
    setPresent(t, "keyboard", false);
    expect(log).toEqual(["+keyboard", "-keyboard"]);
    expect(t.occupants()).toEqual([]);
  });
});
