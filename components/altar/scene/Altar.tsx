"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, CylinderCollider, RigidBody } from "@react-three/rapier";
import {
  ALTAR_POS,
  BRAZIER_LOCAL,
  CAULDRON,
  CAULDRON_FLOOR_TOP_LOCAL,
  CAULDRON_WALL_TOP_LOCAL,
  LEVER_ANGLE,
  LEVER_LOCAL,
} from "@/lib/altar/layout";
import { altarOccupancy } from "@/lib/altar/occupancy";
import { PALETTE, type Vec3 } from "@/lib/altar/theme";
import { jitter, mulberry32, rockChunkGeometry } from "./geo";
import { Brazier, CauldronMagic, useRuneMaterial } from "./CauldronFx";
import Burst from "./Burst";
import ClearLever from "./ClearLever";
import { mood } from "./liveMood";
import { occluderRef } from "./occluders";
import { Std } from "./Std";

// The grand cauldron altar. Local space: y = 0 is the plaza's grass level.

/** Basin profile: outer wall up to a thick lip, then the inner wall back down. */
function cauldronGeometry() {
  const pts = [
    [0.0, 0.0],
    [0.62, 0.0],
    [0.78, 0.12],
    [1.12, 0.42],
    [1.42, 0.82],
    [1.6, 1.22],
    [1.64, 1.5],
    [1.56, 1.62],
    [1.74, 1.66],
    [CAULDRON.rimOuter, 1.78],
    [1.64, CAULDRON.lipTop],
    [CAULDRON.rimInner, 1.8],
    [1.22, 1.3],
    [0.9, 0.9],
    [0.0, 0.8],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(pts, 10);
}

const FLOOR_TOP = CAULDRON_FLOOR_TOP_LOCAL;
const WALL_TOP = CAULDRON_WALL_TOP_LOCAL;
const WALL_SEGMENTS = 12;
/**
 * Static colliders for plaza, tier and basin. What counts as "inside" is decided
 * per frame from item centres (lib/altar/sensor.ts cauldronContains, fed by
 * Items.tsx), not by a rapier sensor; this connects that occupancy to the store.
 */
function CauldronPhysics() {
  useEffect(() => altarOccupancy.connect(), []);

  const wallMid = (CAULDRON.rimInner + CAULDRON.rimOuter) / 2;
  const wallHalfThick = (CAULDRON.rimOuter - CAULDRON.rimInner) / 2;
  const wallHalfLen = (Math.PI * wallMid) / WALL_SEGMENTS + 0.06;
  const wallHalfH = (WALL_TOP - FLOOR_TOP) / 2;
  const solidHalfH = (FLOOR_TOP - CAULDRON.tierTop) / 2;

  return (
    <RigidBody type="fixed" colliders={false}>
      <CylinderCollider args={[0.1, CAULDRON.plazaRadius]} position={[0, 0.1, 0]} />
      <CylinderCollider args={[0.1, 1.62]} position={[0, 0.3, 0]} />
      {/* the bowl below the floor is solid */}
      <CylinderCollider args={[solidHalfH, 1.64]} position={[0, CAULDRON.tierTop + solidHalfH, 0]} />
      {Array.from({ length: WALL_SEGMENTS }, (_, i) => {
        const a = (i / WALL_SEGMENTS) * Math.PI * 2;
        return (
          <CuboidCollider
            key={i}
            args={[wallHalfThick, wallHalfH, wallHalfLen]}
            position={[Math.cos(a) * wallMid, FLOOR_TOP + wallHalfH, Math.sin(a) * wallMid]}
            rotation={[0, -a, 0]}
          />
        );
      })}
    </RigidBody>
  );
}

function Plaza({ rune }: { rune: THREE.Material }) {
  const plaza = useMemo(
    () =>
      jitter(new THREE.CylinderGeometry(CAULDRON.plazaRadius, CAULDRON.plazaRadius + 0.1, 0.2, 8, 1), 0.05, 11, {
        flatTopY: 0.1,
      }),
    [],
  );
  const tier = useMemo(
    () => jitter(new THREE.CylinderGeometry(1.55, 1.65, 0.2, 8, 1), 0.04, 12, { flatTopY: 0.1 }),
    [],
  );
  const glyphs = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        const rr = CAULDRON.plazaRadius - 0.22;
        return { p: [Math.cos(a) * rr, 0.205, Math.sin(a) * rr] as Vec3, a, w: i % 4 === 0 ? 0.26 : 0.13 };
      }),
    [],
  );
  return (
    <>
      <mesh geometry={plaza} position={[0, 0.1, 0]} castShadow receiveShadow ref={occluderRef}>
        <Std color={PALETTE.stoneWorn} />
      </mesh>
      {[
        [2.45, 0.7, 0.5],
        [-1.7, 1.75, -0.35],
        [0.5, -2.45, 0.9],
        [-2.3, -1.1, 0.2],
      ].map(([x, z, r], i) => (
        <mesh key={i} position={[x, 0.03, z]} rotation={[0, r, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.55, 0.08, 0.4]} />
          <Std color={PALETTE.stoneWorn} />
        </mesh>
      ))}
      <mesh position={[0, 0.205, 0]} rotation={[-Math.PI / 2, 0, 0]} material={rune}>
        <torusGeometry args={[CAULDRON.plazaRadius - 0.22, 0.032, 4, 64]} />
      </mesh>
      <mesh position={[0, 0.205, 0]} rotation={[-Math.PI / 2, 0, 0]} material={rune}>
        <torusGeometry args={[CAULDRON.plazaRadius - 0.07, 0.014, 4, 64]} />
      </mesh>
      {glyphs.map((g, i) => (
        <mesh key={i} position={g.p} rotation={[0, -g.a, 0]} material={rune}>
          <boxGeometry args={[0.05, 0.02, g.w]} />
        </mesh>
      ))}
      <mesh geometry={tier} position={[0, 0.3, 0]} castShadow receiveShadow ref={occluderRef}>
        <Std color={PALETTE.stone} />
      </mesh>
    </>
  );
}

