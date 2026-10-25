import type * as THREE from "three";

/**
 * userData for invisible, enlarged click targets (lantern, lever). Pointer hits
 * on them are dropped whenever the same ray also hits an item, so a generous
 * hit box never steals an item drag (see Items.tsx).
 */
export const HITBOX = Object.freeze({ hitbox: true });

export function isHitbox(o: THREE.Object3D): boolean {
  return o.userData?.hitbox === true;
}
