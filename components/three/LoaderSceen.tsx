import React from "react";
import { useProgress } from "@react-three/drei";

/**
 * Covers a 3D page until its scene is ready: while the scene's code is fetched
 * (the altar uses it as its dynamic-import fallback) and while three.js loads
 * assets (the older /home scene), then fades away. It is the site's sky in the
 * current theme, so the page does not flash black or white before the scene.
 */
export function LoaderScreen() {
  const { active, progress } = useProgress();
  const isLoading = active || progress < 100;

  return (
    <div
      role="status"
      className={
        "absolute bottom-0 left-0 z-50 flex h-full w-screen items-center justify-center bg-sky transition-[opacity,visibility] duration-[2s] " +
        (isLoading ? "" : "invisible opacity-0")
      }
    >
      <p className="text-sm text-mute">Loading the 3D scene…</p>
    </div>
  );
}
