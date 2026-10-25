import { describe, expect, it } from "vitest";
import {
  LINE_PX,
  createWheelScroller,
  easeScroll,
  wheelPixels,
  type ScrollBox,
} from "@/components/altar/projection/panelScroll";

const page = { width: 900, height: 500 };
const wheel = (o: Partial<WheelEvent>) =>
  ({ deltaX: 0, deltaY: 0, deltaMode: 0, ctrlKey: false, ...o }) as WheelEvent;

function box(over: Partial<ScrollBox> = {}): ScrollBox {
  return { scrollTop: 0, scrollLeft: 0, scrollHeight: 2000, clientHeight: 500, scrollWidth: 900, clientWidth: 900, ...over };
}

/** Manual rAF: run() steps 16 ms frames until nothing is scheduled. */
function frames() {
  let queue: FrameRequestCallback[] = [];
  let t = 1000;
  let id = 0;
  return {
    raf: (cb: FrameRequestCallback) => {
      queue.push(cb);
      return ++id;
    },
    caf: () => {
      queue = [];
    },
    pending: () => queue.length,
    step() {
      const q = queue;
      queue = [];
      t += 16;
      q.forEach((cb) => cb(t));
    },
    run(max = 500) {
      for (let i = 0; i < max && queue.length; i++) this.step();
    },
  };
}

describe("wheelPixels", () => {
  it("passes pixel deltas through, both axes", () => {
    expect(wheelPixels(wheel({ deltaX: 7, deltaY: 120 }), page)).toEqual({ x: 7, y: 120 });
  });
  it("converts line mode to px", () => {
    expect(wheelPixels(wheel({ deltaY: 3, deltaMode: 1 }), page)).toEqual({ x: 0, y: 3 * LINE_PX });
  });
  it("converts page mode to the visible size", () => {
    expect(wheelPixels(wheel({ deltaX: -1, deltaY: 1, deltaMode: 2 }), page)).toEqual({ x: -900, y: 500 });
  });
  it("ignores ctrl+wheel (pinch zoom)", () => {
    expect(wheelPixels(wheel({ deltaY: 50, ctrlKey: true }), page)).toBeNull();
  });
});

describe("easeScroll", () => {
  it("moves part of the way and snaps when within half a pixel", () => {
    const next = easeScroll(0, 100, 1 / 60);
    expect(next).toBeGreaterThan(0);
    expect(next).toBeLessThan(100);
    expect(easeScroll(99.7, 100, 1 / 60)).toBe(100);
  });
});

describe("createWheelScroller", () => {
  it("accumulates quick notches: two events scroll the sum", () => {
    const el = box();
    const f = frames();
    const s = createWheelScroller(el, f.raf, f.caf);
    expect(s.onWheel(wheel({ deltaY: 100 }))).toBe(true);
    f.step(); // mid-animation
    expect(el.scrollTop).toBeGreaterThan(0);
    expect(el.scrollTop).toBeLessThan(100);
    expect(s.onWheel(wheel({ deltaY: 100 }))).toBe(true);
    f.run();
    expect(el.scrollTop).toBe(200);
    expect(f.pending()).toBe(0);
  });
  it("eases instead of jumping", () => {
    const el = box();
    const f = frames();
    createWheelScroller(el, f.raf, f.caf).onWheel(wheel({ deltaY: 300 }));
    f.step();
    expect(el.scrollTop).toBeLessThan(300);
  });
  it("clamps to the scroll range on both axes", () => {
    const el = box({ scrollWidth: 1000 });
    const f = frames();
    const s = createWheelScroller(el, f.raf, f.caf);
    s.onWheel(wheel({ deltaY: 5000, deltaX: 500 }));
    f.run();
    expect(el.scrollTop).toBe(1500);
    expect(el.scrollLeft).toBe(100);
    s.onWheel(wheel({ deltaY: -9000 }));
    f.run();
    expect(el.scrollTop).toBe(0);
  });
  it("handles line and page deltas", () => {
    const el = box();
    const f = frames();
    const s = createWheelScroller(el, f.raf, f.caf);
    s.onWheel(wheel({ deltaY: 3, deltaMode: 1 }));
    f.run();
    expect(el.scrollTop).toBe(48);
    s.onWheel(wheel({ deltaY: 1, deltaMode: 2 }));
    f.run();
    expect(el.scrollTop).toBe(548);
  });
  it("leaves ctrl+wheel alone", () => {
    const el = box();
    const f = frames();
    expect(createWheelScroller(el, f.raf, f.caf).onWheel(wheel({ deltaY: 100, ctrlKey: true }))).toBe(false);
    expect(f.pending()).toBe(0);
    expect(el.scrollTop).toBe(0);
  });
  it("starts from where the user left it (keyboard or scrollbar)", () => {
    const el = box();
    const f = frames();
    const s = createWheelScroller(el, f.raf, f.caf);
    el.scrollTop = 400;
    s.onWheel(wheel({ deltaY: 100 }));
    f.run();
    expect(el.scrollTop).toBe(500);
  });
  it("dispose cancels a running animation", () => {
    const el = box();
    const f = frames();
    const s = createWheelScroller(el, f.raf, f.caf);
    s.onWheel(wheel({ deltaY: 100 }));
    s.dispose();
    expect(f.pending()).toBe(0);
  });
});
