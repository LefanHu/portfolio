"use client";

import { animate, useIsomorphicLayoutEffect } from "framer-motion";
import { useRef } from "react";
import { formatCount } from "./profile";

/**
 * Length of the data reveal; `.sweep` in lt.module.css uses the same value.
 * Short on purpose: the easing spends its last third within a few counts of
 * the result, and a number that is nearly right should not linger.
 */
export const REVEAL_MS = 500;

// --ease-swift from globals.css, so the numbers and the arcs (CSS) move together.
const EASE_SWIFT = [0.2, 0.8, 0.2, 1] as const;

/**
 * A number that counts up from zero, once, when `play` turns true.
 *
 * React always renders the real value: the count-up only overwrites the text
 * while it runs, so a visitor without the animation (reduced motion, not yet
 * in view, no JavaScript timing) reads the true number, never a placeholder.
 */
export default function AnimatedCounter({
  value,
  play = true,
  className,
}: {
  value: number;
  /** Start the count-up. Keep it false until the number is on screen. */
  play?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const final = formatCount(value);

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element || !play) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Set before the first paint so the true value never flashes ahead of the count-up.
    element.textContent = formatCount(0);
    const controls = animate(0, value, {
      duration: REVEAL_MS / 1000,
      ease: EASE_SWIFT,
      onUpdate(latest) {
        element.textContent = formatCount(Math.round(latest));
      },
      onComplete() {
        element.textContent = final;
      },
    });

    return () => {
      controls.stop();
      element.textContent = final;
    };
  }, [play, value, final]);

  return (
    <span ref={ref} className={className}>
      {final}
    </span>
  );
}
