"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useId, useRef, useState, type ComponentType, type ReactNode } from "react";
import type { SceneProps } from "@/components/portfolio/js/SceneCanvas";
import { ArrowLeftIcon, ArrowRightIcon, PauseIcon, PlayIcon, RestartIcon } from "@/components/ui/icons";
import { PANEL } from "@/components/ui/Panel";
import ExperimentLink from "./ExperimentLink";
import { EXPERIMENTS, neighbour, type Experiment, type SceneName } from "./experiments";
import { useDocumentVisible, useFullscreen, useInView, usePrefersReducedMotion } from "./hooks";
import { CodeIcon, ExitFullscreenIcon, FullscreenIcon } from "./icons";
import { STAGE_BACKGROUND, STAGE_FRAME } from "./layout";
import ScriptRunner from "./ScriptRunner";

// The three.js scenes load on demand, so the canvas scripts never ship three.
const SCENES: Record<SceneName, ComponentType<SceneProps>> = {
  VoxelFunctionField3D: dynamic(() => import("@/components/portfolio/js/VoxelFunctionField3D"), { ssr: false }),
  NeonTunnel3D: dynamic(() => import("@/components/portfolio/js/NeonTunnel3D"), { ssr: false }),
  ParticleWave3D: dynamic(() => import("@/components/portfolio/js/ParticleWave3D"), { ssr: false }),
  OrbitalNodes3D: dynamic(() => import("@/components/portfolio/js/OrbitalNodes3D"), { ssr: false }),
  CrystalLattice3D: dynamic(() => import("@/components/portfolio/js/CrystalLattice3D"), { ssr: false }),
};

// Text on the stage's fixed dark background (see STAGE_BACKGROUND), so it does not follow the theme either.
const STAGE_INK = "#c9d6f0";

/** How long a new experiment takes to fade in over the one before it. */
const FADE_MS = 200;

const CONTROL =
  "inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-control px-2.5 text-sm font-medium text-body no-underline hover:bg-rune-wash hover:text-rune focus-visible:bg-rune-wash focus-visible:text-rune";

function Runner({
  experiment,
  running,
  onReady,
}: {
  experiment: Experiment;
  running: boolean;
  onReady: () => void;
}) {
  if (experiment.kind === "script") {
    return (
      <ScriptRunner
        className="block h-full w-full border-0"
        scriptSrc={`/scripts/${experiment.file}`}
        title={`${experiment.title}: canvas experiment`}
        running={running}
        onReady={onReady}
      />
    );
  }
  const Scene = SCENES[experiment.scene];
  return <Scene className="h-full w-full" paused={!running} onReady={onReady} />;
}

/** A scene that cannot start (no WebGL, a lost context) says so instead of taking the page down. */
class RunnerBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <p className="flex h-full items-center justify-center px-6 text-center text-sm" style={{ color: STAGE_INK }}>
        This experiment could not start here. The 3D pieces need WebGL, which may be switched off in this
        browser.
      </p>
    );
  }
}

interface Layer {
  key: string;
  experiment: Experiment;
  /** Loaded and drawing, so it may be shown. */
  ready: boolean;
}

/**
 * What is on the stage, bottom to top. A new experiment (or a restart) is
 * added on top, invisible, while the previous one stays in view; once the
 * newcomer reports ready it fades in over the old one, which is then removed.
 * That is the cross-fade, and it is why a slow-loading scene never leaves an
 * empty frame.
 */
function useLayers(experiment: Experiment, restarts: number) {
  const key = `${experiment.id}:${restarts}`;
  const [layers, setLayers] = useState<Layer[]>(() => [{ key, experiment, ready: false }]);

  if (layers[layers.length - 1].key !== key) {
    // Layers that never became ready were never seen; a quick series of picks keeps at most three alive.
    setLayers([...layers.filter((layer) => layer.ready).slice(-2), { key, experiment, ready: false }]);
  }

  const top = layers[layers.length - 1];
  const covered = top.ready && layers.length > 1;

  useEffect(() => {
    if (!covered) return;
    const timer = setTimeout(() => {
      setLayers((current) => current.slice(current.findIndex((layer) => layer.key === top.key)));
    }, FADE_MS + 50);
    return () => clearTimeout(timer);
  }, [covered, top.key]);

  const markReady = useCallback((readyKey: string) => {
    setLayers((current) =>
      current.map((layer) => (layer.key === readyKey && !layer.ready ? { ...layer, ready: true } : layer)),
    );
  }, []);

  return { layers, top, markReady };
}

/**
 * The stage: the running experiment in a dark frame, with themed chrome around
 * it. Above: what it is and the way to its neighbours. Below: its transport
 * controls, how to interact with it, its source.
 */
