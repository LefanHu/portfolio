"use client";

import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  AccumulativeShadows,
  RandomizedLight,
  PerspectiveCamera,
  AdaptiveDpr,
  Preload,
} from "@react-three/drei";

import { Suspense, use, useEffect, useRef, useState } from "react";
import { PortfolioScene } from "@/components/PortfolioScene";

import { useActiveViewStore, useCameraStore } from "@/lib/store";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { setViewPosition } from "@/lib/threeSceneViewHelpers";
import { LoaderScreen } from "@/components/three/LoaderSceen";
import { ProjectShowcase } from "@/components/three/ProjectShowcase";
import BentPlaneGeometry from "@/lib/three/geometries/bentPlane";
import { BoxBlendGeometry } from "@/lib/three/geometries/boxBlendGeometry";
import { BoxBlend } from "@/lib/three/shapes/boxBlend";

function Camera() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const { targetPosition, targetLookat } = useCameraStore();
  const [isFocused, setIsFocused] = useState(true);

  // stop camera motion while not focused
  useEffect(() => {
    window.addEventListener("blur", () => {
      setIsFocused(false);
    });

    window.addEventListener("focus", () => {
      setIsFocused(true);
    });

    return () => {
      window.removeEventListener("blur", () => {
        setIsFocused(false);
      });

      window.removeEventListener("focus", () => {
        setIsFocused(true);
      });
    };
  }, []);

  useFrame((state, delta) => {
    const camera = cameraRef.current;
    if (!camera || !isFocused) return;

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
    <PerspectiveCamera
      makeDefault
      ref={cameraRef}
      position={[0.5, 15, 40]}
      // fov={55}
    />
  );
}

function ResetViewButton() {
  const { activeView } = useActiveViewStore();

  return (
    <div>
      <ArrowLeftIcon
        className={
          "absolute w-10 h-10 left-0 top-0 text-black border-2 border-black rounded-lg m-2 p-1 hover:bg-blue-800 hover:text-white transition-all duration-200 cursor-pointer" +
          (activeView === "default" ? " invisible" : "")
        }
        onClick={() => {
          setViewPosition("default");
        }}
      />
    </div>
  );
}

export default function Home3DPage() {
  return (
    <div className="w-screen h-screen relative">
      <Canvas shadows className="bg-[#fffdf9] z-0">
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
        {/* <ProjectShowcase /> */}
        {/* <BentPlaneGeometry position={[0, 1, 0]} /> */}
        <BoxBlend position={[1, 1, 1]} width={0.5} height={0.2} radius={0.1} />

        <Environment preset="dawn" environmentIntensity={1} />
        <AdaptiveDpr pixelated />

        <Preload all />
        <Suspense />
      </Canvas>
      <ResetViewButton />
      <LoaderScreen />
    </div>
  );
}
