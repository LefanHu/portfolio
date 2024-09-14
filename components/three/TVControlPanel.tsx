import React, { useEffect, useState } from "react";
import { Html } from "@react-three/drei";

import {
  CodeBracketSquareIcon,
  DocumentTextIcon,
  HeartIcon,
  PresentationChartLineIcon,
  TvIcon,
} from "@heroicons/react/24/outline";
import { setViewPosition } from "@/lib/threeSceneViewHelpers";
import { useActiveViewStore } from "@/lib/store";

export function TVControls() {
  const { activeView } = useActiveViewStore();

  const setView = (positionName: string) => {
    setViewPosition(positionName);
  };

  // Escape key to reset camera position
  useEffect(() => {
    const handleKeyDown = (event: { key: string }) => {
      if (event.key === "Escape" || event.key === "Esc") {
        setView("default");
      }
    };

    // Attach the event listener
    window.addEventListener("keydown", handleKeyDown);

    // cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <group position={[-1.812, 0.593, 0]} rotation={[0, Math.PI / 6, 0]}>
      <Html
        transform
        className={
          "text-red-500 border-4 rounded-md w-[700px] h-[100px] border-gray-400 select-none bg-gray-300 bg-opacity-50" +
          " " +
          (!(activeView === "default") ? "hidden" : "")
        }
        position={[0, -0.48, 0.8]}
        rotation={[-Math.PI / 6, 0, 0]}
        scale={0.1}
        onPointerDown={(e) => e.stopPropagation()}
        // hidden={viewing === "TV" || viewing === "default"}
        // hidden={true}
      >
        <div className="flex flex-row items-center justify-around h-full w-full select-none">
          <div className="text-black z-10 text-center">
            <TvIcon
              className="cursor-pointer text-sky-400 transition-all duration-300 hover:scale-110 hover:text-red-500"
              height={60}
              onClick={() => setView("TV")}
            />
            TV
          </div>
          <div className="text-black z-10 text-center">
            <CodeBracketSquareIcon
              className="cursor-pointer text-sky-400 transition-all duration-300 hover:scale-110 hover:text-red-500"
              height={60}
              onClick={() => setView("Projects")}
            />
            Projects
          </div>
          <div className="text-black z-10 text-center flex flex-col">
            <PresentationChartLineIcon
              className="cursor-pointer text-sky-400 transition-all duration-300 hover:scale-110 hover:text-red-500"
              height={60}
              onClick={() => setView("Projects")}
            />
            Experiences
          </div>
          <div className="text-black z-10 text-center flex flex-col">
            <HeartIcon
              className="cursor-pointer text-sky-400 transition-all duration-300 hover:scale-110 hover:text-red-500"
              height={60}
              onClick={() => setView("Projects")}
            />
            Taylor Swift
          </div>

          <div className="text-black z-10 text-center">
            <DocumentTextIcon
              className="cursor-pointer text-sky-400 transition-all duration-300 hover:scale-110 hover:text-red-500"
              height={60}
              onClick={() => setView("Projects")}
            />
            Resume
          </div>
        </div>
      </Html>
    </group>
  );
}
