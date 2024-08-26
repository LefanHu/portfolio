import * as THREE from "three";
import React, { Suspense, useEffect, useState } from "react";
import { useGraph } from "@react-three/fiber";
import { Float, Html, Plane, useGLTF } from "@react-three/drei";
import { GLTF, SkeletonUtils } from "three-stdlib";
import { Select } from "@react-three/postprocessing";
import { SceneLabels } from "./three/PortfolioLabels";
import {
  CodeBracketSquareIcon,
  DocumentTextIcon,
  HeartIcon,
  PresentationChartLineIcon,
} from "@heroicons/react/24/outline";

type GLTFResult = GLTF & {
  nodes: {
    ["23-material"]: THREE.Mesh;
    ["233814d130-material"]: THREE.Mesh;
    ["243626d154-material"]: THREE.Mesh;
    ["44-material"]: THREE.Mesh;
    defaultMaterial: THREE.Mesh;
    ["Line001_Material_#295_0"]: THREE.Mesh;
    Mesh_01_Head_01_Head_0: THREE.Mesh;
    Mesh_02_Body_02_Body_0: THREE.Mesh;
    Mesh_03_Base_03_Base_0: THREE.Mesh;
    Box040_Sofa_Gray_0: THREE.Mesh;
    Box040_Material_0: THREE.Mesh;
    Box040_Sofa_Dark_0: THREE.Mesh;
    Cube003_Material005_0: THREE.Mesh;
    defaultMaterial_1: THREE.Mesh;
  };
  materials: {
    PaletteMaterial001: THREE.MeshStandardMaterial;
    ["233814d130"]: THREE.MeshStandardMaterial;
    ["243626d154"]: THREE.MeshStandardMaterial;
    PaletteMaterial002: THREE.MeshStandardMaterial;
    ["02___Default"]: THREE.MeshStandardMaterial;
    Material_295: THREE.MeshStandardMaterial;
    ["01_Head"]: THREE.MeshStandardMaterial;
    ["02_Body"]: THREE.MeshStandardMaterial;
    ["03_Base"]: THREE.MeshStandardMaterial;
    Sofa_Gray: THREE.MeshStandardMaterial;
    PaletteMaterial003: THREE.MeshStandardMaterial;
    Sofa_Dark: THREE.MeshStandardMaterial;
    ["Material.005"]: THREE.MeshStandardMaterial;
    lambert1: THREE.MeshStandardMaterial;
  };
  // animations: GLTFAction[]
};

