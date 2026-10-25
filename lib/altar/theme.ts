import type { Theme } from "./store";

export type Vec3 = [number, number, number];

/** Albedo palette shared by both themes. Lighting does the theme work. */
export const PALETTE = {
  stone: "#8f8a80",
  stoneDark: "#5f5a54",
  stoneWorn: "#a39c8e",
  rock: "#857563",
  rockDark: "#4a413b",
  rockLow: "#6e6a78",
  dirt: "#7a5840",
  root: "#4d3a2b",
  grass: "#6f8f4a",
  grassDark: "#55743b",
  grassLight: "#88a65a",
  wood: "#8a5d3b",
  woodDark: "#5c3d27",
  metal: "#4b5058",
  brass: "#a8834a",
  paper: "#d9cfb8",
  cauldron: "#56504c",
} as const;

export interface DirectionalLight {
  color: string;
  intensity: number;
  position: Vec3;
}

export interface SceneTheme {
  /** Sky gradient stops: [top, horizon, bottom]. */
  sky: [string, string, string];
  fog: string;
  fogNear: number;
  fogFar: number;
  hemisphere: { sky: string; ground: string; intensity: number };
  sun: DirectionalLight;
  rim: DirectionalLight;
  underFill: DirectionalLight;
  lanternOn: boolean;
  lantern: { color: string; intensity: number; distance: number; glassEmissive: number };
  rune: { color: string; emissiveBase: number; emissivePulse: number; beamOpacity: number };
  cauldron: {
    energyCore: string;
    energyIntensity: number;
    spillOpacity: number;
    emberIntensity: number;
    brazierIntensity: number;
    lightIntensity: number;
    lightDistance: number;
  };
  projection: {
    line: string;
    lineBoost: number;
    fill: string;
    fillOpacity: number;
    text: string;
    blend: "additive" | "normal";
  };
  dust: { color: string; opacity: number };
  clouds: { color: string; opacity: number };
  moon: { color: string; opacity: number };
  bloomIntensity: number;
  ao: { intensity: number; color: string };
  /** Theme-tinted albedo overrides (shared palette values). */
  stone: string;
  wood: string;
  grass: string;
}

export const THEMES: Record<Theme, SceneTheme> = {
  dark: {
    sky: ["#081230", "#1d2d55", "#0a1230"],
    fog: "#1d2d55",
    fogNear: 16,
    fogFar: 46,
    hemisphere: { sky: "#5b6fa8", ground: "#2b3352", intensity: 0.7 },
    sun: { color: "#9db2ff", intensity: 0.75, position: [-6, 10, 5] },
    rim: { color: "#6fc8ff", intensity: 1.6, position: [-4, 5, -9] },
    underFill: { color: "#5a74c8", intensity: 2.4, position: [5, -6, 9] },
    lanternOn: true,
    lantern: { color: "#ff9f45", intensity: 8, distance: 4, glassEmissive: 3.2 },
    rune: { color: "#52e0ff", emissiveBase: 2.2, emissivePulse: 1.2, beamOpacity: 0.12 },
    cauldron: {
      energyCore: "#d8fdff",
      energyIntensity: 3.0,
      spillOpacity: 0.55,
      emberIntensity: 3.0,
      brazierIntensity: 2.6,
      lightIntensity: 30,
      lightDistance: 10,
    },
    projection: {
      line: "#6fe6ff",
      lineBoost: 2.6,
      fill: "#0b2a44",
      fillOpacity: 0.22,
      text: "#a8f1ff",
      blend: "additive",
    },
    dust: { color: "#bcd2ff", opacity: 0.55 },
    clouds: { color: "#2c3a6a", opacity: 0.6 },
    moon: { color: "#d6defa", opacity: 0.9 },
    bloomIntensity: 1.1,
    ao: { intensity: 2.2, color: "#05060d" },
    stone: PALETTE.stone,
    wood: PALETTE.wood,
    grass: PALETTE.grass,
  },
  light: {
    sky: ["#3a7fd0", "#bfdbf0", "#8db8de"],
    fog: "#bfdbf0",
    fogNear: 18,
    fogFar: 55,
    hemisphere: { sky: "#e4efff", ground: "#8a7d68", intensity: 1.1 },
    sun: { color: "#fff0d4", intensity: 2.1, position: [7, 11, 6] },
    rim: { color: "#ffe0b0", intensity: 0.7, position: [-5, 4, -9] },
    underFill: { color: "#c9b896", intensity: 1.1, position: [5, -6, 9] },
    lanternOn: false,
    lantern: { color: "#ffb56a", intensity: 0.6, distance: 4, glassEmissive: 0.6 },
    rune: { color: "#1fb5d6", emissiveBase: 1.05, emissivePulse: 0.45, beamOpacity: 0 },
    cauldron: {
      energyCore: "#c6f6ff",
      energyIntensity: 1.35,
      spillOpacity: 0.3,
      emberIntensity: 1.6,
      brazierIntensity: 1.3,
      lightIntensity: 3,
      lightDistance: 6,
    },
    projection: {
      line: "#1b2836",
      lineBoost: 1,
      fill: "#f5f1e6",
      fillOpacity: 0.72,
      text: "#2c3b4c",
      blend: "normal",
    },
    dust: { color: "#fff8e8", opacity: 0.3 },
    clouds: { color: "#ffffff", opacity: 0.95 },
    moon: { color: "#ffffff", opacity: 0 },
    bloomIntensity: 0.6,
    ao: { intensity: 1.6, color: "#1a140e" },
    stone: PALETTE.stone,
    wood: PALETTE.wood,
    grass: PALETTE.grass,
  },
};

export const BLOOM = {
  luminanceThreshold: 1,
  luminanceSmoothing: 0.1,
  mipmapBlur: true,
  radius: 0.7,
} as const;

export const AO = {
  aoRadius: 1.2,
  distanceFalloff: 1.0,
  quality: "medium",
} as const;

export const CAMERA = {
  position: [13.4, 8.9, 16.4] as Vec3,
  target: [0, 0.6, 0] as Vec3,
  fov: 32,
};

/** The sun casts all shadows; no other light does. */
export const SHADOWS = {
  mapSize: 2048,
  bias: -0.0004,
  normalBias: 0.03,
  radius: 4,
  /** Orthographic shadow-camera half-extent (box is ±extent). */
  extent: 8,
  near: 1,
  far: 40,
} as const;

export const THEME_TRANSITION_S = 1.5;

export function initialTheme(matchMedia?: (q: string) => { matches: boolean }): Theme {
  if (!matchMedia) return "dark";
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** postprocessing ToneMappingMode.ACES_FILMIC. The ToneMapping effect must be last in the composer. */
export const TONE_MAPPING_MODE = 6;

/** Theme-independent renderer settings. */
export const RENDERER = {
  dpr: [1, 2] as [number, number],
  antialias: false,
  shadows: "percentage",
  /** EffectComposer multisampling (SMAA does the anti-aliasing). */
  multisampling: 0,
} as const;

/** Point-light decay per light. */
export const LIGHT_DECAY = {
  lantern: 1.4,
  cauldron: 1.5,
} as const;
