import * as THREE from "three";
import React, { useState } from "react";
import { Html } from "@react-three/drei";
import BasicUICard from "../BasicNextUICard";

interface SceneLabelsProps {
  selected: string;
}

export function SceneLabels({
  sceneProps,
  ...props
}: { sceneProps: SceneLabelsProps } & JSX.IntrinsicElements["group"]) {
  return (
    <group {...props}>
      <Html transform occlude="blending">
        <BasicUICard
          text={sceneProps.selected}
          className="text-black bg-gray-50 border-pink-500 border-[1px] rounded-md"
        />
      </Html>
    </group>
  );
}
