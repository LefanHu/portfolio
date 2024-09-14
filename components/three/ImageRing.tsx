import { ScrollControls, useScroll, Image, Backdrop } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import * as easing from "maath/easing";
import * as THREE from "three";
import { MeshSineMaterial, BentPlaneGeometry } from "@/lib/three/custom";

function Card({ url }: { url: string }, ...props: any) {
  const ref = useRef<THREE.Mesh>(null!);
  const [hovered, hover] = useState(false);
  useFrame((state, delta) => {
    if (!ref.current) return;

    easing.damp3(ref.current.scale, hovered ? 1.15 : 1, 0.1, delta);
    easing.damp(
      ref.current.material,
      "radius",
      hovered ? 0.25 : 0.1,
      0.2,
      delta
    );
    easing.damp(ref.current.material, "zoom", hovered ? 1 : 1.5, 0.2, delta);
  });
  return (
    <>
      <planeBufferGeometry args={[1, 1]} />
    </>
  );
}

function Rig(props: JSX.IntrinsicElements["group"]) {
  const ref = useRef<any>();
  const scroll = useScroll();
  useFrame((state, delta) => {
    if (!ref.current) return;

    ref.current.rotation.y = -scroll.offset * (Math.PI * 2); // Rotate contents
    state.events.update; // Raycasts every frame rather than on pointer-move
    // easing.damp3(
    //   state.camera.position,
    //   [-state.pointer.x * 2, state.pointer.y + 1.5, 10],
    //   0.3,
    //   delta
    // ); // Move camera
    // state.camera.lookAt(0, 0, 0); // Look at center
  });

  return <group ref={ref} {...props} />;
}

export function ImageRing(props: { imagePaths: string[] }) {
  return (
    <>
      {/* <ScrollControls pages={4} infinite>
        <Rig> */}
      <BentPlane radius={1} width={1} height={1} />
      {/* </Rig>
      </ScrollControls> */}
    </>
  );
}
