"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { PALETTE, type Vec3 } from "@/lib/altar/theme";
import { islandRockGeometry, jitter, mulberry32, rockChunkGeometry } from "./geo";
import { live } from "./liveTheme";
import { setProp, Std } from "./Std";

function DistantIsles() {
  const isles = useMemo(
    () =>
      [
        { p: [-17, -2.5, -20] as Vec3, s: 0.45, seed: 31 },
        { p: [19, 1.5, -24] as Vec3, s: 0.32, seed: 32 },
        { p: [-24, 3, 2] as Vec3, s: 0.28, seed: 33 },
        { p: [12, -6, -12] as Vec3, s: 0.2, seed: 34 },
      ].map((d) => ({ ...d, g: islandRockGeometry(4, 3.4, d.seed) })),
    [],
  );
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    refs.current.forEach((r, i) => {
      if (r) r.position.y = isles[i].p[1] + Math.sin(t * 0.3 + i * 1.7) * 0.4;
    });
  });
  return (
    <>
      {isles.map((d, i) => (
        <group
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={d.p}
          scale={d.s}
        >
          <mesh geometry={d.g}>
            <Std color={PALETTE.rock} />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[4.2, 4.1, 0.3, 11]} />
            <Std color={PALETTE.grass} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/** Rock shards drifting around the island. Decorative, so they bob freely. */
function Shards() {
  const shards = useMemo(
    () =>
      [
        { p: [5.5, -1.3, 1.9] as Vec3, s: 0.45 },
        { p: [-5.2, -2.1, 2.7] as Vec3, s: 0.32 },
        { p: [2.3, -3.9, -4.7] as Vec3, s: 0.38 },
        { p: [-4.6, 0.4, -3.6] as Vec3, s: 0.24 },
      ].map((d, i) => ({ ...d, g: rockChunkGeometry(d.s, 60 + i) })),
    [],
  );
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (!m) return;
      m.position.y = shards[i].p[1] + Math.sin(t * 0.7 + i * 2) * 0.18;
      m.rotation.y = t * 0.15 + i;
    });
  });
  return (
    <>
      {shards.map((d, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          geometry={d.g}
          position={d.p}
          castShadow
        >
          <Std color={PALETTE.rock} />
        </mesh>
      ))}
    </>
  );
}

function makeHaloTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.55)");
  g.addColorStop(0.6, "rgba(255,255,255,0.12)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Faceted icosphere moon with a soft halo; both stay under the bloom threshold. */
function Moon() {
  const geo = useMemo(() => jitter(new THREE.IcosahedronGeometry(1.25, 1), 0.06, 4242), []);
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        flatShading: true,
        roughness: 1,
        transparent: true,
        fog: false,
        emissiveIntensity: 0.55,
      }),
    [],
  );
  const halo = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: makeHaloTexture(),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
      }),
    [],
  );
  const moon = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    mat.color.copy(live.moon.color);
    mat.emissive.copy(live.moon.color);
    setProp(mat, "opacity", live.moon.opacity);
    setProp(mat, "visible", live.moon.opacity > 0.01);
    halo.color.copy(live.moon.color);
    setProp(halo, "opacity", live.moon.opacity * 0.22);
    if (moon.current) moon.current.rotation.y = clock.elapsedTime * 0.03;
  });
  return (
    <group position={[-37.7, -4.2, -17.9]}>
      <sprite material={halo} scale={7} renderOrder={-1} />
      <mesh ref={moon} geometry={geo} material={mat} rotation={[0.4, 0, 0.2]} />
    </group>
  );
}

function Clouds() {
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ flatShading: true, roughness: 1, transparent: true }),
    [],
  );
  const clouds = useMemo(() => {
    const rnd = mulberry32(123);
    const spots: [Vec3, number][] = [
      [[-6.0, -4.0, 1.2], 0.7],
      [[6.2, -3.4, -3.5], 0.65],
      [[-2.5, -6.8, -6.5], 0.9],
      [[-12, 3, -6], 1.0],
      [[5.5, 3.6, -12], 0.8],
    ];
    return spots.map(([p, s], i) => ({
      p,
      s,
      puffs: Array.from({ length: 5 }, (_, j) => ({
        p: [(j - 2) * 0.8 + (rnd() - 0.5) * 0.4, (rnd() - 0.2) * 0.35, (rnd() - 0.5) * 0.8] as Vec3,
        r: 0.55 + rnd() * 0.45 - Math.abs(j - 2) * 0.12,
        g: jitter(new THREE.IcosahedronGeometry(1, 0), 0.08, 300 + i * 10 + j),
      })),
    }));
  }, []);
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    mat.color.copy(live.clouds.color);
    setProp(mat, "opacity", live.clouds.opacity);
    refs.current.forEach((r, i) => {
      if (r) r.position.x = clouds[i].p[0] + Math.sin(t * 0.05 + i * 1.3) * 0.8;
    });
  });
  return (
    <>
      {clouds.map((c, i) => (
        <group
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={c.p}
          scale={c.s}
        >
          {c.puffs.map((pf, j) => (
            <mesh
              key={j}
              geometry={pf.g}
              material={mat}
              position={pf.p}
              scale={[pf.r * 1.25, pf.r * 0.75, pf.r]}
            />
          ))}
        </group>
      ))}
    </>
  );
}

/** Everything off the island: distant isles, drifting shards, clouds and the moon. */
export default function Backdrop() {
  return (
    <>
      <DistantIsles />
      <Shards />
      <Clouds />
      <Moon />
    </>
  );
}
