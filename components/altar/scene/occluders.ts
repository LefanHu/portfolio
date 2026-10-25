import * as THREE from "three";
import { isHitbox } from "./hitbox";

// Solid scenery that hides items (cauldron, desk, pillars, trees). R3F only
// raycasts objects with pointer handlers, so without this an item hidden behind
// the cauldron could still be hovered and grabbed through it.

const occluders = new Set<THREE.Object3D>();

/** Ref callback: marks an object (and its children) as solid for item picking. */
export function occluderRef(o: THREE.Object3D | null) {
  if (!o) return;
  occluders.add(o);
  return () => {
    occluders.delete(o);
  };
}

const raycaster = new THREE.Raycaster();

/** Whether solid scenery lies along `ray` closer than `distance`. */
export function isOccluded(ray: THREE.Ray, distance: number): boolean {
  if (occluders.size === 0) return false;
  raycaster.ray.copy(ray);
  raycaster.near = 0;
  raycaster.far = Math.max(0, distance - 0.01);
  return raycaster.intersectObjects([...occluders], true).some((h) => !isHitbox(h.object));
}
