import { create } from "zustand";
import type { CameraControls } from "@react-three/drei";

// Shared handle to the scene's drei CameraControls instance, so later scene
// pieces (projection fit-to-box, drag disabling orbit) can drive the camera.

interface CameraControlsState {
  controls: CameraControls | null;
  setControls(c: CameraControls | null): void;
}

const useCameraControlsStore = create<CameraControlsState>((set) => ({
  controls: null,
  setControls: (controls) => set({ controls }),
}));

/** The live CameraControls instance (null until the scene mounts). Re-renders when it changes. */
export function useCameraControls(): CameraControls | null {
  return useCameraControlsStore((s) => s.controls);
}

/** Non-reactive access, for event handlers and useFrame. */
export function getCameraControls(): CameraControls | null {
  return useCameraControlsStore.getState().controls;
}

/** Ref callback for <CameraControls ref={registerCameraControls} />. */
export function registerCameraControls(c: CameraControls | null) {
  useCameraControlsStore.getState().setControls(c);
}
