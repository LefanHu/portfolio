"use client";

import * as THREE from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { easing } from "maath";
import {
  Environment,
  OrbitControls,
  AccumulativeShadows,
  RandomizedLight,
  Bvh,
  Html,
  MotionPathControls,
  PerspectiveCamera,
  useHelper,
} from "@react-three/drei";
import { EffectComposer, Selection, Outline } from "@react-three/postprocessing";

import { Suspense, use, useCallback, useEffect, useRef, useState } from "react";
import { PortfolioScene } from "@/components/PortfolioScene";
import NextUICard from "@/components/NextUICard";

import { useCameraStore } from "@/lib/store";
import { easeIn } from "framer-motion";

const startCameraPosition: [number, number, number] = [0.5, 0, 5];
// const viewCameraPosition: [number, number, number] = [2, 0.5, 1.5];

const viewCameraPosition: [number, number, number] = [0.5, 1, 5];

function Camera() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const { targetPosition, targetRotation } = useCameraStore();

  useFrame((state, delta) => {
    const camera = state.camera;

    // Animate position
    // easing.damp3(camera.position, targetPosition, 5, delta);
    camera.position.lerp(new THREE.Vector3(...targetPosition), 0.05 * delta * 10);

    // Get current camera rotation
    const target = new THREE.Vector3(...targetRotation);

    // Calculate the new quaternion for smooth rotation
    const quaternion = new THREE.Quaternion();
    const direction = new THREE.Vector3().subVectors(target, camera.position).normalize();

    // Set the new rotation quaternion to smoothly rotate towards target
    quaternion.setFromUnitVectors(camera.getWorldDirection(new THREE.Vector3()), direction);
    camera.quaternion.slerp(quaternion, 0.05 * delta * 10); // Smoothly rotate with slerp

    // camera.lookAt(target);
  });

  return <PerspectiveCamera makeDefault ref={cameraRef} position={[0.5, 0, 5]} />;
}

function CameraDebugger(props: JSX.IntrinsicElements["cameraHelper"]) {
  const camera = new THREE.PerspectiveCamera(50, 1, 1, 3);
  return (
    <group position={[0.5, 0, 5]}>
      <mesh>
        <cameraHelper args={[camera]} />
      </mesh>
    </group>
  );
}

export default function Home3DPage() {
  const cameraDebuggerRef = useRef<THREE.CameraHelper>(null);
  const boxRef = useRef<THREE.Mesh>(null);
  return (
    <div className="w-screen h-screen">
      <Canvas shadows className="bg-white" camera={{ position: [0.5, 0, 5], fov: 55 }}>
        {/* <Camera /> */}
        {/* <Box args={[1, 1, 1]} position={[0, 0, 0]} ref={boxRef} /> */}
        {/* <CameraDebugger ref={cameraDebuggerRef} /> */}
        <Suspense fallback={null} />
        <AccumulativeShadows
          position={[0, -0.5, 0]}
          temporal={false}
          frames={100}
          alphaTest={0.75}
          opacity={0.9}
        >
          <RandomizedLight radius={6} position={[5, 5, 10]} bias={0.001} castShadow />
        </AccumulativeShadows>

        {/* <MotionPathControls
          offset={0}
          damping={0.2}
          curves={[
            new THREE.CubicBezierCurve3(
              new THREE.Vector3(-5, -5, 0),
              new THREE.Vector3(-10, 0, 0),
              new THREE.Vector3(0, 3, 0),
              new THREE.Vector3(6, 3, 0)
            ),
            new THREE.CubicBezierCurve3(
              new THREE.Vector3(6, 3, 0),
              new THREE.Vector3(10, 5, 5),
              new THREE.Vector3(5, 3, 5),
              new THREE.Vector3(5, 5, 5)
            ),
          ]}
          attach
        ></MotionPathControls> */}

        <Selection>
          <PortfolioScene position={[1, -0.5, 0]} />
          <Effects />
        </Selection>

        {/* <Html
          transform
          position={[20, 0, -20]}
          occlude={"blending"}
          rotation={[0, -Math.PI / 6, 0]}
        >
          <NextUICard></NextUICard>
        </Html> */}

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minPolarAngle={Math.PI / 8}
          maxPolarAngle={Math.PI / 2}
          maxAzimuthAngle={Math.PI / 3}
          minAzimuthAngle={-Math.PI / 3}
          minDistance={1}
          maxDistance={8}
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
