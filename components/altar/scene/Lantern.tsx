"use client";

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useCursor } from "@react-three/drei";
import { useAltarStore } from "@/lib/altar/store";
import { LIGHT_DECAY, PALETTE } from "@/lib/altar/theme";
import { live } from "./liveTheme";
import { setProp, Std } from "./Std";
import { HITBOX } from "./hitbox";

/** Hanging lantern on a post. Clicking it toggles day/night. */
export default function Lantern() {
  const glass = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#3a2a18",
        emissive: live.lantern.color.clone(),
        emissiveIntensity: live.lantern.glassEmissive,
        flatShading: true,
      }),
    [],
  );
  const light = useRef<THREE.PointLight>(null);
  const swing = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const flicker = 1 + 0.06 * Math.sin(t * 11) + 0.04 * Math.sin(t * 17.3);
    glass.emissive.copy(live.lantern.color);
    setProp(glass, "emissiveIntensity", live.lantern.glassEmissive * flicker);
    if (light.current) {
      light.current.color.copy(live.lantern.color);
      light.current.intensity = live.lantern.intensity * flicker;
      light.current.distance = live.lantern.distance;
    }
    if (swing.current) swing.current.rotation.z = Math.sin(t * 1.1) * 0.06;
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    useAltarStore.getState().toggleTheme();
  };

  return (
    <group
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* post */}
      <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 2.3, 0.12]} />
        <Std color={PALETTE.woodDark} />
      </mesh>
      <mesh position={[0.4, 2.25, 0]} castShadow>
        <boxGeometry args={[0.9, 0.09, 0.09]} />
        <Std color={PALETTE.woodDark} />
      </mesh>
      <group ref={swing} position={[0.78, 2.2, 0]}>
        <mesh position={[0, -0.12, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.24, 4]} />
          <Std color={PALETTE.metal} />
        </mesh>
        <group position={[0, -0.42, 0]}>
          <mesh position={[0, 0.17, 0]} castShadow>
            <coneGeometry args={[0.17, 0.14, 4]} />
            <Std color={PALETTE.metal} />
          </mesh>
          <mesh material={glass} rotation={[0, Math.PI / 4, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.22, 4]} />
          </mesh>
          {[0, 1, 2, 3].map((i) => {
            const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
            return (
              <mesh key={i} position={[Math.cos(a) * 0.105, 0, Math.sin(a) * 0.105]} castShadow>
                <boxGeometry args={[0.025, 0.24, 0.025]} />
                <Std color={PALETTE.metal} />
              </mesh>
            );
          })}
          <mesh position={[0, -0.13, 0]}>
            <boxGeometry args={[0.18, 0.04, 0.18]} />
            <Std color={PALETTE.metal} />
          </mesh>
          <pointLight ref={light} decay={LIGHT_DECAY.lantern} castShadow={false} />
          {/* generous invisible hit area around the small lantern head */}
          <mesh userData={HITBOX}>
            <boxGeometry args={[0.5, 0.6, 0.5]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
