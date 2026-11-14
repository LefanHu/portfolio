"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { createContext, useContext, useRef, type ReactNode } from "react";

/** What the playground passes to every scene. */
export interface SceneProps {
  className?: string;
  /** Hold the animation on its current frame. The camera can still be orbited. */
  paused?: boolean;
  /** Called once the WebGL context exists and the scene can draw. */
  onReady?: () => void;
}

// A frame after a pause or a hidden tab reports the whole gap as its delta;
// capping it keeps the animation from leaping ahead.
const MAX_STEP = 0.1;

// Where every scene's clock starts, in seconds. Not zero: a scene that opens
// paused (reduced motion) shows this moment as its still, and at zero the neon
// tunnel's rings are all still out of sight in the fog.
const OPENING_TIME = 8;

const PausedContext = createContext(false);

/**
 * Runs `callback` every rendered frame with the scene's own clock: seconds of
 * animation played so far. Unlike three's clock it stops while the scene is
 * paused, so a paused scene stays put when the camera is orbited and picks up
 * where it left off.
 */
export function useSceneFrame(callback: (time: number) => void) {
  const paused = useContext(PausedContext);
  const time = useRef(OPENING_TIME);

  useFrame((_, delta) => {
    if (!paused) {
      time.current += Math.min(delta, MAX_STEP);
    }
    callback(time.current);
  });
}

/**
 * The canvas every playground scene draws on. While paused it renders on
 * demand only (once at mount, then when the camera moves), which is also the
 * still frame shown under reduced motion.
 */
export default function SceneCanvas({
  className,
  paused = false,
  onReady,
  shadows,
  testId,
  children,
}: SceneProps & { shadows?: boolean; testId: string; children: ReactNode }) {
  return (
    <div className={className} data-testid={testId}>
      <Canvas
        dpr={[1, 1.5]}
        shadows={shadows}
        frameloop={paused ? "demand" : "always"}
        onCreated={() => onReady?.()}
      >
        {/* Provided inside the canvas: its contents are rendered by a separate React root. */}
        <PausedContext.Provider value={paused}>{children}</PausedContext.Provider>
      </Canvas>
    </div>
  );
}
