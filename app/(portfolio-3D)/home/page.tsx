"use client";

import * as THREE from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  AccumulativeShadows,
  RandomizedLight,
  PerspectiveCamera,
} from "@react-three/drei";

import { Suspense, useEffect, useRef, useState } from "react";
import { PortfolioScene } from "@/components/PortfolioScene";

import { useCameraStore } from "@/lib/store";
import { Box } from "@/components/Box";

const startCameraPosition: [number, number, number] = [0.5, 0, 5];
// const viewCameraPosition: [number, number, number] = [2, 0.5, 1.5];

const viewCameraPosition: [number, number, number] = [5, 1, -3];

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
    <PerspectiveCamera makeDefault ref={cameraRef} position={[0.5, 0, 5]} />
  );
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
  // const cameraDebuggerRef = useRef<THREE.CameraHelper>(null);
  // const boxRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    // delay 1 second then move camera
    setTimeout(() => {
      useCameraStore.setState({ targetPosition: viewCameraPosition });
      useCameraStore.setState({ targetLookat: [-1, 1, 8] });
    }, 2000);
  }, []);

  return (
    <div className="w-screen h-screen">
      <Canvas
        shadows
        className="bg-white"
        // camera={{ position: [0.5, 0, 5], fov: 55 }}
      >
        <Box position={[-3, 1, 14]} />
        <Camera />
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
          <RandomizedLight
            radius={6}
            position={[5, 5, 10]}
            bias={0.001}
            castShadow
          />
        </AccumulativeShadows>

        <PortfolioScene position={[1, -0.5, 0]} />

        {/* <Geometries /> */}

        {/* <Html
          transform
          position={[20, 0, -20]}
          occlude={"blending"}
          rotation={[0, -Math.PI / 6, 0]}
        >
          <NextUICard></NextUICard>
        </Html> */}

        {/* <OrbitControls
          enablePan={false}
          enableZoom={true}
          minPolarAngle={Math.PI / 8}
          maxPolarAngle={Math.PI / 2}
          maxAzimuthAngle={Math.PI / 3}
          minAzimuthAngle={-Math.PI / 3}
          minDistance={1}
          maxDistance={8}
        /> */}
        <Environment preset="city" />

        <Suspense />
      </Canvas>
    </div>
  );
}
