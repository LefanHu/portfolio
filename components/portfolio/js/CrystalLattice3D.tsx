"use client";

import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import SceneCanvas, { type SceneProps, useSceneFrame } from "./SceneCanvas";

const GRID = 7;
const COUNT = GRID * GRID * GRID;

function Lattice() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useSceneFrame((time) => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }

    let index = 0;

    for (let z = 0; z < GRID; z += 1) {
      for (let y = 0; y < GRID; y += 1) {
        for (let x = 0; x < GRID; x += 1) {
          const nx = x - (GRID - 1) / 2;
          const ny = y - (GRID - 1) / 2;
          const nz = z - (GRID - 1) / 2;
          const pulse = 1 + Math.sin(time * 2 + (x + y + z) * 0.7) * 0.18;

          dummy.position.set(nx * 1.6, ny * 1.6, nz * 1.6);
          dummy.rotation.set(time * 0.2 + x * 0.08, time * 0.25 + y * 0.08, nz * 0.1);
          dummy.scale.setScalar(0.38 * pulse);
          dummy.updateMatrix();
          mesh.setMatrixAt(index, dummy.matrix);

          color.setHSL((0.58 + (x + z) * 0.03) % 1, 0.68, 0.68);
          mesh.setColorAt(index, color);
          index += 1;
        }
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        roughness={0.18}
        metalness={0.3}
        emissive="#67e8f9"
        emissiveIntensity={0.08}
      />
    </instancedMesh>
  );
}

export default function CrystalLattice3D(props: SceneProps) {
  return (
    <SceneCanvas {...props} testId="crystal-lattice-3d">
      <color attach="background" args={["#08121b"]} />
      <fog attach="fog" args={["#08121b", 18, 34]} />
      <PerspectiveCamera makeDefault position={[12, 10, 16]} fov={40} />
      <ambientLight intensity={1.6} />
      <hemisphereLight args={["#ecfeff", "#0f172a", 1.2]} />
      <directionalLight position={[10, 14, 10]} intensity={2.8} />
      <Lattice />
      <OrbitControls enablePan={false} minDistance={9} maxDistance={24} />
    </SceneCanvas>
  );
}
