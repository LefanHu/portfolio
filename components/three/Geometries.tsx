import * as THREE from "three";
import React, { useMemo } from "react";
import { Float } from "@react-three/drei";

const geometries = [
  { geometry: new THREE.TetrahedronGeometry(2) },
  { geometry: new THREE.CylinderGeometry(0.8, 0.8, 2, 32) },
  { geometry: new THREE.ConeGeometry(1.1, 1.7, 32) },
  { geometry: new THREE.SphereGeometry(1.5, 32, 32) },
  { geometry: new THREE.IcosahedronGeometry(2) },
  { geometry: new THREE.TorusGeometry(1.1, 0.35, 16, 32) },
  { geometry: new THREE.OctahedronGeometry(2) },
  { geometry: new THREE.SphereGeometry(1.5, 32, 32) },
  { geometry: new THREE.BoxGeometry(2.5, 2.5, 2.5) },
];

function createSeededRandom(seed: number) {
  let state = seed;

  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function randomInRange(random: () => number, min: number, max: number) {
  return min + random() * (max - min);
}

export function Geometries(props: Omit<JSX.IntrinsicElements["group"], "ref">) {
  const n = 20;
  const instances = useMemo(() => {
    const random = createSeededRandom(42);

    return Array.from({ length: n }, (_, index) => ({
      key: `${index}-${Math.floor(random() * geometries.length)}`,
      geometry: geometries[Math.floor(random() * geometries.length)].geometry,
      scale: randomInRange(random, 0.25, 0.5),
      position: [
        randomInRange(random, -26, 26),
        randomInRange(random, 0, 6),
        randomInRange(random, -16, -8),
      ] as [number, number, number],
      color: `rgb(${Math.floor(randomInRange(random, 127, 254))}, ${Math.floor(
        randomInRange(random, 127, 254)
      )}, ${Math.floor(randomInRange(random, 127, 254))})`,
    }));
  }, []);

  return instances.map((instance) => {
    return (
      <Float {...props} key={instance.key}>
        <mesh
          scale={instance.scale}
          position={instance.position}
          geometry={instance.geometry}
        >
          <meshStandardMaterial color={instance.color} />
        </mesh>
      </Float>
    );
  });
}
