"use client";

import { Canvas } from "@react-three/fiber";
import { Box } from "@/components/Box";
import { AxeModel } from "@/components/AxeModel";
import {
  Environment,
  OrbitControls,
  AccumulativeShadows,
  RandomizedLight,
} from "@react-three/drei";
import { Suspense } from "react";

export default function Test3dPage() {
  return (
    <div className="w-screen h-screen">
      <Canvas shadows className="bg-white">
        <Suspense fallback={null} />
        <ambientLight intensity={Math.PI} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={Math.PI}
        />
        <pointLight
          position={[-10, -10, -10]}
          decay={0}
          intensity={21 * Math.PI}
        />
        <pointLight
          position={[10, 10, 10]}
          decay={0}
          intensity={21 * Math.PI}
        />
        {/* <Box position={[-1.2, 0, 0]} /> */}
        {/* <Box position={[1.2, 0, 0]} /> */}
        <AxeModel position={[0, -0.3, 0]} rotation={[0, Math.PI / 2, 0]} />
        <OrbitControls />
        <AccumulativeShadows
          position={[0, -0.5, 0]}
          temporal
          frames={100}
          alphaTest={0.75}
          opacity={0.9}
        >
          <RandomizedLight radius={6} position={[5, 5, -10]} bias={0.001} />
        </AccumulativeShadows>

        <Environment preset="city" />
        <Suspense />
      </Canvas>
    </div>
  );
}
