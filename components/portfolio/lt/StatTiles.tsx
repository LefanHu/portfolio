"use client";

import { useInView } from "framer-motion";
import { useRef } from "react";
import Panel from "@/components/ui/Panel";
import type { LTDifficulty } from "@/lib/types/stats/lt";
import AnimatedCounter from "./AnimatedCounter";
import styles from "./lt.module.css";
import { formatCount, formatPercent, type DifficultyStat } from "./profile";

// Colour repeats what the label already says; it is never the only cue.
const TILES: Record<LTDifficulty, { label: string; stroke: string; dot: string }> = {
  All: { label: "Total solved", stroke: "stroke-rune", dot: "bg-rune" },
  Easy: { label: "Easy", stroke: "stroke-ok", dot: "bg-ok" },
  Medium: { label: "Medium", stroke: "stroke-warn", dot: "bg-warn" },
  Hard: { label: "Hard", stroke: "stroke-bad", dot: "bg-bad" },
};

const ORDER: readonly LTDifficulty[] = ["All", "Easy", "Medium", "Hard"];

// A half ring, drawn left to right. Both paths are normalised to a length of 100.
const ARC = "M 7 60 A 53 53 0 0 1 113 60";

const TILE = "flex flex-col items-center bg-pane px-3 py-5 text-center sm:px-6 sm:py-6";
const GAUGE = "relative mt-2 w-full max-w-44";
const GAUGE_SVG = "block h-auto w-full";

/** How much of the difficulty's problem set is solved. */
function Gauge({ percent, stroke, play }: { percent: number | null; stroke: string; play: boolean }) {
  const filled = percent === null ? 0 : Math.min(100, Math.max(0, percent));
  return (
    <svg viewBox="0 0 120 64" aria-hidden="true" focusable="false" className={GAUGE_SVG} fill="none">
      <path d={ARC} pathLength={100} strokeWidth={7} strokeLinecap="round" className="stroke-line" />
      {filled > 0 ? (
        <path
          d={ARC}
          pathLength={100}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={100}
          strokeDashoffset={100 - filled}
          className={`${stroke} ${play ? styles.sweep : ""}`}
        />
      ) : null}
    </svg>
  );
}

/** A text line's worth of placeholder: same line box as the text it stands in for. */
function Line({ text, bar }: { text: string; bar: string }) {
  return (
    <span className={`flex h-[1lh] items-center justify-center ${text}`}>
      <span className={`skeleton block h-[0.7em] ${bar}`} />
    </span>
  );
}

function Tile({ stat, play }: { stat: DifficultyStat; play: boolean }) {
  const tile = TILES[stat.difficulty];
  return (
    <div className={TILE}>
      <dt className="flex items-center gap-2 text-sm font-medium text-ink">
        <span aria-hidden="true" className={`h-2 w-2 rounded-full ${tile.dot}`} />
        {tile.label}
      </dt>
      <dd className={GAUGE}>
        <Gauge
          percent={stat.total === null ? null : (stat.solved / stat.total) * 100}
          stroke={tile.stroke}
          play={play}
        />
        <AnimatedCounter
          value={stat.solved}
          play={play}
          className="absolute inset-x-0 bottom-0 font-display text-title font-bold leading-none text-ink lining-nums tabular-nums"
        />
      </dd>
      {stat.total !== null ? (
        <dd className="mt-1 text-xs text-mute lining-nums tabular-nums">of {formatCount(stat.total)}</dd>
      ) : null}
      {stat.beats !== null ? (
        <dd className="mt-1 text-sm text-body lining-nums tabular-nums">beats {formatPercent(stat.beats)}</dd>
      ) : null}
    </div>
  );
}

function TilePlaceholder({ withPercentile }: { withPercentile: boolean }) {
  return (
    <div className={TILE}>
      <Line text="text-sm" bar="w-20" />
      <div className={GAUGE}>
        <div className="skeleton aspect-[120/64] w-full rounded-control" />
      </div>
      <Line text="mt-1 text-xs" bar="w-12" />
      {withPercentile ? <Line text="mt-1 text-sm" bar="w-20" /> : null}
    </div>
  );
}

/**
 * The headline numbers: total solved, then one tile per difficulty. Each arc
 * is solved / available; the percentile is the caption. Without `stats` it
 * renders placeholders of the same size.
 *
 * This is the section's one animated moment: when the numbers arrive and the
 * tiles are on screen, the arcs sweep and the numbers count up, once. The
 * observed element exists while loading too, so "on screen" is already known
 * when the data lands and the reveal starts in the same frame.
 */
export default function StatTiles({ stats }: { stats?: DifficultyStat[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const play = inView && stats !== undefined;

  return (
    <Panel className="overflow-hidden">
      <div ref={ref}>
        {stats ? (
          <dl className="grid grid-cols-2 gap-px bg-line lg:grid-cols-4">
            {stats.map((stat) => (
              <Tile key={stat.difficulty} stat={stat} play={play} />
            ))}
          </dl>
        ) : (
          <div aria-hidden="true" className="grid grid-cols-2 gap-px bg-line lg:grid-cols-4">
            {ORDER.map((difficulty) => (
              <TilePlaceholder key={difficulty} withPercentile={difficulty !== "All"} />
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
}
