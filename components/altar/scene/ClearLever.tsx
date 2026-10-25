"use client";

import { useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useCursor } from "@react-three/drei";
import { leverResponse } from "@/lib/altar/mood";
import { getAltarOccupants } from "@/lib/altar/occupancy";
import { useAltarStore } from "@/lib/altar/store";
import { PALETTE, type Vec3 } from "@/lib/altar/theme";
import HoverTip from "./HoverTip";
import { Std } from "./Std";
import { HITBOX } from "./hitbox";

const REST = -0.55;
const PULLED = 0.55;
/** Locked: a short stiff rattle instead of a pull. */
const JIGGLE = { amp: 0.09, freq: 38, decay: 7, span: 0.5 } as const;

/**
 * A small iron lever on the plaza. Pulling it empties the cauldron
 * (clearAltar), but only when that would do something (idle, something
 * inside); otherwise it rattles, locked.
 */
export default function ClearLever({
  position,
  rotationY,
  rune,
}: {
  position: Vec3;
  rotationY: number;
  rune: THREE.Material;
}) {
  const arm = useRef<THREE.Group>(null);
  const pulledAt = useRef(-Infinity);
  const lockedAt = useRef(-Infinity);
  const pending = useRef<"pull" | "locked" | null>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (pending.current === "pull") pulledAt.current = t;
    else if (pending.current === "locked") lockedAt.current = t;
    pending.current = null;
    if (!arm.current) return;
    // Snap forward on pull, then ease back over about a second.
    const since = t - pulledAt.current;
    const k = since < 0.12 ? since / 0.12 : Math.max(0, 1 - (since - 0.35) / 0.8);
    const target = REST + (PULLED - REST) * THREE.MathUtils.clamp(k, 0, 1);
    const jt = t - lockedAt.current;
    const jiggle =
      jt < JIGGLE.span ? JIGGLE.amp * Math.sin(jt * JIGGLE.freq) * Math.exp(-jt * JIGGLE.decay) * Math.min(1, jt * 30) : 0;
    const eased = THREE.MathUtils.lerp(arm.current.rotation.x - (arm.current.userData.jiggle ?? 0), target, 0.35);
    arm.current.userData.jiggle = jiggle;
    arm.current.rotation.x = eased + jiggle;
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const s = useAltarStore.getState();
    const inside = Math.max(getAltarOccupants().length, s.contents.length);
    if (leverResponse(s.phase, inside) === "pull") {
      pending.current = "pull";
      s.clearAltar();
    } else {
      pending.current = "locked";
    }
  };

  return (
    <group
      position={position}
      rotation={[0, rotationY, 0]}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[0, 0.09, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.18, 0.3]} />
        <Std color={PALETTE.stoneDark} />
      </mesh>
      <mesh position={[0, 0.19, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.34, 6]} />
        <Std color={PALETTE.metal} roughness={0.55} />
      </mesh>
      <group ref={arm} position={[0, 0.19, 0]} rotation={[REST, 0, 0]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.06, 0.6, 0.06]} />
          <Std color={PALETTE.metal} roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.62, 0]} material={rune}>
          <icosahedronGeometry args={[0.09, 0]} />
        </mesh>
      </group>
      <group position={[0, 0.95, 0]}>
        {hovered && <HoverTip name="Clearing Lever" flavor="Pull to empty the cauldron." />}
      </group>
      {/* generous invisible hit area so the lever is easy to click */}
      <mesh position={[0, 0.4, 0]} userData={HITBOX}>
        <boxGeometry args={[0.6, 0.9, 0.6]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
