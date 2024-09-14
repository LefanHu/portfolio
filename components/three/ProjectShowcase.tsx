import { Suspense, useEffect, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useActiveViewStore } from "@/lib/store";
import { map } from "lodash";
import * as THREE from "three";
import { Box } from "../Box";

export function ProjectShowcase() {
  const { activeView } = useActiveViewStore();
  const [content, setContent] = useState<JSX.Element | null>(null);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
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

    switch (activeView) {
      case "TaylorSwift":
        // show taylor swift things
        break;
      case "Projects":
        // show interests
        setContent(
          <>
            {map(imageNames, (imgName, indx) => (
              <Html
                position={[0, indx / 3 - 3, 0]}
                key={indx}
                transform
                className="text-black"
              >
                <p key={imgName}>{imgName}</p>
              </Html>
            ))}
          </>
        );
        break;
      default:
        break;
    }

    // make every child of the group lookat the camera
    if (groupRef.current) {
      groupRef.current.children.forEach((child) => {
        child.lookAt(-8, 3, 13);
      });
    }
  }, [activeView]);

  return (
    <group
      position={[-8, 1, 14]}
      rotation={[0, (5 * Math.PI) / 6, 0]}
      ref={groupRef}
    >
      {content}
      {/* <Box position={[-8, 3, 13]} /> */}
    </group>
  );
}
