"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { CylinderCollider, RigidBody } from "@react-three/rapier";
import { ALTAR_POS, DESK_POS, GROUND_Y, ISLAND_RADIUS, ROCK_SPOTS, TREE_POS } from "@/lib/altar/layout";
import { PALETTE, type Vec3 } from "@/lib/altar/theme";
import { islandRockGeometry, jitter, mulberry32, rockChunkGeometry, strataColors } from "./geo";
import { occluderRef } from "./occluders";
import { Std } from "./Std";

function GrassTufts() {
  const tufts = useMemo(() => {
    const rnd = mulberry32(7);
    const out: { p: Vec3; s: number; r: number; c: string }[] = [];
    let guard = 0;
    while (out.length < 60 && guard++ < 1500) {
      const a = rnd() * Math.PI * 2;
      const d = 1.0 + rnd() * (ISLAND_RADIUS - 0.6);
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d;
      // keep clear of the altar plaza and desk
      if (Math.hypot(x - ALTAR_POS[0], z - ALTAR_POS[2]) < 2.4) continue;
      if (Math.hypot(x - DESK_POS[0], z - DESK_POS[2]) < 2.0) continue;
      out.push({
        p: [x, GROUND_Y, z],
        s: 0.6 + rnd() * 0.7,
        r: rnd() * Math.PI,
        c: rnd() > 0.5 ? PALETTE.grassLight : PALETTE.grassDark,
      });
    }
    return out;
  }, []);
  return (
    <>
      {tufts.map((t, i) => (
        <group key={i} position={t.p} rotation={[0, t.r, 0]} scale={t.s}>
          <mesh position={[0, 0.09, 0]} rotation={[0.15, 0, 0.1]} castShadow>
            <coneGeometry args={[0.06, 0.22, 4]} />
            <Std color={t.c} />
          </mesh>
          <mesh position={[0.07, 0.07, 0.02]} rotation={[0, 0, -0.35]} castShadow>
            <coneGeometry args={[0.05, 0.16, 4]} />
            <Std color={t.c} />
          </mesh>
          <mesh position={[-0.05, 0.06, -0.04]} rotation={[0.3, 0, 0.3]} castShadow>
            <coneGeometry args={[0.045, 0.14, 4]} />
            <Std color={t.c} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Roots() {
  const roots = useMemo(() => {
    const rnd = mulberry32(21);
    return Array.from({ length: 9 }, (_, i) => {
      const a = (i / 9) * Math.PI * 2 + rnd() * 0.4;
      const d = 1.1 + rnd() * 1.9;
      const len = 1.3 + rnd() * 2.0;
      return {
        p: [Math.cos(a) * d, -1.5 - rnd() * 1.0, Math.sin(a) * d] as Vec3,
        rot: [(rnd() - 0.5) * 0.5, 0, (rnd() - 0.5) * 0.5] as Vec3,
        len,
        r: 0.06 + rnd() * 0.05,
      };
    });
  }, []);
  return (
    <>
      {roots.map((r, i) => (
        <group key={i} position={r.p} rotation={r.rot}>
          <mesh position={[0, -r.len / 2, 0]} castShadow>
            <coneGeometry args={[r.r, r.len, 5]} />
            <Std color={PALETTE.root} />
          </mesh>
          <mesh position={[0.08, -r.len * 0.45, 0]} rotation={[0, 0, 0.6]}>
            <coneGeometry args={[r.r * 0.5, r.len * 0.45, 4]} />
            <Std color={PALETTE.root} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Tree({ position, scale = 1 }: { position: Vec3; scale?: number }) {
  const tiers = useMemo(
    () =>
      [0, 1, 2].map((i) =>
        jitter(new THREE.ConeGeometry(0.95 - i * 0.22, 1.1, 7, 1), 0.07, 40 + i),
      ),
    [],
  );
  return (
    <group position={position} scale={scale} ref={occluderRef}>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.16, 0.9, 6]} />
        <Std color={PALETTE.woodDark} />
      </mesh>
      {tiers.map((geo, i) => (
        <mesh
          key={i}
          geometry={geo}
          position={[0, 1.25 + i * 0.6, 0]}
          rotation={[0, i * 0.7, 0]}
          castShadow
          receiveShadow
        >
          <Std color={i === 1 ? PALETTE.grass : PALETTE.grassDark} />
        </mesh>
      ))}
    </group>
  );
}

function Rocks() {
  const rocks = useMemo(() => {
    return ROCK_SPOTS.map(([p, s], i) => ({ p, s, g: rockChunkGeometry(s, 80 + i) }));
  }, []);
  return (
    <>
      {rocks.map((r, i) => (
        <mesh key={i} geometry={r.g} position={r.p} castShadow receiveShadow>
          <Std color={i % 2 ? PALETTE.stoneDark : PALETTE.stone} />
        </mesh>
      ))}
    </>
  );
}

/** Island ground collider: a slab whose top is the grass level. */
function Ground() {
  const half = 0.3;
  return (
    <RigidBody type="fixed" colliders={false}>
      <CylinderCollider args={[half, ISLAND_RADIUS + 0.1]} position={[0, GROUND_Y - half, 0]} />
    </RigidBody>
  );
}

/** The floating island: hanging rock, dirt, grass cap, roots, tufts, rocks and pines. */
export default function Island() {
  const rock = useMemo(
    () =>
      strataColors(
        islandRockGeometry(ISLAND_RADIUS, 4.2, 3, 14),
        PALETTE.dirt,
        PALETTE.rock,
        PALETTE.rockLow,
      ),
    [],
  );
  const dirt = useMemo(
    () =>
      jitter(new THREE.CylinderGeometry(ISLAND_RADIUS + 0.13, ISLAND_RADIUS + 0.03, 0.34, 14, 1), 0.16, 5, {
        flatTopY: 0.17,
      }),
    [],
  );
  const grass = useMemo(
    () =>
      jitter(new THREE.CylinderGeometry(ISLAND_RADIUS + 0.2, ISLAND_RADIUS + 0.15, 0.22, 14, 1), 0.16, 9, {
        flatTopY: 0.11,
      }),
    [],
  );
  return (
    <group>
      <mesh geometry={rock} position={[0, -0.12, 0]} castShadow receiveShadow>
        <meshStandardMaterial vertexColors flatShading roughness={0.95} />
      </mesh>
      <mesh geometry={dirt} position={[0, -0.02, 0]} receiveShadow castShadow>
        <Std color={PALETTE.dirt} />
      </mesh>
      <mesh geometry={grass} position={[0, GROUND_Y - 0.11, 0]} receiveShadow castShadow>
        <Std color={PALETTE.grass} />
      </mesh>
      <Ground />
      <Roots />
      <GrassTufts />
      <Rocks />
      {/* Pines stay out of the column above the cauldron, where projections appear. */}
      <Tree position={TREE_POS[0]} scale={1.1} />
      <Tree position={TREE_POS[1]} scale={0.85} />
      <Tree position={TREE_POS[2]} scale={0.65} />
    </group>
  );
}
