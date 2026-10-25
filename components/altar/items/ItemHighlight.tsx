"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { setProp } from "../scene/Std";

/** Fade in / out time (s). */
const FADE_S = 0.15;
/** Ring band width (world units). */
const BAND = 0.05;
/** HDR boost on the accent: above the bloom threshold, so the ring glows. */
const GLOW = 2.4;
/** Just above the surface the item rests on, so the ring never z-fights it. */
const LIFT = 0.006;

/**
 * A flat glowing ring at an item's base while the recipe board highlights it.
 * `accent` is the highlighted recipe's colour, or null for none; the ring
 * stays mounted while it fades out. Positioned by the parent group (the item's
 * base, followed per frame).
 */
export default function ItemHighlight({ accent, radius }: { accent: string | null; radius: number }) {
  const [shown, setShown] = useState(accent);
  // Keep the last accent while fading out; pick up a new one immediately.
  if (accent && accent !== shown) setShown(accent);
  if (!shown) return null;
  return <Ring color={shown} radius={radius} on={accent !== null} onFaded={() => setShown(null)} />;
}

function Ring({ color, radius, on, onFaded }: { color: string; radius: number; on: boolean; onFaded(): void }) {
  const geometry = useMemo(() => new THREE.RingGeometry(radius - BAND / 2, radius + BAND / 2, 48), [radius]);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
        fog: false,
        side: THREE.DoubleSide,
      }),
    [],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => {
    material.color.set(color).multiplyScalar(GLOW);
  }, [material, color]);

  useFrame((_, delta) => {
    const step = Math.min(delta, 0.1) / FADE_S;
    const next = THREE.MathUtils.clamp(material.opacity + (on ? step : -step), 0, 1);
    setProp(material, "opacity", next);
    if (!on && next === 0) onFaded();
  });

  return <mesh geometry={geometry} material={material} rotation={[-Math.PI / 2, 0, 0]} position={[0, LIFT, 0]} renderOrder={2} />;
}
