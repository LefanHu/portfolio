import * as THREE from "three";
import React from "react";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    Sylvaxe_Sylvaxe_0: THREE.Mesh;
  };
  materials: {
    Sylvaxe: THREE.MeshStandardMaterial;
  };
  // animations: GLTFAction[];
};

export function AxeModel(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF("/axe-transformed.glb") as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes.Sylvaxe_Sylvaxe_0.geometry}
        material={materials.Sylvaxe}
        rotation={[1.123, 0.06, 0.007]}
        scale={0.01}
      />
    </group>
  );
}

useGLTF.preload("/axe-transformed.glb");