export default function Stage({ experiment }: { experiment: Experiment }) {
  const stage = useRef<HTMLElement>(null);
  const titleId = useId();
  const [restarts, setRestarts] = useState(0);
  // The visitor's own choice; until they make one, motion follows their system setting.
  const [choice, setChoice] = useState<boolean | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const documentVisible = useDocumentVisible();
  const inView = useInView(stage);
  const fullscreen = useFullscreen(stage);
  const { layers, top, markReady } = useLayers(experiment, restarts);

  const playing = choice ?? !reducedMotion;
  // Nothing animates for nobody: not in a background tab, not scrolled out of view.
  const running = playing && documentVisible && inView;

  const index = EXPERIMENTS.indexOf(experiment);
  const previous = neighbour(experiment, -1);
  const next = neighbour(experiment, 1);

  const note = playing
    ? (experiment.hint ?? "Runs by itself")
    : choice === null
      ? "Paused for reduced motion. Press play to run it."
      : "Paused";

  return (
    <section
      ref={stage}
      aria-labelledby={titleId}
      className={`${PANEL} flex min-w-0 flex-col overflow-hidden [&:fullscreen]:rounded-none [&:fullscreen]:border-0`}
    >
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 px-4 pb-3 pt-2.5 sm:px-5">
        <h2 id={titleId} className="text-heading font-bold">
          {experiment.title}
        </h2>
        <div className="-mr-2 flex items-center">
          <ExperimentLink id={previous.id} className={CONTROL} aria-label={`Previous experiment: ${previous.title}`}>
            <ArrowLeftIcon />
          </ExperimentLink>
          {/* Spelled out for screen readers; the figures alone need the room a phone does not have. */}
          <p className="text-center text-sm tabular-nums text-mute sm:min-w-13">
            <span aria-hidden="true" className="hidden sm:inline">
              {index + 1} / {EXPERIMENTS.length}
            </span>
            <span className="sr-only">
              Experiment {index + 1} of {EXPERIMENTS.length}
            </span>
          </p>
          <ExperimentLink id={next.id} className={CONTROL} aria-label={`Next experiment: ${next.title}`}>
            <ArrowRightIcon />
          </ExperimentLink>
        </div>
        {/* On a phone the text wraps and the picker sits right below: two lines are reserved so it stays put from one piece to the next. */}
        <p className="col-span-2 min-h-[3em] text-sm text-body sm:min-h-0">{experiment.description}</p>
      </header>

      <div
        aria-busy={!top.ready}
        className={`relative isolate overflow-hidden border-y border-line ${
          fullscreen.active ? "min-h-0 flex-1" : STAGE_FRAME
        }`}
        style={{ backgroundColor: STAGE_BACKGROUND }}
      >
        {layers.map((layer) => {
          const isTop = layer === top;
          return (
            // Animated from script rather than a CSS transition: a piece that is ready within a frame of
            // mounting has never been painted transparent, and a transition would skip straight to the end.
            <motion.div
              key={layer.key}
              inert={!isTop}
              aria-hidden={!isTop}
              initial={{ opacity: 0 }}
              animate={{ opacity: layer.ready ? 1 : 0 }}
              transition={{ duration: reducedMotion ? 0 : FADE_MS / 1000, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <RunnerBoundary onError={() => markReady(layer.key)}>
                <Runner
                  experiment={layer.experiment}
                  // The outgoing piece keeps moving until its replacement is ready to cover it.
                  running={running && (isTop || !top.ready)}
                  onReady={() => markReady(layer.key)}
                />
              </RunnerBoundary>
            </motion.div>
          );
        })}
        {top.ready ? null : (
          // Delayed, so a piece that loads at once never flashes a spinner.
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex animate-rise items-center justify-center [animation-delay:250ms]"
          >
            <p
              className="inline-flex items-center gap-2.5 rounded-control px-3.5 py-2 text-sm font-medium"
              style={{ color: STAGE_INK, backgroundColor: STAGE_BACKGROUND }}
            >
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
              Loading {top.experiment.title}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-1 px-2 py-1.5 sm:px-3">
        <button
          type="button"
          onClick={() => setChoice(!playing)}
          aria-label={playing ? "Pause" : "Play"}
          title={playing ? "Pause" : "Play"}
          className={CONTROL}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          type="button"
          onClick={() => setRestarts((count) => count + 1)}
          aria-label="Restart"
          title="Restart"
          className={CONTROL}
        >
          <RestartIcon />
        </button>
        <p className="order-first basis-full px-2 pb-1 pt-1.5 text-sm text-mute sm:order-none sm:min-w-0 sm:flex-1 sm:basis-0 sm:py-0">
          {note}
        </p>
        <div className="ml-auto flex items-center gap-x-1">
          {experiment.kind === "script" ? (
            <a
              href={`/scripts/${experiment.file}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View source: ${experiment.file} (opens in a new tab)`}
              title="View source"
              className={CONTROL}
            >
              <CodeIcon />
              <span className="sm:hidden">Source</span>
              <span className="hidden font-mono text-xs sm:inline">{experiment.file}</span>
            </a>
          ) : (
            <p className="hidden px-2.5 font-mono text-xs text-mute sm:block">{experiment.file}</p>
          )}
          {fullscreen.supported ? (
            <button
              type="button"
              onClick={fullscreen.toggle}
              aria-label={fullscreen.active ? "Exit fullscreen" : "Enter fullscreen"}
              title={fullscreen.active ? "Exit fullscreen" : "Enter fullscreen"}
              className={CONTROL}
            >
              {fullscreen.active ? <ExitFullscreenIcon /> : <FullscreenIcon />}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
