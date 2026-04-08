"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function OrbitSystem() {
  const groupRef = useRef<THREE.Group>(null);
  const nodeRefs = useRef<THREE.Mesh[]>([]);
  const nodes = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        radius: 2.5 + index * 0.42,
        speed: 0.22 + index * 0.02,
        tilt: index * 0.22,
        color: new THREE.Color().setHSL((0.05 + index * 0.055) % 1, 0.82, 0.6),
      })),
    []
  );

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.16;
    }

    nodeRefs.current.forEach((node, index) => {
      const item = nodes[index];
      const angle = time * item.speed + index;
      node.position.set(
        Math.cos(angle) * item.radius,
        Math.sin(angle * 1.8 + item.tilt) * 1.8,
        Math.sin(angle) * item.radius
      );
    });
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial color="#fef3c7" emissive="#f59e0b" emissiveIntensity={0.55} />
      </mesh>
      {nodes.map((item, index) => (
        <mesh
          key={index}
          ref={(node) => {
            if (node) {
              nodeRefs.current[index] = node;
            }
          }}
        >
          <sphereGeometry args={[0.22 + (index % 3) * 0.08, 16, 16]} />
          <meshStandardMaterial
            color={item.color}
            emissive={item.color}
            emissiveIntensity={0.45}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function OrbitalNodes3D(props: { className?: string }) {
  return (
    <div className={props.className} data-testid="orbital-nodes-3d">
      <Canvas dpr={[1, 1.5]}>
        <color attach="background" args={["#090b16"]} />
        <PerspectiveCamera makeDefault position={[0, 8, 18]} fov={42} />
        <ambientLight intensity={1.2} />
        <pointLight position={[0, 0, 0]} intensity={70} color="#f59e0b" />
        <directionalLight position={[8, 12, 8]} intensity={1.8} />
        <OrbitSystem />
        <OrbitControls enablePan={false} minDistance={10} maxDistance={26} />
      </Canvas>
    </div>
  );
}
