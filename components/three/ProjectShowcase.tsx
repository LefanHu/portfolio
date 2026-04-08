import { useLayoutEffect, useMemo, useRef } from "react";
import { Html } from "@react-three/drei";
import { useActiveViewStore } from "@/lib/store";
import { map } from "lodash";
import * as THREE from "three";
import type { ReactNode } from "react";

const imageNames = [
  "test name",
  "something",
  "else",
  "is",
  "up",
  "here",
  "something",
  "else",
  "is",
  "up",
  "here",
  "something",
  "else",
  "is",
  "up",
  "here",
  "something",
  "else",
  "is",
  "up",
  "here",
  "something",
  "else",
  "is",
  "up",
  "here",
  "something",
  "else",
  "is",
  "up",
  "here",
];

export function ProjectShowcase() {
  const { activeView } = useActiveViewStore();
  const groupRef = useRef<THREE.Group>(null);

  const content = useMemo<ReactNode>(() => {
    switch (activeView) {
      case "Projects":
        return (
          <>
            {map(imageNames, (imgName, indx) => (
              <Html
                position={[0, indx / 3 - 3, 0]}
                key={`${imgName}-${indx}`}
                transform
                className="text-black"
              >
                <p>{imgName}</p>
              </Html>
            ))}
          </>
        );
      case "TaylorSwift":
      default:
        return null;
    }
  }, [activeView]);

  useLayoutEffect(() => {
    // make every child of the group lookat the camera
    if (groupRef.current) {
      groupRef.current.children.forEach((child) => {
        child.lookAt(-8, 3, 13);
      });
    }
  }, [content]);

  return (
    <group
      position={[-8, 1, 14]}
      rotation={[0, (5 * Math.PI) / 6, 0]}
      ref={groupRef}
    >
      {content}
    </group>
  );
}
