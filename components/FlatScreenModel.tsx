import * as THREE from "three";
import React, { Suspense } from "react";
import { useGLTF, useVideoTexture } from "@react-three/drei";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    defaultMaterial: THREE.Mesh;
  };
  materials: {
    ["02___Default"]: THREE.MeshStandardMaterial;
  };
  animations: GLTFAction[];
};

export function FlatScreenTVModel(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF("/FlatScreen-transformed.glb") as GLTFResult;

  // video material
  const texture = useVideoTexture(
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  );

  return (
    <group {...props} dispose={null}>
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
      {/* <mesh position={[0, 0.03, -0.006]}> */}
      {/*   <planeGeometry args={[1.95, 1.1]} /> */}
      {/*   <Html */}
      {/*     className="content" */}
      {/*     // rotation-x={-Math.PI / 2} */}
      {/*     position={[0, 0.00, -40]} */}
      {/*     distanceFactor={40} */}
      {/*     transform */}
      {/*     occlude */}
      {/*   > */}
      {/*     <div */}
      {/*       className="p-[10px] w-[1920px] h-[1080px] scale-[1] bg-black" */}
      {/*       onPointerDown={(e) => e.stopPropagation()} */}
      {/*     > */}
      {/*       <HomePage /> */}
      {/*     </div> */}
      {/*   </Html> */}
      {/* </mesh> */}
    </group>
  );
}

useGLTF.preload("/FlatScreen-transformed.glb");
