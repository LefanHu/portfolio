import type { ItemId } from "./items";
import { ITEM_SCALE } from "./layout";
import type { Vec3 } from "./theme";

/** Per-item model scale on top of ITEM_SCALE: the server rack is a floor-standing piece. */
export const MODEL_SCALE: Partial<Record<ItemId, number>> = { serverRack: 1.6 };

interface ColliderSpec {
  /** Cuboid half extents, model units, in the collider's own (yawed) frame. */
  half: Vec3;
  /** Cuboid centre, model units, in the collider's own (yawed) frame. */
  offset: Vec3;
  /** Yaw of the model's inner group (see ItemModel), so the box hugs the model. */
  rotY: number;
}

/** One box per item, fitted by hand to its low-poly model (ItemModel.tsx). */
export const ITEM_COLLIDERS: Record<ItemId, ColliderSpec> = {
  tool: { half: [0.26, 0.026, 0.08], offset: [0.05, 0.026, 0], rotY: 0.5 },
  notebook: { half: [0.175, 0.05, 0.21], offset: [0, 0.05, 0], rotY: -0.25 },
  driveUnit: { half: [0.17, 0.08, 0.17], offset: [0, 0.08, 0], rotY: 0.3 },
  keyboard: { half: [0.28, 0.034, 0.12], offset: [0, 0.034, 0], rotY: -0.12 },
  fpgaChip: { half: [0.18, 0.028, 0.165], offset: [0, 0.028, 0], rotY: 0.6 },
  solderingIron: { half: [0.175, 0.08, 0.12], offset: [0.055, 0.08, 0], rotY: -0.7 },
  serverRack: { half: [0.13, 0.25, 0.125], offset: [0, 0.25, 0], rotY: 0.15 },
  chalkBag: { half: [0.15, 0.135, 0.14], offset: [0, 0.135, 0], rotY: 0 },
  fpvDrone: { half: [0.24, 0.03, 0.24], offset: [0, 0.077, 0], rotY: 0.4 },
  coffeeMug: { half: [0.138, 0.1, 0.1], offset: [0.038, 0.1, 0], rotY: -0.8 },
};

/** Total visual scale of an item (ITEM_SCALE × MODEL_SCALE). */
export function itemScale(id: ItemId): number {
  return ITEM_SCALE * (MODEL_SCALE[id] ?? 1);
}

/** An item's collider in its rigid body's frame (world units): half extents, centre and yaw. */
export function itemCollider(id: ItemId): { half: Vec3; offset: Vec3; rotY: number } {
  const { half, offset, rotY } = ITEM_COLLIDERS[id];
  const s = itemScale(id);
  const c = Math.cos(rotY);
  const n = Math.sin(rotY);
  // three.js yaw: x' = x cos + z sin, z' = -x sin + z cos
  const ox = offset[0] * c + offset[2] * n;
  const oz = -offset[0] * n + offset[2] * c;
  return {
    half: [half[0] * s, half[1] * s, half[2] * s],
    offset: [ox * s, offset[1] * s, oz * s],
    rotY,
  };
}
