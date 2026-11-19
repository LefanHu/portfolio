"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { VignetteId } from "./captions";
import type { Mounted } from "./engine";
import styles from "./Vignette.module.css";

/** Load the engine when a figure is within this distance of the viewport. */
const LOAD_MARGIN = "600px";

/**
 * A role's animated figure: a small three.js scene about the work, with a
 * caption saying what it shows. The picture is decoration; the caption and
 * the card's highlights carry the meaning.
 *
 * three.js and the scenes arrive in a file of their own as the first figure
 * nears the viewport. Until a frame is drawn the stage is an empty panel of
 * the same size, so nothing moves when it appears. If WebGL is missing or the
 * file does not arrive, the figure removes itself and the card is as it was.
 */
export default function Vignette({ id, caption, className = "" }: { id: VignetteId; caption: string; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mounted = useRef<Mounted | null>(null);
  const [state, setState] = useState<"waiting" | "live" | "off">("waiting");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;

    const near = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        near.disconnect();
        import("./engine")
          .then(({ mountVignette }) => {
            if (cancelled) return;
            mounted.current = mountVignette(canvas, id, () => setState("live"));
            if (!mounted.current) setState("off");
          })
          .catch(() => {
            if (!cancelled) setState("off");
          });
      },
      { rootMargin: LOAD_MARGIN },
    );
    near.observe(canvas);

    return () => {
      cancelled = true;
      near.disconnect();
      mounted.current?.unmount();
      mounted.current = null;
    };
  }, [id]);

  // A mouse over the figure swings the camera a little; touch scrolls the page as usual.
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    mounted.current?.point({
      x: ((event.clientX - box.left) / box.width) * 2 - 1,
      y: ((event.clientY - box.top) / box.height) * 2 - 1,
    });
  };

  return (
    <figure className={`${styles.figure} ${className}`} data-state={state} data-vignette={id}>
      <div
        className={`${styles.stage} rounded-control border border-line bg-pane-raise`}
        onPointerMove={onPointerMove}
        onPointerLeave={() => mounted.current?.point(null)}
      >
        <canvas ref={canvasRef} aria-hidden="true" className={styles.canvas} />
      </div>
      <figcaption className="mt-2 text-xs text-mute">{caption}</figcaption>
    </figure>
  );
}
