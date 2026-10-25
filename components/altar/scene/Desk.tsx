"use client";

import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { DESK_POS, DESK_ROT, DESK_SCALE, DESK_SIZE } from "@/lib/altar/layout";
import { PALETTE } from "@/lib/altar/theme";
import Lantern from "./Lantern";
import { occluderRef } from "./occluders";
import { Std } from "./Std";

const { w: W, d: D, h: H } = DESK_SIZE;

/** Wooden work desk to the right of the cauldron, with the theme lantern at its back corner. */
export default function Desk() {
  return (
    <>
      <group position={DESK_POS} rotation={[0, DESK_ROT, 0]} scale={DESK_SCALE} ref={occluderRef}>
        <mesh position={[0, H - 0.06, 0]} castShadow receiveShadow>
          <boxGeometry args={[W, 0.12, D]} />
          <Std color={PALETTE.wood} />
        </mesh>
        {/* plank seams */}
        {[-0.29, 0.29].map((z) => (
          <mesh key={z} position={[0, H + 0.001, z]} receiveShadow>
            <boxGeometry args={[W - 0.02, 0.004, 0.02]} />
            <Std color={PALETTE.woodDark} />
          </mesh>
        ))}
        {[
          [-W / 2 + 0.12, -D / 2 + 0.12],
          [W / 2 - 0.12, -D / 2 + 0.12],
          [-W / 2 + 0.12, D / 2 - 0.12],
          [W / 2 - 0.12, D / 2 - 0.12],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, (H - 0.12) / 2, z]} castShadow receiveShadow>
            <boxGeometry args={[0.13, H - 0.12, 0.13]} />
            <Std color={PALETTE.woodDark} />
          </mesh>
        ))}
        <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
          <boxGeometry args={[W - 0.3, 0.07, 0.07]} />
          <Std color={PALETTE.woodDark} />
        </mesh>
        <group position={[W / 2 + 0.15, 0, -D / 2 + 0.05]} rotation={[0, Math.PI, 0]}>
          <Lantern />
        </group>
      </group>
      {/* One solid block for the desk (items cannot roll under it), in world units. */}
      <RigidBody type="fixed" colliders={false} position={DESK_POS} rotation={[0, DESK_ROT, 0]}>
        <CuboidCollider
          args={[(W / 2) * DESK_SCALE, (H / 2) * DESK_SCALE, (D / 2) * DESK_SCALE]}
          position={[0, (H / 2) * DESK_SCALE, 0]}
        />
        {/* lantern post */}
        <CuboidCollider
          args={[0.06 * DESK_SCALE, 1.15 * DESK_SCALE, 0.06 * DESK_SCALE]}
          position={[(W / 2 + 0.15) * DESK_SCALE, 1.15 * DESK_SCALE, (-D / 2 + 0.05) * DESK_SCALE]}
        />
      </RigidBody>
    </>
  );
}
