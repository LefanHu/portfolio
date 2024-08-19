import * as THREE from "three";
import React, { useState } from "react";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { Select } from "@react-three/postprocessing";

type GLTFResult = GLTF & {
  nodes: {
    ["Line001_Material_#295_0"]: THREE.Mesh;
  };
  materials: {
    Material_295: THREE.MeshStandardMaterial;
  };
  // animations: GLTFAction[];
};

export function GuitarModel(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF("/GuitarModel-transformed.glb") as GLTFResult;
  const [hovered, setHovered] = useState<string>("");

  return (
    <group {...props} dispose={null}>
      <Select
        enabled={hovered === "TV"}
        onPointerOver={() => setHovered("TV")}
        onPointerOut={() => setHovered("")}
      >
        <mesh
          name="Line001_Material_#295_0"
          geometry={nodes["Line001_Material_#295_0"].geometry}
          material={materials.Material_295}
          position={[-12.036, -8.509, 3.465]}
          rotation={[-1.563, 1.121, -2.416]}
          castShadow={true}
        />
      </Select>
    </group>
  );
}

useGLTF.preload("/GuitarModel-transformed.glb");
