"use client";

import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  AccumulativeShadows,
  RandomizedLight,
  PerspectiveCamera,
  AdaptiveDpr,
} from "@react-three/drei";

import { Suspense, useEffect, useRef, useState } from "react";
import { PortfolioScene } from "@/components/PortfolioScene";

import { useCameraStore } from "@/lib/store";
import { Box } from "@/components/Box";

function Camera() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const { targetPosition, targetLookat } = useCameraStore();

  useFrame((state, delta) => {
    const camera = cameraRef.current;
    if (!camera) return;

    // Animate position
    // easing.damp3(camera.position, targetPosition, 5, delta);
    camera.position.lerp(new THREE.Vector3(...targetPosition), delta);

    const target = new THREE.Vector3(...targetLookat);

    // Calculate the new quaternion for smooth rotation
    const direction = new THREE.Vector3()
      .subVectors(target, camera.position)
      .normalize();

    // calculate target quat
    var qt = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, -1),
      direction
    );

    camera.quaternion.slerp(qt, 2 * delta); // Smoothly rotate with slerp
  });

  return (
    <PerspectiveCamera makeDefault ref={cameraRef} position={[0.5, 0, 4]} />
  );
}

export default function Home3DPage() {
  return (
    <div className="w-screen h-screen">
      <Canvas
        shadows
        className="bg-[#fffdf9]"
        // camera={{ position: [0.5, 0, 5], fov: 55 }}
      >
        <Suspense fallback={null} />
        <Camera />
        <AccumulativeShadows
          position={[0, -0.5, 0]}
          temporal={false}
          frames={100}
          alphaTest={0.75}
          opacity={0.9}
        >
          <RandomizedLight
            radius={6}
            position={[5, 5, 10]}
            bias={0.001}
            castShadow
          />
        </AccumulativeShadows>

        {/* main scene */}
        <PortfolioScene position={[1, -0.5, 0]} />

        <Environment preset="city" environmentIntensity={1} />
        <AdaptiveDpr pixelated />
        <Suspense />
      </Canvas>
    </div>
  );
}
