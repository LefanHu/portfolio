"use client";

import dynamic from "next/dynamic";

const LeetcodeStats = dynamic(
  () => import("@/components/portfolio/LeetcodeStats")
);

const ParticlesBackground = dynamic(
  () => import("@/components/particlesbackground")
);

export default function HomeDeferredSections() {
  return (
    <>
      <LeetcodeStats />
      <ParticlesBackground />
    </>
  );
}
