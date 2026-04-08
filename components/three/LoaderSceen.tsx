import React from "react";
import { useProgress } from "@react-three/drei";

export function LoaderScreen() {
  const { active, progress } = useProgress();
  const isLoading = active || progress < 100;

  return (
    <div
      className={
        "absolute w-screen h-full bottom-0 left-0 bg-black transition-all duration-[2s] z-50 " +
        (isLoading ? "" : "bg-transparent invisible")
      }
    ></div>
  );
}
