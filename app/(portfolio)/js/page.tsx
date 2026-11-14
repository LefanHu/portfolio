import type { Metadata } from "next";
import Playground from "@/components/playground/Playground";
import { CONTAINER } from "@/components/ui/layout";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "Small visual experiments in canvas and three.js, running live in the browser: a sort visualizer, a starfield, a voxel gyroid and more.",
};

export default function PlaygroundPage() {
  return (
    // From lg up the page is one viewport tall under the header, and the stage takes what the heading leaves.
    <div className={`${CONTAINER} pb-12 pt-10 sm:pt-12 lg:flex lg:min-h-[calc(100dvh_-_var(--nav-h))] lg:flex-col lg:pb-10`}>
      <header className="max-w-2xl">
        <h1 className="rise text-title font-bold tracking-tight">Playground</h1>
        <p className="rise mt-3 text-lead text-mute" style={{ "--i": 1 } as React.CSSProperties}>
          Small visual experiments in canvas and three.js, built for fun.
        </p>
      </header>
      <Playground />
    </div>
  );
}
