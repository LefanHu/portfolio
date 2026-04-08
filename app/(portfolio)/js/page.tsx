"use client";

import JSCanvas from "@/components/jsCanvas";
import CrystalLattice3D from "@/components/portfolio/js/CrystalLattice3D";
import NeonTunnel3D from "@/components/portfolio/js/NeonTunnel3D";
import OrbitalNodes3D from "@/components/portfolio/js/OrbitalNodes3D";
import ParticleWave3D from "@/components/portfolio/js/ParticleWave3D";
import VoxelFunctionField3D from "@/components/portfolio/js/VoxelFunctionField3D";
import { WindowIcon } from "@heroicons/react/24/outline";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";

interface AdListEntry {
  title: string;
  description: string;
  file: string;
  icon: React.ElementType;
}

const jsList: AdListEntry[] = [
  {
    title: "balls.js",
    description: "A classic bouncing-ball canvas sketch with playful motion.",
    file: "balls.js",
    icon: WindowIcon,
  },
  {
    title: "hue_effect.js",
    description: "An animated color experiment that shifts hue over time.",
    file: "hue_effect.js",
    icon: WindowIcon,
  },
  {
    title: "starfield_warp.js",
    description: "A hyperspace starfield that rushes toward the viewer.",
    file: "starfield_warp.js",
    icon: WindowIcon,
  },
  {
    title: "matrix_rain.js",
    description: "Digital rain with glowing characters drifting down the screen.",
    file: "matrix_rain.js",
    icon: WindowIcon,
  },
  {
    title: "orbit_trails.js",
    description: "Satellites orbit a center point and leave vivid motion trails.",
    file: "orbit_trails.js",
    icon: WindowIcon,
  },
  {
    title: "lava_lamp.js",
    description: "Soft neon blobs pulse and drift like a retro lava lamp.",
    file: "lava_lamp.js",
    icon: WindowIcon,
  },
  {
    title: "sunset_waves.js",
    description: "Layered sine waves shimmer beneath a warm sunset gradient.",
    file: "sunset_waves.js",
    icon: WindowIcon,
  },
  {
    title: "plasma_field.js",
    description: "A shimmering plasma texture that ripples through warm neon hues.",
    file: "plasma_field.js",
    icon: WindowIcon,
  },
  {
    title: "fireflies.js",
    description: "Dozens of glowing fireflies drift and pulse in the dark.",
    file: "fireflies.js",
    icon: WindowIcon,
  },
  {
    title: "kaleidoscope_lines.js",
    description: "Mirrored linework spins into a live kaleidoscope pattern.",
    file: "kaleidoscope_lines.js",
    icon: WindowIcon,
  },
  {
    title: "tunnel_rings.js",
    description: "Concentric rings surge forward like a luminous tunnel.",
    file: "tunnel_rings.js",
    icon: WindowIcon,
  },
  {
    title: "equalizer_bars.js",
    description: "Fake audio bars bounce with a glossy synthwave backdrop.",
    file: "equalizer_bars.js",
    icon: WindowIcon,
  },
  {
    title: "sort_visualizer.js",
    description: "Animated sorting bars race through classic algorithms.",
    file: "sort_visualizer.js",
    icon: WindowIcon,
  },
  {
    title: "voxel_function_field.js",
    description: "A rotating voxel gyroid, sampled from a famous implicit 3D surface.",
    file: "voxel_function_field.js",
    icon: WindowIcon,
  },
  {
    title: "neon_tunnel_3d.js",
    description: "A glowing tunnel of rings rushing through a dark void.",
    file: "neon_tunnel_3d.js",
    icon: WindowIcon,
  },
  {
    title: "particle_wave_3d.js",
    description: "A responsive wave surface made from hundreds of floating particles.",
    file: "particle_wave_3d.js",
    icon: WindowIcon,
  },
  {
    title: "orbital_nodes_3d.js",
    description: "Colorful nodes orbit a bright core in layered trajectories.",
    file: "orbital_nodes_3d.js",
    icon: WindowIcon,
  },
  {
    title: "crystal_lattice_3d.js",
    description: "A pulsing lattice of crystalline forms in a volumetric grid.",
    file: "crystal_lattice_3d.js",
    icon: WindowIcon,
  },
];

