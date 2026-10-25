// Wheel scrolling for the projected site. Inside drei's <Html transform>
// (preserve-3d + matrix3d wrappers) Chrome delivers wheel events to the
// scroller but does not scroll it (checked with real CDP input; a plain
// element on the same page scrolls). The same holds for the site's iframe
// there: its document gets the wheel, nothing scrolls. So the frame scrolls
// itself (siteFrame.ts): deltas are normalised, accumulated into a target
// offset and eased toward it per frame.

/** px per line for deltaMode 1 (DOM_DELTA_LINE). */
export const LINE_PX = 16;
/** Easing time constant (s): about 0.25 s to settle, like browser smooth scrolling. */
export const SCROLL_EASE_S = 0.07;

/** The scroll geometry the scroller reads and writes (an HTMLElement satisfies it). */
export interface ScrollBox {
  scrollTop: number;
  scrollLeft: number;
  readonly scrollHeight: number;
  readonly clientHeight: number;
  readonly scrollWidth: number;
  readonly clientWidth: number;
}

type WheelLike = Pick<WheelEvent, "deltaX" | "deltaY" | "deltaMode" | "ctrlKey">;

/** Pixel delta of a wheel event; null for ctrl+wheel (trackpad pinch / zoom), which is not a scroll. */
export function wheelPixels(e: WheelLike, page: { width: number; height: number }): { x: number; y: number } | null {
  if (e.ctrlKey) return null;
  const ux = e.deltaMode === 1 ? LINE_PX : e.deltaMode === 2 ? page.width : 1;
  const uy = e.deltaMode === 1 ? LINE_PX : e.deltaMode === 2 ? page.height : 1;
  return { x: e.deltaX * ux, y: e.deltaY * uy };
}

/** One easing step from `pos` toward `target` over `dt` seconds; snaps within half a pixel. */
export function easeScroll(pos: number, target: number, dt: number): number {
  const next = pos + (target - pos) * (1 - Math.exp(-dt / SCROLL_EASE_S));
  return Math.abs(target - next) < 0.5 ? target : next;
}

const clamp = (v: number, max: number) => Math.min(Math.max(v, 0), Math.max(max, 0));

/**
 * Accumulating, eased wheel scroller for one element. `onWheel` returns whether
 * it took the event (the caller then prevents the default).
 */
export function createWheelScroller(
  el: ScrollBox,
  raf: (cb: FrameRequestCallback) => number = requestAnimationFrame,
  caf: (id: number) => void = cancelAnimationFrame,
) {
  let frame = 0;
  let last: number | null = null;
  const pos = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };

  const step = (t: number) => {
    const dt = last === null ? 1 / 60 : Math.min((t - last) / 1000, 0.1);
    last = t;
    pos.x = easeScroll(pos.x, target.x, dt);
    pos.y = easeScroll(pos.y, target.y, dt);
    el.scrollLeft = pos.x;
    el.scrollTop = pos.y;
    frame = pos.x === target.x && pos.y === target.y ? 0 : raf(step);
  };

  return {
    onWheel(e: WheelLike): boolean {
      const d = wheelPixels(e, { width: el.clientWidth, height: el.clientHeight });
      if (!d) return false;
      if (!frame) {
        // idle: start from wherever the user left it (keyboard, scrollbar, previous gesture)
        pos.x = target.x = el.scrollLeft;
        pos.y = target.y = el.scrollTop;
        last = null;
      }
      // quick notches add up instead of restarting from mid-animation
      target.x = clamp(target.x + d.x, el.scrollWidth - el.clientWidth);
      target.y = clamp(target.y + d.y, el.scrollHeight - el.clientHeight);
      if (!frame) frame = raf(step);
      return true;
    },
    dispose() {
      if (frame) caf(frame);
      frame = 0;
    },
  };
}
