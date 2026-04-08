"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const GRID = 14;
const THRESHOLD = 0.08;
const MAX_INSTANCES = GRID * GRID * GRID;

function sampleField(x: number, y: number, z: number, t: number) {
  const scale = 1.55;
  const gx = x * scale + t * 0.55;
  const gy = y * scale - t * 0.35;
  const gz = z * scale + t * 0.45;
  const gyroid =
    Math.sin(gx) * Math.cos(gy) +
    Math.sin(gy) * Math.cos(gz) +
    Math.sin(gz) * Math.cos(gx);
  const envelope = 1.55 - Math.sqrt(x * x + y * y + z * z) * 0.72;
  return gyroid * 0.72 + envelope * 0.22;
}

function VoxelField() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }

    const time = clock.getElapsedTime() * 0.45;
    let count = 0;

    for (let zi = 0; zi < GRID; zi += 1) {
      for (let yi = 0; yi < GRID; yi += 1) {
        for (let xi = 0; xi < GRID; xi += 1) {
          const x = (xi / (GRID - 1)) * 4.4 - 2.2;
          const y = (yi / (GRID - 1)) * 4.4 - 2.2;
          const z = (zi / (GRID - 1)) * 4.4 - 2.2;
          const value = sampleField(x, y, z, time);

          if (value < THRESHOLD) {
            continue;
          }

          dummy.position.set(
            xi - (GRID - 1) / 2,
            yi - (GRID - 1) / 2,
            zi - (GRID - 1) / 2
          );
          dummy.scale.setScalar(0.9);
          dummy.updateMatrix();
          mesh.setMatrixAt(count, dummy.matrix);

          color.setHSL(
            THREE.MathUtils.clamp((0.52 + value * 0.14 + zi * 0.008) % 1, 0, 1),
            0.78,
            0.64
          );
          mesh.setColorAt(count, color);
          count += 1;
        }
      }
    }

    mesh.count = count;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_INSTANCES]}>
      <boxGeometry args={[0.95, 0.95, 0.95]} />
      <meshStandardMaterial vertexColors roughness={0.35} metalness={0.08} />
    </instancedMesh>
  );
}

function SceneCamera() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useEffect(() => {
    const camera = cameraRef.current;
    if (!camera) {
      return;
    }

    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, []);

  return (
    <PerspectiveCamera
      makeDefault
      ref={cameraRef}
      position={[18, 14, 18]}
      fov={38}
    />
  );
}

export default function VoxelFunctionField3D(props: { className?: string }) {
  return (
    <div
      className={props.className}
      data-testid="voxel-function-field-3d"
    >
      <Canvas dpr={[1, 1.5]} shadows>
        <color attach="background" args={["#121a2f"]} />
        <fog attach="fog" args={["#121a2f", 22, 42]} />
        <SceneCamera />
        <ambientLight intensity={2.6} color="#dbeafe" />
        <hemisphereLight
          args={["#f8fbff", "#5b6b8a", 1.8]}
        />
        <directionalLight position={[10, 16, 14]} intensity={3.8} color="#fff8e7" />
        <directionalLight position={[-12, 8, -10]} intensity={1.8} color="#9ec5ff" />
        <group rotation={[0.62, 0.78, 0]}>
          <VoxelField />
        </group>
        <OrbitControls
          enablePan={false}
          minDistance={12}
          maxDistance={36}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}
