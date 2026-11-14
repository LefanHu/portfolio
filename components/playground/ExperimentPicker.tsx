"use client";

import { MotionConfig, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { PANEL } from "@/components/ui/Panel";
import Tag from "@/components/ui/Tag";
import ExperimentLink from "./ExperimentLink";
import { EXPERIMENTS, type Experiment } from "./experiments";
import { useScrollEdges } from "./hooks";

/** Room kept between the current item and the edge of the list, so its neighbour shows. */
const REVEAL_MARGIN = 40;

/** How far to scroll along one axis to bring [start, end] inside [frameStart, frameEnd]. */
function distanceIntoView(start: number, end: number, frameStart: number, frameEnd: number) {
  const margin = Math.max(0, Math.min(REVEAL_MARGIN, (frameEnd - frameStart - (end - start)) / 2));
  if (start < frameStart + margin) return start - frameStart - margin;
  if (end > frameEnd - margin) return end - frameEnd + margin;
  return 0;
}

const EDGE_FADE = "pointer-events-none absolute from-pane to-transparent transition-opacity duration-200 ease-swift";

/**
 * Every experiment, as links. A column beside the stage from lg up; below that
 * a row under the stage that scrolls sideways, so the stage and the choice
 * stay on one screen and a tap shows its result without scrolling back up.
 */
export default function ExperimentPicker({ current }: { current: Experiment }) {
  const scroller = useRef<HTMLDivElement>(null);
  const edges = useScrollEdges(scroller);

  // The choice can come from elsewhere (the stage's arrows, a shared link): bring it into view.
  // Only the list scrolls; `scrollIntoView` would move the page as well.
  useEffect(() => {
    const list = scroller.current;
    const item = list?.querySelector('[aria-current="true"]');
    if (!list || !item) return;
    const frame = list.getBoundingClientRect();
    const box = item.getBoundingClientRect();
    const left = distanceIntoView(box.left, box.right, frame.left, frame.right);
    const top = distanceIntoView(box.top, box.bottom, frame.top, frame.bottom);
    if (left === 0 && top === 0) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollBy({ left, top, behavior: reduced ? "auto" : "smooth" });
  }, [current.id]);

  return (
    // Size containment (lg): the list takes the stage's height and scrolls inside it, instead of stretching the row.
    <nav aria-label="Experiments" className={`${PANEL} relative min-w-0 overflow-hidden lg:[contain:size]`}>
      <MotionConfig reducedMotion="user">
        <motion.div
          ref={scroller}
          // Lets the sliding marker account for the list's scroll position.
          layoutScroll
          className="snap-x snap-mandatory scroll-px-2 overflow-x-auto overscroll-x-contain lg:h-full lg:snap-none lg:overflow-y-auto lg:overflow-x-hidden lg:overscroll-y-contain"
        >
          <ul className="flex w-max gap-1 p-2 lg:w-auto lg:flex-col">
            {EXPERIMENTS.map((experiment) => {
              const isCurrent = experiment === current;
              return (
                <li key={experiment.id} className="snap-start">
                  <ExperimentLink
                    id={experiment.id}
                    aria-current={isCurrent ? "true" : undefined}
                    className="group relative flex min-h-11 items-center rounded-control px-3 py-2 text-body no-underline hover:bg-rune-wash hover:text-ink focus-visible:bg-rune-wash focus-visible:text-ink aria-[current]:bg-rune-wash aria-[current]:text-ink lg:items-start lg:py-2.5 lg:pl-4"
                  >
                    {isCurrent ? (
                      // One marker shared by all items: it slides from the last choice to this one.
                      <motion.span
                        layoutId="playground-current"
                        aria-hidden="true"
                        transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
                        className="absolute bottom-0 left-3 right-3 h-0.75 rounded-full bg-rune lg:bottom-2 lg:left-0 lg:right-auto lg:top-2 lg:h-auto lg:w-1"
                      />
                    ) : null}
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 whitespace-nowrap text-sm font-medium group-aria-[current]:font-bold">
                        {experiment.title}
                        {experiment.kind === "scene" ? <Tag>3D</Tag> : null}
                      </span>
                      <span className="mt-0.5 hidden text-xs text-mute lg:block">{experiment.description}</span>
                    </span>
                  </ExperimentLink>
                </li>
              );
            })}
          </ul>
        </motion.div>
      </MotionConfig>
      {/* Scroll cues: a fade on whichever side has more of the list. */}
      <span
        aria-hidden="true"
        className={`${EDGE_FADE} left-0 top-0 h-full w-10 bg-linear-to-r lg:h-12 lg:w-full lg:bg-linear-to-b ${
          edges.before ? "opacity-100" : "opacity-0"
        }`}
      />
      <span
        aria-hidden="true"
        className={`${EDGE_FADE} bottom-0 right-0 h-full w-10 bg-linear-to-l lg:h-12 lg:w-full lg:bg-linear-to-t ${
          edges.after ? "opacity-100" : "opacity-0"
        }`}
      />
    </nav>
  );
}
