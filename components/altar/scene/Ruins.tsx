"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { CuboidCollider, CylinderCollider, RigidBody } from "@react-three/rapier";
import { FLAGSTONE_POS, GROUND_Y, LOG_POS, PILLAR_POS } from "@/lib/altar/layout";
import { PALETTE, type Vec3 } from "@/lib/altar/theme";
import { jitter } from "./geo";
import { occluderRef } from "./occluders";
import { Std } from "./Std";

function Pillar({
  position,
  height,
  capped,
  broken,
}: {
  position: Vec3;
  height: number;
  capped?: boolean;
  broken?: boolean;
}) {
  const shaft = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.27, 0.3, height, 8, 2);
    return broken ? jitter(g, 0.05, Math.round(height * 100), { yAmount: 0.12 }) : g;
  }, [height, broken]);
  const total = 0.2 + height + (capped ? 0.2 : 0);
  return (
    <group position={position} ref={occluderRef}>
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.78, 0.2, 0.78]} />
        <Std color={PALETTE.stoneDark} />
      </mesh>
      <mesh geometry={shaft} position={[0, 0.2 + height / 2, 0]} castShadow receiveShadow>
        <Std color={PALETTE.stone} />
      </mesh>
      {capped && (
        <mesh position={[0, 0.2 + height + 0.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.2, 0.8]} />
          <Std color={PALETTE.stoneWorn} />
        </mesh>
      )}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[0.39, 0.1, 0.39]} position={[0, 0.1, 0]} />
        <CylinderCollider args={[(total - 0.2) / 2, 0.3]} position={[0, 0.2 + (total - 0.2) / 2, 0]} />
      </RigidBody>
    </group>
  );
}

/** Ruins and the flagstone path. They sit behind/left of the cauldron so nothing hides its base. */
export default function Ruins() {
  return (
    <group position={[0, GROUND_Y - 0.02, 0]}>
      <Pillar position={PILLAR_POS[0]} height={2.9} capped />
      <Pillar position={PILLAR_POS[1]} height={0.6} broken />
      {/* flagstone path leading from the front lawn to the plaza */}
      {FLAGSTONE_POS.map((p, i) => (
        <mesh key={i} position={p} rotation={[0, 0.7 + i * 0.35, 0]} receiveShadow>
          <boxGeometry args={[0.5 - i * 0.03, 0.07, 0.38]} />
          <Std color={PALETTE.stoneWorn} />
        </mesh>
      ))}
      {/* fallen drum */}
      <RigidBody type="fixed" colliders="hull" position={LOG_POS} rotation={[0, 0.4, Math.PI / 2]}>
        <mesh castShadow receiveShadow ref={occluderRef}>
          <cylinderGeometry args={[0.26, 0.26, 1.1, 8]} />
          <Std color={PALETTE.stone} />
        </mesh>
      </RigidBody>
    </group>
  );
}
