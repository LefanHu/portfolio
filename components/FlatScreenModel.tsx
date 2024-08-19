import * as THREE from "three";
import React, { Suspense, useState } from "react";
import { useGLTF, useVideoTexture } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { Select } from "@react-three/postprocessing";

type GLTFResult = GLTF & {
  nodes: {
    defaultMaterial: THREE.Mesh;
  };
  materials: {
    ["02___Default"]: THREE.MeshStandardMaterial;
  };
  // animations: GLTFAction[];
};

export function FlatScreenTVModel(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF("/FlatScreen-transformed.glb") as GLTFResult;
  const [hovered, setHovered] = useState<string>("");

  // video material
  const texture = useVideoTexture(
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
  );

  return (
    <group {...props} dispose={null}>
      <Select
        enabled={hovered === "TV"}
        onPointerOver={() => setHovered("TV")}
        onPointerOut={() => setHovered("")}
      >
        <mesh
          castShadow={true}
          name="defaultMaterial"
          geometry={nodes.defaultMaterial.geometry}
          material={materials["02___Default"]}
          scale={0.995}
        />
        <mesh position={[0, 0.03, -0.006]}>
          <planeGeometry args={[1.95, 1.1]} />
          <Suspense fallback={null}>
            <meshBasicMaterial map={texture} toneMapped={false} />
          </Suspense>
        </mesh>
      </Select>
    </group>
  );
}

useGLTF.preload("/FlatScreen-transformed.glb");
