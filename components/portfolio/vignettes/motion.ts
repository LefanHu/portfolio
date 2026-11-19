/**
 * Whether the experience vignettes are playing. One switch for all of them:
 * the section's pause button flips it and the engine follows it.
 *
 * It starts paused for a visitor who asks for reduced motion, so they get
 * still figures and can choose to play them. Kept free of three.js so the
 * button can ship with the page while the engine loads later.
 */
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

let paused: boolean | undefined;
const listeners = new Set<() => void>();

function prefersStill() {
  try {
    return window.matchMedia(REDUCED_MOTION).matches;
  } catch {
    return false;
  }
}

export function motionPaused(): boolean {
  if (typeof window === "undefined") return false;
  paused ??= prefersStill();
  return paused;
}

export function setMotionPaused(next: boolean) {
  if (motionPaused() === next) return;
  paused = next;
  for (const listener of listeners) listener();
}

export function subscribeMotion(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
