/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.0 RobotModel.glb --transform --t --k 
Files: RobotModel.glb [59.25MB] > /Users/lefan/Programming/portfolio/public/RobotModel-transformed.glb [3.82MB] (94%)
Author: Biltrex (https://sketchfab.com/biltrex)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/maty-your-very-own-robot-buddytm-4a4cc7e003964e7c98ad5ed114d28d83
Title: MATY: Your Very Own Robot Buddy™
*/

import * as THREE from "three";
import React, { useState } from "react";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { Select } from "@react-three/postprocessing";

type GLTFResult = GLTF & {
  nodes: {
    Mesh_01_Head_01_Head_0: THREE.Mesh;
    Mesh_02_Body_02_Body_0: THREE.Mesh;
    Mesh_03_Base_03_Base_0: THREE.Mesh;
  };
  materials: {
    ["01_Head"]: THREE.MeshStandardMaterial;
    ["02_Body"]: THREE.MeshStandardMaterial;
    ["03_Base"]: THREE.MeshStandardMaterial;
  };
  // animations: GLTFAction[];
};

export function RobotModel(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF("/RobotModel-transformed.glb") as GLTFResult;
  const [hovered, setHovered] = useState<string>("");
  return (
    <group {...props} dispose={null}>
      <Select
        enabled={hovered === "TV"}
        onPointerOver={() => setHovered("TV")}
        onPointerOut={() => setHovered("")}
      >
        <mesh
          name="Mesh_01_Head_01_Head_0"
          geometry={nodes.Mesh_01_Head_01_Head_0.geometry}
          material={materials["01_Head"]}
          castShadow={true}
        />
        <mesh
          name="Mesh_02_Body_02_Body_0"
          geometry={nodes.Mesh_02_Body_02_Body_0.geometry}
          material={materials["02_Body"]}
          castShadow={true}
        />
        <mesh
          name="Mesh_03_Base_03_Base_0"
          geometry={nodes.Mesh_03_Base_03_Base_0.geometry}
          material={materials["03_Base"]}
          castShadow={true}
        />
      </Select>
    </group>
  );
}

useGLTF.preload("/RobotModel-transformed.glb");
