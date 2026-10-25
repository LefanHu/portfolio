"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls, CameraControlsImpl, PerformanceMonitor } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { CAMERA_HOME, ORBIT_LIMITS, RELAXED_LIMITS } from "@/lib/altar/layout";
import { useAltarStore } from "@/lib/altar/store";
import { CAMERA, RENDERER, THEMES, initialTheme } from "@/lib/altar/theme";
import { registerCameraControls } from "./cameraControls";
import Items from "./items/Items";
import Projection from "./projection/Projection";
import Altar from "./scene/Altar";
import Atmosphere from "./scene/Atmosphere";
import Backdrop from "./scene/Backdrop";
import Desk from "./scene/Desk";
import Effects from "./scene/Effects";
import Island from "./scene/Island";
import RelicStand from "./scene/RelicStand";
import Ruins from "./scene/Ruins";
import Overlay from "./ui/Overlay";
import RecipeBoardInScene from "./ui/RecipeBoardInScene";

const { ACTION } = CameraControlsImpl;

/**
 * Pick the starting theme before the scene mounts: an explicit `?theme=` wins
 * (handy for screenshots), then a persisted choice, then the OS preference.
 */
function applyInitialTheme() {
  const { setTheme } = useAltarStore.getState();
  const q = new URLSearchParams(window.location.search).get("theme");
  if (q === "dark" || q === "light") {
    setTheme(q);
    return;
  }
  let persisted = false;
  try {
    persisted = sessionStorage.getItem("altar") !== null;
  } catch {
    // storage unavailable: fall through to the OS preference
  }
  if (!persisted) setTheme(initialTheme(window.matchMedia.bind(window)));
}

const ORBIT_BUTTONS = { left: ACTION.ROTATE, middle: ACTION.DOLLY, right: ACTION.NONE, wheel: ACTION.DOLLY };
const ORBIT_TOUCHES = { one: ACTION.TOUCH_ROTATE, two: ACTION.TOUCH_DOLLY, three: ACTION.NONE };
const NO_BUTTONS = { left: ACTION.NONE, middle: ACTION.NONE, right: ACTION.NONE, wheel: ACTION.NONE };
const NO_TOUCHES = { one: ACTION.NONE, two: ACTION.NONE, three: ACTION.NONE };

/**
 * Orbit-only camera (no pan), shared via cameraControls.ts. This is the one
 * place that decides camera input by phase: in idle the visitor orbits within
 * ORBIT_LIMITS; while a section is open (revealing → returning) all input is
 * off (the wheel scrolls the panel instead of dollying) and the limits relax
 * so Projection can fly the camera to the close-up and back. Limits return
 * when the phase is idle again, with the camera already home, so nothing snaps.
 * Item drags only toggle `enabled` while idle (see DraggableItem).
 */
function CameraRig() {
  const ref = useRef<CameraControls>(null);
  const idle = useAltarStore((s) => s.phase === "idle");
  const limits = idle ? ORBIT_LIMITS : RELAXED_LIMITS;
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.setLookAt(...CAMERA_HOME.position, ...CAMERA_HOME.target, false);
    registerCameraControls(c);
    return () => registerCameraControls(null);
  }, []);
  useEffect(() => {
    if (ref.current) ref.current.enabled = idle;
  }, [idle]);
  return (
    <CameraControls
      ref={ref}
      makeDefault
      minDistance={limits.distance[0]}
      maxDistance={limits.distance[1]}
      minPolarAngle={limits.polar[0]}
      maxPolarAngle={limits.polar[1]}
      minAzimuthAngle={limits.azimuth[0]}
      maxAzimuthAngle={limits.azimuth[1]}
      mouseButtons={idle ? ORBIT_BUTTONS : NO_BUTTONS}
      touches={idle ? ORBIT_TOUCHES : NO_TOUCHES}
    />
  );
}

export default function AltarExperience() {
  useState(applyInitialTheme);
  const theme = useAltarStore((s) => s.theme);
  // Controlled: Canvas re-applies its dpr prop on every render, so an imperative
  // setDpr(1) would be undone by the next theme toggle or resize.
  const [dpr, setDpr] = useState<number | [number, number]>(RENDERER.dpr);

  return (
    <div className="fixed inset-0" style={{ background: THEMES[theme].sky[1] }}>
      <Canvas
        shadows={RENDERER.shadows}
        dpr={dpr}
        camera={{ position: CAMERA.position, fov: CAMERA.fov, near: 0.5, far: 200 }}
        gl={{ antialias: RENDERER.antialias, powerPreference: "high-performance" }}
      >
        {/* Steps the resolution down to 1x on sustained low fps; never back up, so it cannot flap. */}
        <PerformanceMonitor onDecline={() => setDpr(1)} />
        <Atmosphere />
        <Backdrop />
        <Suspense fallback={null}>
          <Physics>
            <Island />
            <Ruins />
            <Altar />
            <Desk />
            <RelicStand />
            <Items />
          </Physics>
        </Suspense>
        <Projection />
        <RecipeBoardInScene />
        <CameraRig />
        <Effects />
      </Canvas>
      <Overlay />
    </div>
  );
}