function Basin({ rune }: { rune: THREE.Material }) {
  const bowl = useMemo(() => cauldronGeometry(), []);
  const inlays = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        a: (i / 10) * Math.PI * 2 + Math.PI / 10,
        tall: i % 2 === 0,
      })),
    [],
  );
  return (
    <>
      {/* claw feet */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        return (
          <group
            key={i}
            position={[Math.cos(a) * 1.05, CAULDRON.tierTop, Math.sin(a) * 1.05]}
            rotation={[0, -a, 0]}
          >
            <mesh position={[0.12, 0.28, 0]} rotation={[0, 0, -0.5]} castShadow receiveShadow>
              <boxGeometry args={[0.32, 0.65, 0.34]} />
              <Std color={PALETTE.metal} roughness={0.6} />
            </mesh>
            <mesh position={[0.32, 0.04, 0]} castShadow>
              <boxGeometry args={[0.36, 0.1, 0.4]} />
              <Std color={PALETTE.metal} roughness={0.6} />
            </mesh>
          </group>
        );
      })}
      <group position={[0, CAULDRON.basinBase, 0]}>
        <mesh geometry={bowl} castShadow receiveShadow ref={occluderRef}>
          <meshStandardMaterial
            color={PALETTE.cauldron}
            roughness={0.7}
            metalness={0.15}
            flatShading
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* iron bands */}
        {[
          [0.62, 1.32],
          [1.32, 1.62],
        ].map(([y, r], i) => (
          <mesh key={i} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[r, 0.06, 4, 10]} />
            <Std color={PALETTE.metal} roughness={0.55} />
          </mesh>
        ))}
        {/* rune inlays on the belly */}
        {inlays.map(({ a, tall }, i) => (
          <mesh
            key={i}
            position={[Math.cos(a) * 1.49, 0.98, Math.sin(a) * 1.49]}
            rotation={[0, -a + Math.PI / 2, 0.42]}
            material={rune}
          >
            <boxGeometry args={[0.07, tall ? 0.34 : 0.18, 0.05]} />
          </mesh>
        ))}
        {/* rim handles */}
        {[0, Math.PI].map((a, i) => (
          <mesh
            key={i}
            position={[Math.cos(a + 0.9) * 1.82, 1.5, Math.sin(a + 0.9) * 1.82]}
            rotation={[0, -(a + 0.9), Math.PI / 2]}
            castShadow
          >
            <torusGeometry args={[0.2, 0.05, 4, 6]} />
            <Std color={PALETTE.metal} roughness={0.55} />
          </mesh>
        ))}
        <CauldronMagic />
        <Burst />
      </group>
    </>
  );
}

/** Stone fragments with glowing rune seams, orbiting above the basin. */
function Fragments({ rune }: { rune: THREE.Material }) {
  const fragments = useMemo(() => {
    const rnd = mulberry32(808);
    return Array.from({ length: 5 }, (_, i) => ({
      a: (i / 5) * Math.PI * 2 + rnd() * 0.4,
      r: 2.3 + rnd() * 0.35,
      y: 3.1 + rnd() * 0.7,
      s: 0.22 + rnd() * 0.16,
      g: rockChunkGeometry(1, 900 + i),
    }));
  }, []);
  const orbit = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!orbit.current) return;
    // orbit time speeds up a little with the swirl
    orbit.current.rotation.y = mood.orbitT * 0.12;
    orbit.current.children.forEach((c, i) => {
      c.position.y = fragments[i].y + Math.sin(t * 0.9 + i * 1.9) * 0.15;
      c.rotation.x = t * 0.3 + i;
      c.rotation.y = t * 0.2;
    });
  });
  return (
    <group ref={orbit}>
      {fragments.map((f, i) => (
        <group key={i} position={[Math.cos(f.a) * f.r, f.y, Math.sin(f.a) * f.r]} scale={f.s}>
          <mesh geometry={f.g} castShadow>
            <Std color={PALETTE.stone} />
          </mesh>
          <mesh material={rune} scale={[1.02, 0.12, 1.02]}>
            <octahedronGeometry args={[0.95, 0]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** The hero: a grand cauldron on a rune plaza, with braziers, fragments and the clear lever. */
export default function Altar() {
  const rune = useRuneMaterial();
  return (
    <group position={ALTAR_POS}>
      <Plaza rune={rune} />
      <Basin rune={rune} />
      {BRAZIER_LOCAL.map((p, i) => (
        <Brazier key={i} position={p} />
      ))}
      <Fragments rune={rune} />
      {/* Clear lever on the plaza's front edge, facing the camera. */}
      <ClearLever position={LEVER_LOCAL} rotationY={-LEVER_ANGLE + Math.PI / 2} rune={rune} />
      <CauldronPhysics />
    </group>
  );
}
