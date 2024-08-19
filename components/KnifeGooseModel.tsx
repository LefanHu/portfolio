import * as THREE from "three";
import React, { useEffect, useState } from "react";
import { useGraph } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { GLTF, SkeletonUtils } from "three-stdlib";

type ActionName = "Armature|walk";

interface GLTFAction extends THREE.AnimationClip {
  name: ActionName;
}

type GLTFResult = GLTF & {
  nodes: {
    Object_9: THREE.SkinnedMesh;
    Object_10: THREE.SkinnedMesh;
    Object_11: THREE.SkinnedMesh;
    Object_12: THREE.SkinnedMesh;
    Object_13: THREE.SkinnedMesh;
    _rootJoint: THREE.Bone;
  };
  materials: {
    PaletteMaterial001: THREE.MeshStandardMaterial;
  };
  animations: GLTFAction[];
};

export function KnifeGooseModel(props: JSX.IntrinsicElements["group"]) {
  const group = React.useRef<THREE.Group>();
  const { scene, animations } = useGLTF("/KnifeGoose-transformed.glb");
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone) as GLTFResult;
  const { actions } = useAnimations(animations, group);

  // animation playback
  // React.useEffect(() => {
  //   actions["Armature|walk"].play();
  //   return () => void actions["Armature|walk"].stop();
  // }, [actions]);
  const [hovered, setHovered] = useState<string>("");

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Sketchfab_Scene">
        <primitive object={nodes._rootJoint} />
        <skinnedMesh
          name="Object_9"
          geometry={nodes.Object_9.geometry}
          material={materials.PaletteMaterial001}
          skeleton={nodes.Object_9.skeleton}
          position={[-0.333, 0.82, -2.833]}
          rotation={[-Math.PI / 2, 0, -Math.PI]}
          scale={5.152}
          castShadow={true}
        />
        <skinnedMesh
          name="Object_10"
          geometry={nodes.Object_10.geometry}
          material={materials.PaletteMaterial001}
          skeleton={nodes.Object_10.skeleton}
          position={[-0.333, 0.82, -2.833]}
          rotation={[-Math.PI / 2, 0, -Math.PI]}
          scale={5.152}
          castShadow={true}
        />
        <skinnedMesh
          name="Object_11"
          geometry={nodes.Object_11.geometry}
          material={materials.PaletteMaterial001}
          skeleton={nodes.Object_11.skeleton}
          position={[-0.333, 0.82, -2.833]}
          rotation={[-Math.PI / 2, 0, -Math.PI]}
          scale={5.152}
          castShadow={true}
        />
        <skinnedMesh
          name="Object_12"
          geometry={nodes.Object_12.geometry}
          material={materials.PaletteMaterial001}
          skeleton={nodes.Object_12.skeleton}
          position={[-0.333, 0.82, -2.833]}
          rotation={[-Math.PI / 2, 0, -Math.PI]}
          scale={5.152}
          castShadow={true}
        />
        <skinnedMesh
          name="Object_13"
          geometry={nodes.Object_13.geometry}
          material={materials.PaletteMaterial001}
          skeleton={nodes.Object_13.skeleton}
          position={[-0.333, 0.82, -2.833]}
          rotation={[-Math.PI / 2, 0, -Math.PI]}
          scale={5.152}
          castShadow={true}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/KnifeGoose-transformed.glb");