const defaultScript = jsList[0].file;
const threeExperimentScripts = new Set([
  "voxel_function_field.js",
  "neon_tunnel_3d.js",
  "particle_wave_3d.js",
  "orbital_nodes_3d.js",
  "crystal_lattice_3d.js",
]);

const threeExperimentRenderers: Record<string, React.ReactNode> = {
  "voxel_function_field.js": <VoxelFunctionField3D className="min-h-0 flex-1 w-full" />,
  "neon_tunnel_3d.js": <NeonTunnel3D className="min-h-0 flex-1 w-full" />,
  "particle_wave_3d.js": <ParticleWave3D className="min-h-0 flex-1 w-full" />,
  "orbital_nodes_3d.js": <OrbitalNodes3D className="min-h-0 flex-1 w-full" />,
  "crystal_lattice_3d.js": <CrystalLattice3D className="min-h-0 flex-1 w-full" />,
};

function JSPageContent() {
  const searchParams = useSearchParams();
  const [script, setScriptSrc] = useState(defaultScript);

  useEffect(() => {
    const requestedScript = searchParams.get("script");
    const isKnownScript = jsList.some((entry) => entry.file === requestedScript);

    setScriptSrc(isKnownScript && requestedScript ? requestedScript : defaultScript);
  }, [searchParams]);

  function changeScript(file: string) {
    return () => {
      setScriptSrc(file);
    }
  }

  const activeScript = jsList.find((entry) => entry.file === script) ?? jsList[0];
  const usesThreeRenderer = threeExperimentScripts.has(script);

  return (
    <div className="grid h-[calc(100vh-4rem)] grid-cols-4 gap-0 bg-black p-8 box-border">
      <div className="col-span-1 h-full min-h-0 box-border">
        {/* <AdList className="flex-grow-1" entries={jsList} title="JS Experiments" /> */}
        <div className="flex h-full w-full flex-col items-center justify-center gap-y-2">
          <div className="h-full w-full overflow-y-auto rounded-xl border border-gray-200 bg-white py-4 px-2">
            <div className="flex items-center justify-between px-2 text-base font-medium text-gray-700">
              <div>JS Experiments</div>
            </div>
            <div className="mt-4">
              <div className="flex w-full flex-col">
                {jsList.map((entry) => (
                  <button
                    key={entry.file}
                    onClick={changeScript(entry.file)}
                    className={`group flex items-center gap-x-5 rounded-md px-2.5 py-2 transition-all duration-75 ${
                      script === entry.file ? "bg-green-100" : "hover:bg-green-100"
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 items-center rounded-lg text-black ${
                        script === entry.file
                          ? "bg-green-200"
                          : "bg-gray-200 group-hover:bg-green-200"
                      }`}
                    >
                      <span className="tag w-full text-center text-2xl font-medium text-gray-700 group-hover:text-green-900">
                        {React.createElement(entry.icon)}
                      </span>
                    </div>
                    <div className="flex flex-col items-start justify-between font-light text-gray-600">
                      <p className="text-[15px]">{entry.title}</p>
                      <span className="text-xs font-light text-gray-400">{entry.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-3 ml-8 flex min-h-0 flex-col overflow-hidden rounded-xl border-2 border-dashed border-white box-border">
        <div className="border-b border-white/15 bg-white/5 px-4 py-3 text-sm text-gray-300">
          Running <span className="font-semibold text-white">{activeScript.title}</span>
        </div>
        {usesThreeRenderer ? (
          threeExperimentRenderers[script]
        ) : (
          <JSCanvas className="min-h-0 flex-1 w-full" scriptSrc={`/scripts/${script}`} />
        )}
      </div>
    </div>
  );
}

export default function JSPage() {
  return (
    <Suspense fallback={null}>
      <JSPageContent />
    </Suspense>
  );
}
