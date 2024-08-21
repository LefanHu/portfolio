import { create } from "zustand";

interface CameraState {
  position: [number, number, number];
  targetPosition: [number, number, number];
  rotation: [number, number, number];
  targetRotation: [number, number, number];
  setCameraPosition: (newPosition: [number, number, number]) => void;
  setCameraLookat: (newRotation: [number, number, number]) => void;
}

export const useCameraStore = create<CameraState>()((set) => ({
  position: [0.5, 0, 5], // Initial camera position
  targetPosition: [0.5, 0, 5],
  rotation: [1, 0.5, 1], // Initial camera lookat target
  targetRotation: [1, 0.5, 1],

  // Action to update camera position smoothly
  setCameraPosition: (newPosition) =>
    set(() => ({
      targetPosition: newPosition, // target position for animation
    })),

  // Action to update camera rotation smoothly
  setCameraLookat: (newRotation) =>
    set(() => ({
      targetRotation: newRotation, // target rotation for animation
    })),
}));
