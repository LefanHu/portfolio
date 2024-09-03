import { create } from "zustand";

interface CameraState {
  position: [number, number, number];
  targetPosition: [number, number, number];
  rotation: [number, number, number];
  targetLookat: [number, number, number];
  setCameraPosition: (newPosition: [number, number, number]) => void;
  setCameraLookat: (newRotation: [number, number, number]) => void;
}

export const useCameraStore = create<CameraState>()((set) => ({
  position: [0.5, 0, 5], // Initial camera position
  targetPosition: [0.5, 0, 5],
  rotation: [1, 0.5, 1], // Initial camera lookat target
  targetLookat: [1, 0.5, 1],

  // Action to update camera position smoothly
  setCameraPosition: (newPosition) =>
    set(() => ({
      targetPosition: newPosition, // target position for animation
    })),

  // Action to update camera rotation smoothly
  setCameraLookat: (newRotation) =>
    set(() => ({
      targetLookat: newRotation, // target rotation for animation
    })),
}));

interface ActiveViewState {
  activeView: string;
  setActiveView: (newView: string) => void;
}

export const useActiveViewState = create<ActiveViewState>((set) => ({
  activeView: "default",
  setActiveView: (newView) =>
    set(() => ({
      activeView: newView,
    })),
}));
