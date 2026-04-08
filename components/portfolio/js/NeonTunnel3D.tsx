"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function TunnelRings() {
  const groupRef = useRef<THREE.Group>(null);
  const ringRefs = useRef<THREE.Mesh[]>([]);

  const rings = useMemo(
    () =>
      Array.from({ length: 28 }, (_, index) => ({
        z: -index * 1.8,
        color: new THREE.Color().setHSL((0.55 + index * 0.03) % 1, 0.85, 0.62),
        scale: 1 + index * 0.06,
      })),
    []
  );

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(time * 0.3) * 0.12;
    }

    ringRefs.current.forEach((ring, index) => {
      const base = rings[index];
      ring.position.z = ((base.z + time * 5.5 + 6) % 50) - 44;
      const pulse = 1 + Math.sin(time * 2 + index * 0.35) * 0.08;
      ring.scale.setScalar(base.scale * pulse);
      ring.rotation.z = time * 0.4 + index * 0.12;
    });
  });

  return (
    <group ref={groupRef}>
      {rings.map((ring, index) => (
        <mesh
          key={index}
          ref={(node) => {
            if (node) {
              ringRefs.current[index] = node;
            }
          }}
          position={[0, 0, ring.z]}
        >
          <torusGeometry args={[3.6, 0.1, 18, 72]} />
          <meshStandardMaterial
            color={ring.color}
            emissive={ring.color}
            emissiveIntensity={1.1}
            roughness={0.22}
            metalness={0.12}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function NeonTunnel3D(props: { className?: string }) {
  return (
    <div className={props.className} data-testid="neon-tunnel-3d">
      <Canvas dpr={[1, 1.5]}>
        <color attach="background" args={["#030712"]} />
        <fog attach="fog" args={["#030712", 12, 44]} />
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={42} />
        <ambientLight intensity={0.9} />
        <pointLight position={[0, 0, 8]} intensity={40} color="#60a5fa" />
        <pointLight position={[0, 0, -10]} intensity={24} color="#f472b6" />
        <TunnelRings />
        <OrbitControls enablePan={false} minDistance={8} maxDistance={18} />
      </Canvas>
    </div>
  );
}
