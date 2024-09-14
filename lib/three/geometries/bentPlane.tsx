import React from "react";
import * as THREE from "three";

export default function BentPlaneGeometry(
  props: JSX.IntrinsicElements["mesh"]
) {
  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-10, 0, 0),
    new THREE.Vector3(-5, 15, 0),
    new THREE.Vector3(20, 15, 0),
    new THREE.Vector3(10, 0, 0)
  );
  const vertices = new Float32Array(
    curve.getPoints(50).flatMap((point) => [point.x, point.y, point.z])
  );

  return (
    <mesh {...props}>
      <bufferGeometry attach={"geometry"}>
        <bufferAttribute
          attach="attributes-position"
          array={vertices}
          itemSize={3}
          count={6}
        />
      </bufferGeometry>
      <meshStandardMaterial color={"#ff0000"} />
    </mesh>
  );
}
