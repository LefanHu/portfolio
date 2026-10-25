"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { CylinderCollider, RigidBody } from "@react-three/rapier";
import { RELIC_PLINTHS, RELIC_STAND } from "@/lib/altar/layout";
import { RELICS, type RelicId } from "@/lib/altar/relics";
import { PALETTE, type Vec3 } from "@/lib/altar/theme";
import { jitter } from "./geo";
import { occluderRef } from "./occluders";
import { Std } from "./Std";

const H = RELIC_STAND.height;
/** Plinth radii: a wide footing, a narrower shaft, and the cap the relic rests on. */
const BASE_R = 0.34;
const SHAFT_R = 0.22;
const CAP_R = 0.29;
const BASE_H = 0.08;
const CAP_H = 0.07;
/** Rune ring on the footing's ledge, round the shaft (the relic on the cap would hide it up top). */
const RING_R = 0.28;
const RING_BAND = 0.024;
/** HDR boost and opacity: faint by day, still past the bloom threshold. */
const RUNE_GLOW = 1.8;
const RUNE_OPACITY = 0.6;

const IDS = Object.keys(RELICS) as RelicId[];

/** Weathered stone geometry for one plinth; `seed` varies the chipping. */
function usePlinthGeometry(seed: number) {
  return useMemo(() => {
    const base = jitter(new THREE.CylinderGeometry(BASE_R - 0.02, BASE_R, BASE_H, 8, 1), 0.012, seed, { yAmount: 0.004 });
    const shaft = jitter(new THREE.CylinderGeometry(SHAFT_R - 0.01, SHAFT_R, H - BASE_H - CAP_H, 8, 1), 0.014, seed + 3, {
      yAmount: 0.004,
    });
    const cap = jitter(new THREE.CylinderGeometry(CAP_R, CAP_R - 0.015, CAP_H, 8, 1), 0.01, seed + 7, {
      flatTopY: CAP_H / 2,
    });
    return { base, shaft, cap };
  }, [seed]);
}

function Plinth({
  position,
  seed,
  ring,
  rune,
}: {
  position: Vec3;
  seed: number;
  ring: THREE.BufferGeometry;
  rune: THREE.Material;
}) {
  const g = usePlinthGeometry(seed);
  useEffect(
    () => () => {
      g.base.dispose();
      g.shaft.dispose();
      g.cap.dispose();
    },
    [g],
  );
  return (
    <group position={position} rotation={[0, seed * 0.7, 0]}>
      <group ref={occluderRef}>
        <mesh geometry={g.base} position={[0, BASE_H / 2, 0]} castShadow receiveShadow>
          <Std color={PALETTE.stoneDark} />
        </mesh>
        <mesh geometry={g.shaft} position={[0, (BASE_H + H - CAP_H) / 2, 0]} castShadow receiveShadow>
          <Std color={PALETTE.stone} />
        </mesh>
        <mesh geometry={g.cap} position={[0, H - CAP_H / 2, 0]} castShadow receiveShadow>
          <Std color={PALETTE.stoneWorn} />
        </mesh>
      </group>
      <mesh geometry={ring} material={rune} rotation={[-Math.PI / 2, 0, 0]} position={[0, BASE_H + 0.004, 0]} renderOrder={2} />
    </group>
  );
}

/**
 * The relic stand: a low weathered plinth per relic, each with a faint rune
 * ring in its relic's accent, so relics read apart from the desk ingredients.
 * Decorative only (no pointer handlers); one fixed collider per plinth whose
 * top is RELIC_TOP_Y. The rune glow is static: no per-frame work.
 */
export default function RelicStand() {
  const ring = useMemo(() => new THREE.RingGeometry(RING_R - RING_BAND / 2, RING_R + RING_BAND / 2, 32), []);
  useEffect(() => () => ring.dispose(), [ring]);
  const runes = useMemo(
    () =>
      IDS.map(
        (id) =>
          new THREE.MeshBasicMaterial({
            color: new THREE.Color(RELICS[id].accent).multiplyScalar(RUNE_GLOW),
            transparent: true,
            opacity: RUNE_OPACITY,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            toneMapped: false,
            fog: false,
            side: THREE.DoubleSide,
          }),
      ),
    [],
  );
  useEffect(() => () => runes.forEach((m) => m.dispose()), [runes]);

  return (
    <>
      {IDS.map((id, i) => (
        <Plinth key={id} position={RELIC_PLINTHS[i]} seed={11 + i * 5} ring={ring} rune={runes[i]} />
      ))}
      <RigidBody type="fixed" colliders={false}>
        {RELIC_PLINTHS.map((p, i) => (
          <CylinderCollider key={i} args={[H / 2, CAP_R]} position={[p[0], p[1] + H / 2, p[2]]} />
        ))}
      </RigidBody>
    </>
  );
}
