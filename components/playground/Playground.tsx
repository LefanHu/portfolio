"use client";

import { useEffect } from "react";
import { showExperiment, useScriptParam } from "./ExperimentLink";
import ExperimentPicker from "./ExperimentPicker";
import { DEFAULT_EXPERIMENT, findExperiment } from "./experiments";
import { PLAYGROUND_GRID } from "./layout";
import PlaygroundFallback from "./PlaygroundFallback";
import Stage from "./Stage";

/**
 * The playground: a stage and the list of experiments to put on it. Which one
 * is showing is read from `?script=` and nowhere else, so every state has a
 * link, and a reload or a shared URL lands on the same piece.
 */
export default function Playground() {
  const requested = useScriptParam();
  const found = findExperiment(requested);
  const experiment = found ?? DEFAULT_EXPERIMENT;

  // Keep the address honest: an unknown value is dropped, an old file-name value becomes today's id.
  useEffect(() => {
    if (requested == null || requested === found?.id) return;
    showExperiment(found?.id ?? null);
  }, [requested, found]);

  // The prerendered page cannot know the URL's query; hold the layout until the browser has read it.
  if (requested === undefined) return <PlaygroundFallback />;

  return (
    <div className={PLAYGROUND_GRID}>
      <Stage experiment={experiment} />
      <ExperimentPicker current={experiment} />
      <p role="status" className="sr-only">
        Showing {experiment.title}
      </p>
    </div>
  );
}
