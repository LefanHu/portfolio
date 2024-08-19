"use client";

import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  AccumulativeShadows,
  RandomizedLight,
  Bvh,
} from "@react-three/drei";
import { EffectComposer, Selection, Outline } from "@react-three/postprocessing";
import { Suspense, useCallback, useState } from "react";
import { PortfolioScene } from "@/components/PortfolioScene";

function CameraSetup() {
  const { camera } = useThree();
  camera.lookAt(0, -0.5, 1);

  return null;
}

export default function Home3DPage() {
  // const debouncedHover = useCallback(debounce(setHovered, 30), []);
  // const over = (name: string) => (e: any) => (e.stopPropagation(), debouncedHover(name));

  return (
    <div className="w-screen h-screen">
      <Canvas shadows className="bg-white" camera={{ position: [0.5, 0, 3], fov: 50 }}>
        <CameraSetup />
        <Suspense fallback={null} />
        <pointLight color={0xff8800} position={[10, 10, 10]} decay={0} intensity={Math.PI} castShadow />
        <hemisphereLight intensity={0.3} groundColor={0x00ff00} color={0x0000ff} castShadow />
        <AccumulativeShadows
          position={[0, -0.5, 0]}
          temporal
          frames={100}
          alphaTest={0.75}
          opacity={0.9}
        >
          <RandomizedLight radius={6} position={[5, 5, 10]} bias={0.001} castShadow/>
        </AccumulativeShadows>
        <PortfolioScene position={[1, -0.5, 0]} castShadow />

        {/*  
        <Bvh firstHitOnly>
          <Selection>
            <Effects />
            <FlatScreenTVModel position={[-1, 0.1, 0]} rotation={[0, Math.PI / 9, 0]} />
            <GuitarModel position={[-2, 0.3, 0]} rotation={[Math.PI/7, Math.PI/1.5, Math.PI/4]} scale={0.02} />
            <RobotModel position={[0.1, -0.5, 0]} rotation={[0, 0, 0]} scale={0.02} />
          </Selection>
        </Bvh>
        */}

        <OrbitControls
          // enablePan={false}
          enablePan={true}
          enableZoom={true}
          minPolarAngle={Math.PI / 8}
          maxPolarAngle={Math.PI / 2}
          maxAzimuthAngle={Math.PI / 3}
          minAzimuthAngle={-Math.PI / 3}
          minDistance={1}
          maxDistance={5}
          target={[0, 0.5, 1]}
        />
        <Environment preset="city" />
        <Suspense />
      </Canvas>
    </div>
  );
}

function Effects() {
  const { size } = useThree();
  // useFrame((state, delta) => {
  //
  // });
  return (
    <EffectComposer stencilBuffer autoClear={false} multisampling={4}>
      <Outline
        visibleEdgeColor={0x42d4f5}
        hiddenEdgeColor={0}
        blur
        width={size.width * 1.25}
        edgeStrength={10}
      />
    </EffectComposer>
  );
}
