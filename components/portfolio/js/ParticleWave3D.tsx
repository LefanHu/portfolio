"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const GRID = 34;
const COUNT = GRID * GRID;

function WavePoints() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }

    const time = clock.getElapsedTime();
    let index = 0;

    for (let z = 0; z < GRID; z += 1) {
      for (let x = 0; x < GRID; x += 1) {
        const nx = (x / (GRID - 1)) * 2 - 1;
        const nz = (z / (GRID - 1)) * 2 - 1;
        const y =
          Math.sin(nx * 5 + time * 1.4) * 0.8 +
          Math.cos(nz * 6 - time * 1.1) * 0.7;

        dummy.position.set(nx * 12, y * 1.2, nz * 12);
        dummy.scale.setScalar(0.18 + (y + 2) * 0.045);
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);

        color.setHSL((0.53 + y * 0.06 + nz * 0.08) % 1, 0.8, 0.62);
        mesh.setColorAt(index, color);
        index += 1;
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshStandardMaterial vertexColors emissive="#0ea5e9" emissiveIntensity={0.12} />
    </instancedMesh>
  );
}

export default function ParticleWave3D(props: { className?: string }) {
  return (
    <div className={props.className} data-testid="particle-wave-3d">
      <Canvas dpr={[1, 1.5]}>
        <color attach="background" args={["#07111f"]} />
        <PerspectiveCamera makeDefault position={[0, 12, 22]} fov={42} />
        <ambientLight intensity={1.8} />
        <directionalLight position={[8, 10, 6]} intensity={2.4} />
        <WavePoints />
        <OrbitControls enablePan={false} minDistance={14} maxDistance={30} />
      </Canvas>
    </div>
  );
}
