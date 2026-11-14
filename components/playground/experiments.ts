// The playground's catalogue: every experiment, in the order it is listed and
// stepped through. The first entry is what `/js` shows without a `?script=`.

/** The react-three-fiber scenes in components/portfolio/js, by component name. */
export type SceneName =
  | "VoxelFunctionField3D"
  | "NeonTunnel3D"
  | "ParticleWave3D"
  | "OrbitalNodes3D"
  | "CrystalLattice3D";

interface ExperimentBase {
  /** The value of `?script=` that selects this experiment. */
  id: string;
  title: string;
  /** One line on what you are looking at. */
  description: string;
  /** How to interact, for the pieces that respond to input. The rest run by themselves. */
  hint?: string;
  /** Source file name. */
  file: string;
}

/** A plain canvas script from public/scripts, run inside the sandboxed frame. */
export interface ScriptExperiment extends ExperimentBase {
  kind: "script";
}

/** A React scene from components/portfolio/js, loaded on demand. */
export interface SceneExperiment extends ExperimentBase {
  kind: "scene";
  scene: SceneName;
}

export type Experiment = ScriptExperiment | SceneExperiment;

const ORBIT_HINT = "Drag to orbit, scroll or pinch to zoom";

export const EXPERIMENTS: readonly Experiment[] = [
  {
    id: "sort-visualizer",
    kind: "script",
    file: "sort_visualizer.js",
    title: "Sort visualizer",
    description: "Six classic sorting algorithms, animated one comparison at a time.",
    hint: "Pick an algorithm or shuffle",
  },
  {
    id: "starfield-warp",
    kind: "script",
    file: "starfield_warp.js",
    title: "Starfield warp",
    description: "A hyperspace starfield that rushes toward the viewer.",
  },
  {
    id: "orbit-trails",
    kind: "script",
    file: "orbit_trails.js",
    title: "Orbit trails",
    description: "Satellites orbit a center point and leave vivid motion trails.",
  },
  {
    id: "hue-effect",
    kind: "script",
    file: "hue_effect.js",
    title: "Hue trail",
    description: "Particles burst from the pointer while their hue drifts around the wheel.",
    hint: "Move the pointer or drag a finger",
  },
  {
    id: "matrix-rain",
    kind: "script",
    file: "matrix_rain.js",
    title: "Matrix rain",
    description: "Digital rain with glowing characters drifting down the screen.",
  },
  {
    id: "lava-lamp",
    kind: "script",
    file: "lava_lamp.js",
    title: "Lava lamp",
    description: "Soft neon blobs pulse and drift like a retro lava lamp.",
  },
  {
    id: "sunset-waves",
    kind: "script",
    file: "sunset_waves.js",
    title: "Sunset waves",
    description: "Layered sine waves shimmer beneath a warm sunset gradient.",
  },
  {
    id: "plasma-field",
    kind: "script",
    file: "plasma_field.js",
    title: "Plasma field",
    description: "A shimmering plasma texture that ripples through warm neon hues.",
  },
  {
    id: "fireflies",
    kind: "script",
    file: "fireflies.js",
    title: "Fireflies",
    description: "Dozens of glowing fireflies drift and pulse in the dark.",
  },
  {
    id: "kaleidoscope-lines",
    kind: "script",
    file: "kaleidoscope_lines.js",
    title: "Kaleidoscope",
    description: "Mirrored linework spins into a live kaleidoscope pattern.",
  },
  {
    id: "tunnel-rings",
    kind: "script",
    file: "tunnel_rings.js",
    title: "Tunnel rings",
    description: "Concentric rings surge forward like a luminous tunnel.",
  },
  {
    id: "equalizer-bars",
    kind: "script",
    file: "equalizer_bars.js",
    title: "Equalizer bars",
    description: "Fake audio bars bounce in front of a synthwave backdrop.",
  },
  {
    id: "balls",
    kind: "script",
    file: "balls.js",
    title: "Bouncing balls",
    description: "A classic bouncing-ball canvas sketch with fading trails.",
  },
  {
    id: "voxel-function-field",
    kind: "scene",
    scene: "VoxelFunctionField3D",
    file: "VoxelFunctionField3D.tsx",
    title: "Voxel gyroid",
    description: "A gyroid, an implicit 3D surface, sampled into voxels as it drifts by.",
    hint: ORBIT_HINT,
  },
  {
    id: "neon-tunnel-3d",
    kind: "scene",
    scene: "NeonTunnel3D",
    file: "NeonTunnel3D.tsx",
    title: "Neon tunnel",
    description: "A glowing tunnel of rings rushing through a dark void.",
    hint: ORBIT_HINT,
  },
  {
    id: "particle-wave-3d",
    kind: "scene",
    scene: "ParticleWave3D",
    file: "ParticleWave3D.tsx",
    title: "Particle wave",
    description: "A wave surface made from hundreds of floating particles.",
    hint: ORBIT_HINT,
  },
  {
    id: "orbital-nodes-3d",
    kind: "scene",
    scene: "OrbitalNodes3D",
    file: "OrbitalNodes3D.tsx",
    title: "Orbital nodes",
    description: "Colorful nodes orbit a bright core in layered trajectories.",
    hint: ORBIT_HINT,
  },
  {
    id: "crystal-lattice-3d",
    kind: "scene",
    scene: "CrystalLattice3D",
    file: "CrystalLattice3D.tsx",
    title: "Crystal lattice",
    description: "A pulsing lattice of crystalline forms in a volumetric grid.",
    hint: ORBIT_HINT,
  },
];

export const DEFAULT_EXPERIMENT = EXPERIMENTS[0];

/** The link to an experiment, relative to the playground page. */
export function experimentHref(id: string) {
  return `?script=${encodeURIComponent(id)}`;
}

/**
 * Looks up a `?script=` value. Links shared before the redesign used file
 * names ("starfield_warp.js", "neon_tunnel_3d.js"); those still resolve.
 */
export function findExperiment(value: string | null | undefined): Experiment | undefined {
  if (!value) return undefined;
  const id = value
    .trim()
    .toLowerCase()
    .replace(/\.js$/, "")
    .replaceAll("_", "-");
  return EXPERIMENTS.find((experiment) => experiment.id === id);
}

/** The experiment `step` places after (or before) the given one, wrapping around. */
export function neighbour(experiment: Experiment, step: 1 | -1): Experiment {
  const index = EXPERIMENTS.indexOf(experiment);
  return EXPERIMENTS[(index + step + EXPERIMENTS.length) % EXPERIMENTS.length];
}