export function PortfolioScene(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/PortfolioScene-transformed.glb");
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone) as GLTFResult;
  const [hovered, setHovered] = useState<string>("");

  // video material
  // const texture = useVideoTexture(
  //   "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
  // );
  return (
    <group {...props} dispose={null}>
      <directionalLight intensity={4} color={0xf5ad64} position={[-1.449, 11.4, 10.477]} />

      <Float floatingRange={[0.05, 0.1]}>
        {/* lego spaceship */}
        <Select
          enabled={hovered === "SPACESHIP"}
          onPointerEnter={() => setHovered("SPACESHIP")}
          onPointerOut={() => setHovered("")}
        >
          <group scale={0.2} position={[1.8, 0.5, 1]} rotation={[0, -Math.PI / 3, Math.PI / 6]}>
            <pointLight
              name="PointLight"
              intensity={1 / 10}
              decay={2}
              position={[-2.931, 1.049, 0.555]}
            />
            <pointLight
              name="PointLight_2"
              intensity={1 / 10}
              decay={2}
              position={[-4.326, 2.36, 1.583]}
            />
            <mesh
              name="23-material"
              geometry={nodes["23-material"].geometry}
              material={materials.PaletteMaterial001}
              position={[-3.385, 1.855, 0.771]}
              rotation={[-0.136, 0.657, -0.393]}
              scale={0.02}
              castShadow
            />
            <mesh
              name="233814d130-material"
              geometry={nodes["233814d130-material"].geometry}
              material={materials["233814d130"]}
              position={[-4.076, 1.821, 0.705]}
              rotation={[0, 0.606, -0.65]}
              scale={0.02}
              castShadow
            />
            <mesh
              name="243626d154-material"
              geometry={nodes["243626d154-material"].geometry}
              material={materials["243626d154"]}
              position={[-3.577, 2.047, 0.607]}
              rotation={[-0.443, -0.06, -0.522]}
              scale={0.02}
              castShadow
            />
            <mesh
              name="44-material"
              geometry={nodes["44-material"].geometry}
              material={materials.PaletteMaterial002}
              position={[-4.379, 2.306, 1.434]}
              rotation={[-0.928, -0.713, -2.288]}
              scale={0.02}
              castShadow
            />
          </group>
        </Select>
      </Float>

      {/* tv */}
      <group>
        <mesh
          name="defaultMaterial"
          geometry={nodes.defaultMaterial.geometry}
          material={materials["02___Default"]}
          position={[-1.812, 0.593, 0]}
          rotation={[0, Math.PI / 6, 0]}
          scale={0.995}
          castShadow
        />
        {/* iframe */}
        <mesh position={[-1.812, 0.626, 0]} rotation={[0, Math.PI / 6, 0]}>
          <Suspense fallback={null}>
            {/* <meshBasicMaterial map={texture} toneMapped={false} /> */}
            <Html
              transform
              position={[0, 0, -0.001]}
              occlude={"blending"}
              scale={0.092}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <iframe src="https://lefan.ca" className="w-[854px] h-[480px]" />
            </Html>
          </Suspense>
        </mesh>
      </group>

      <Select
        enabled={hovered === "GUITAR"}
        onPointerOver={() => setHovered("GUITAR")}
        onPointerOut={() => setHovered("")}
      >
        <mesh
          name="Line001_Material_#295_0"
          geometry={nodes["Line001_Material_#295_0"].geometry}
          material={materials.Material_295}
          position={[-2.799, 0.442, 0.815]}
          rotation={[-2.16, 0.214, -0.423]}
          scale={0.02}
          castShadow
        />
      </Select>

      {/* robot */}
      <Select
        enabled={hovered === "ROBOT"}
        onPointerOver={() => setHovered("ROBOT")}
        onPointerOut={() => setHovered("")}
      >
        <group>
          <mesh
            name="Mesh_01_Head_01_Head_0"
            geometry={nodes.Mesh_01_Head_01_Head_0.geometry}
            material={materials["01_Head"]}
            position={[-0.793, 0, -0.387]}
            scale={0.02}
            castShadow
          />
          <mesh
            name="Mesh_02_Body_02_Body_0"
            geometry={nodes.Mesh_02_Body_02_Body_0.geometry}
            material={materials["02_Body"]}
            position={[-0.793, 0, -0.387]}
            scale={0.02}
            castShadow
          />
          <mesh
            name="Mesh_03_Base_03_Base_0"
            geometry={nodes.Mesh_03_Base_03_Base_0.geometry}
            material={materials["03_Base"]}
            position={[-0.793, 0, -0.387]}
            scale={0.02}
            castShadow
          />
        </group>
      </Select>

      <mesh
        name="Box040_Sofa_Gray_0"
        geometry={nodes.Box040_Sofa_Gray_0.geometry}
        material={materials.Sofa_Gray}
        position={[1.687, 0.125, -1.014]}
        rotation={[-Math.PI / 2, 0, -0.548]}
        scale={0.5}
        castShadow
      />
      <mesh
        name="Box040_Material_0"
        geometry={nodes.Box040_Material_0.geometry}
        material={materials.PaletteMaterial003}
        position={[1.687, 0.125, -1.014]}
        rotation={[-Math.PI / 2, 0, -0.548]}
        scale={0.5}
        castShadow
        // receiveShadow
      />
      <mesh
        name="Box040_Sofa_Dark_0"
        geometry={nodes.Box040_Sofa_Dark_0.geometry}
        material={materials.Sofa_Dark}
        position={[1.687, 0.125, -1.014]}
        rotation={[-Math.PI / 2, 0, -0.548]}
        scale={0.5}
      />
      <mesh
        name="Cube003_Material005_0"
        geometry={nodes.Cube003_Material005_0.geometry}
        material={materials["Material.005"]}
        position={[1.443, 0, 0.262]}
        rotation={[-Math.PI / 2, 0, -0.548]}
        scale={0.5}
        castShadow
        receiveShadow
      />

      {/* kanata */}

      <Select
        enabled={hovered === "KATANA"}
        onPointerOver={() => setHovered("KATANA")}
        onPointerOut={() => setHovered("")}
      >
        <mesh
          name="defaultMaterial_1"
          geometry={nodes.defaultMaterial_1.geometry}
          material={materials.lambert1}
          position={[-0.029, 0.413, -0.393]}
          rotation={[-0.977, -0.397, 0.328]}
          scale={0.5}
          castShadow
          receiveShadow
        />
      </Select>

      {hovered && (
        <SceneLabels
          position={[0, 2, -2]}
          rotation={[0, 0, 0]}
          sceneProps={{ selected: hovered }}
        />
      )}

      {/* tv controls */}
      <group position={[-1.812, 0.593, 0]} rotation={[0, Math.PI / 6, 0]}>
        <Html
          transform
          className="text-red-500 border-4 rounded-md w-[700px] h-[100px] border-gray-400 select-none"
          position={[0, -0.48, 0.8]}
          rotation={[-Math.PI / 6, 0, 0]}
          scale={0.1}
          // distanceFactor={0.7}
        >
          <div className="absolute bg-white bg-opacity-50 h-full w-full blur-md">test</div>
          <div className="flex flex-row items-center justify-around h-full w-full">
            <div className="text-black z-10 text-center">
              <CodeBracketSquareIcon
                className="text-sky-400 transition-all duration-300 hover:scale-110 hover:text-red-500"
                height={60}
              />
              Projects
            </div>
            <div className="text-black z-10 text-center flex flex-col">
              <PresentationChartLineIcon
                className="text-sky-400 transition-all duration-300 hover:scale-110 hover:text-red-500"
                height={60}
              />
              Experiences
            </div>
            <div className="text-black z-10 text-center flex flex-col">
              <HeartIcon
                className="text-sky-400 transition-all duration-300 hover:scale-110 hover:text-red-500"
                height={60}
              />
              Taylor Swift
            </div>

            <div className="text-black z-10 text-center">
              <DocumentTextIcon
                className="text-sky-400 transition-all duration-300 hover:scale-110 hover:text-red-500"
                height={60}
              />
              Resume
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}

useGLTF.preload("/PortfolioScene-transformed.glb");
