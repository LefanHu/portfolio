import * as THREE from "three";
import React, { useMemo} from "react";
import { Float} from "@react-three/drei";

const material = new THREE.MeshStandardMaterial();
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

export function Geometries(props: JSX.IntrinsicElements["group"]) {
  const n = 20;
  const randProps = useMemo(
    () =>
      Array.from({ length: n }, () => geometries[Math.floor(Math.random() * geometries.length)]),
    []
  );
  return randProps.map((prop) => {
    return (
        <Float {...props} key={prop.geometry.id}>
          <mesh
            scale={THREE.MathUtils.randFloat(0.25, 0.5)}
            position={[
              THREE.MathUtils.randFloat(-26, 26),
              THREE.MathUtils.randFloat(0, 6),
              THREE.MathUtils.randFloat(-16, -8),
            ]}
            geometry={prop.geometry}
            material={material}
          />
        </Float>
    );
  });
}
