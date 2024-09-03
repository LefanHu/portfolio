import { useCameraStore } from "./store";

export const setViewPosition = (positionName: string) => {
  switch (positionName) {
    case "TV":
      useCameraStore.setState({ targetPosition: [0.2, 0.2, 2.5] });
      useCameraStore.setState({ targetLookat: [-0.6, 0.2, 0] });
      break;
    case "Projects":
      useCameraStore.setState({ targetPosition: [4, 0.8, -2.3] });
      useCameraStore.setState({ targetLookat: [-8, 1, 14] });
      break;
    default:
      useCameraStore.setState({ targetPosition: [0.5, 0, 5] });
      useCameraStore.setState({ targetLookat: [1, 0.5, 1] });
  }
};
