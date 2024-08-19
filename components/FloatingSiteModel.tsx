import React from "react";
import { Html } from "@react-three/drei";
import HomePage from "@/app/(portfolio)/page";

export function FloatingSiteModel(props: JSX.IntrinsicElements["group"]) {
  return (
    <group {...props} dispose={null}>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[192/4, 108/4]} />
        <Html
          className="content"
          // rotation-x={-Math.PI / 2}
          position={[0, 0, 2.001]}
          transform
          occlude
        >
          <div
            className="p-[10px] w-[1920px] h-[1080px] scale-[1] bg-black"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <HomePage />
          </div>
        </Html>
      </mesh>
    </group>
  );
}
