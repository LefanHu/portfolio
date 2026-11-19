import type { VignetteId } from "../captions";
import type { VignetteFactory } from "../types";
import adentro from "./adentro";
import amazonRobotics from "./amazon-robotics";
import atoms from "./atoms";
import avenFinancial from "./aven-financial";
import capitalOne from "./capital-one";
import ciena from "./ciena";
import telus from "./telus";

/** The scene for each role, by the role's id. */
export const SCENES: Record<VignetteId, VignetteFactory> = {
  "aven-financial": avenFinancial,
  atoms,
  "capital-one": capitalOne,
  "amazon-robotics": amazonRobotics,
  adentro,
  ciena,
  telus,
};
