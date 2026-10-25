"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { boardLayout } from "@/lib/altar/board";
import RecipeBoard from "./RecipeBoard";

/** Time constant (s) of the board's drift back into place after the camera moves. */
const FOLLOW_S = 0.35;

const _target = new THREE.Vector3();

/**
 * Hangs the recipe board in the sky left of the island (see lib/altar/board.ts).
 * A world-space pane that floats after the camera: when the visitor orbits or
 * zooms, it lags, then eases back to the same spot and size, so it never
 * swings off screen and is crisp (1:1) whenever the camera rests.
 * Pointer events are off, so it never takes a click or a drag from the scene,
 * and it adds nothing raycastable. Its z-range sits under the item tooltip's.
 */
export default function RecipeBoardInScene() {
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const b = useMemo(() => boardLayout({ width, height }), [width, height]);
  const group = useRef<THREE.Group>(null);
  const placed = useRef(false);

  // drei's Html mounted in the Canvas's first render (inside react-dom's
  // commit) has its DOM root torn down by a deferred unmount and stays empty.
  // Mounting a frame later, as the projection and tooltips naturally do, works.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Priority -1 runs before drei's Html frame (0), so the DOM uses this frame's pose.
  useFrame(({ camera }, delta) => {
    const g = group.current;
    if (!g) return;
    camera.updateMatrixWorld();
    _target.set(...b.local).applyMatrix4(camera.matrixWorld);
    const k = placed.current ? 1 - Math.exp(-Math.min(delta, 0.1) / FOLLOW_S) : 1;
    placed.current = true;
    g.position.lerp(_target, k);
    g.quaternion.slerp(camera.quaternion, k);
    g.updateMatrixWorld();
  }, -1);

  if (!ready) return null;

  return (
    <group ref={group}>
      <Html transform distanceFactor={b.distanceFactor} zIndexRange={[10, 0]} pointerEvents="none">
        <div style={{ width: b.cssWidth, fontSize: b.fontSize }}>
          <RecipeBoard />
        </div>
      </Html>
    </group>
  );
}
