import { STAGE_MS, WIRE_SEGMENT_MS, wireDelays } from "@/lib/altar/projection";
import { createWheelScroller } from "./panelScroll";
import { WIRE_CSS } from "./wireCss";
import { openExternalInNewTab, tagWireBlocks } from "./wireTags";

// The live site in the projection: a same-origin iframe the parent reaches
// into on every load. The frame is its own realm, so nothing here uses the
// parent's instanceof checks on its nodes or events.

/** wire: outlines draw in. filled: real content fades in. dissolve: collapses and fades out. */
export type PanelStage = "wire" | "filled" | "dissolve";

const STYLE_ID = "ap-wire";
const ALTAR_PATH = /^\/altar(\/|$)/;

/**
 * How the frame navigates for an in-frame link: replace, so it adds no entry
 * to the parent's session history (Back must leave /altar, not walk dead frame
 * entries). An object so tests can stub it: the frame's Location is unforgeable.
 */
export const frameNavigation = {
  replace(win: Window, href: string) {
    win.location.replace(href);
  },
};

/** Whether `el`'s box is at least partly inside the frame's viewport. */
function onScreen(el: Element, win: Window): boolean {
  const r = el.getBoundingClientRect();
  return r.bottom >= 0 && r.right >= 0 && r.top <= win.innerHeight && r.left <= win.innerWidth;
}

/** The element a wheel over `el` should scroll: its nearest vertical scroller, else the page. */
function scrollerOf(el: Element | null, doc: Document): Element | null {
  const win = doc.defaultView!;
  for (let e = el; e && e !== doc.documentElement && e !== doc.body; e = e.parentElement) {
    if (e.scrollHeight > e.clientHeight && /auto|scroll/.test(win.getComputedStyle(e).overflowY)) return e;
  }
  return doc.scrollingElement;
}

/** Run `fn` in `win`'s next idle period (bounded, so a busy page still gets it). Returns a cancel. */
function whenIdle(win: Window, fn: () => void): () => void {
  if (typeof win.requestIdleCallback !== "function") {
    const id = win.setTimeout(fn, 0);
    return () => win.clearTimeout(id);
  }
  const id = win.requestIdleCallback(fn, { timeout: STAGE_MS.wire / 3 });
  return () => win.cancelIdleCallback(id);
}

/**
 * Tag the blocks on screen for the wire draw-in, staggered in document order
 * (still in the wire stage only). The frame's document started loading as the
 * stage began, so the stagger fits in what is left of it.
 */
function tagOnScreen(doc: Document, win: Window) {
  if (doc.documentElement.dataset.apStage !== "wire") return;
  tagWireBlocks(doc.body, undefined, (el) => onScreen(el, win));
  const blocks = doc.querySelectorAll<HTMLElement>("[data-wire]");
  const left = Math.max(WIRE_SEGMENT_MS, STAGE_MS.wire - win.performance.now());
  const delays = wireDelays(blocks.length, left, WIRE_SEGMENT_MS);
  blocks.forEach((el, i) => el.style.setProperty("--wd", `${Math.round(delays[i])}ms`));
}

/** Run `fn`, then restore the scroll offsets of `el`'s ancestors (in its own document). */
function keepScroll(el: Element, fn: () => void) {
  const saved: [Element, number, number][] = [];
  for (let e = el.parentElement; e; e = e.parentElement) saved.push([e, e.scrollTop, e.scrollLeft]);
  fn();
  for (const [e, top, left] of saved) {
    if (e.scrollTop !== top || e.scrollLeft !== left) e.scrollTo({ top, left, behavior: "instant" });
  }
}

/**
 * Show `stage` in the frame's document. Entering "filled" from the wire look
 * sets data-ap-fade for the fill fade, then clears it so the settled site
 * carries none of the wire rules. Returns a cancel for the pending clear.
 */
export function setFrameStage(doc: Document, stage: PanelStage): () => void {
  const html = doc.documentElement;
  const from = html.dataset.apStage;
  html.dataset.apStage = stage;
  if (stage !== "filled" || !from || from === "filled") {
    delete html.dataset.apFade;
    return () => {};
  }
  html.dataset.apFade = "";
  const id = setTimeout(() => delete html.dataset.apFade, STAGE_MS.fill);
  return () => clearTimeout(id);
}

/**
 * Ready the frame's document: scroll to the anchor, inject the wire styles,
 * show the stage (tagging what is on screen for the wire draw-in), and route
 * its links and Escape. Call once for each document the frame shows (an
 * in-frame navigation is a whole new document), as soon as it is interactive;
 * returns the cleanup for the listeners it added. A document at /altar (the
 * altar itself, which must never nest) is not readied: it calls onEscape.
 *
 * Links: cross-origin http(s) opens in a new tab, /altar returns to the altar
 * (onEscape), other same-origin pages replace the frame's page (no history
 * entry). Modified or non-primary clicks, target="_blank", download, same-page
 * hashes and other schemes (mailto:) are left to the browser.
 */
export function prepareFrame(
  frame: HTMLIFrameElement,
  opts: { anchor: string | null; stage: PanelStage; onEscape(): void },
): () => void {
  const doc = frame.contentDocument;
  const win = frame.contentWindow;
  if (!doc || !win) return () => {};
  if (ALTAR_PATH.test(new URL(doc.URL).pathname)) {
    opts.onEscape();
    return () => {};
  }

  const anchor = opts.anchor ? doc.getElementById(opts.anchor) : null;
  if (anchor) {
    // only the site's own scroller ("nearest"); a browser without that option
    // also scrolls the parent's ancestors of the frame, so those are put back
    const options = { block: "start", behavior: "instant", container: "nearest" } as ScrollIntoViewOptions;
    keepScroll(frame, () => anchor.scrollIntoView(options));
  }

  if (!doc.getElementById(STYLE_ID)) {
    const style = doc.createElement("style");
    style.id = STYLE_ID;
    style.textContent = WIRE_CSS;
    doc.head.append(style);
  }

  const cancelStage = setFrameStage(doc, opts.stage);
  // Tag once the site has hydrated: React flags attributes added before it as
  // mismatches. Hydration keeps the frame busy, so its first idle moment is after.
  const cancelTags = opts.stage === "wire" ? whenIdle(win, () => tagOnScreen(doc, win)) : () => {};

  const origin = new URL(frame.src, location.href).origin;
  const onClick = (e: MouseEvent) => {
    openExternalInNewTab(e, origin);
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    const target = e.target as Element | null;
    const link = typeof target?.closest === "function" ? target.closest("a[href]") : null;
    const href = link?.getAttribute("href");
    if (!link || !href || link.hasAttribute("download")) return;
    if ((link.getAttribute("target") ?? "_self") !== "_self") return;
    let url: URL;
    try {
      url = new URL(href, doc.baseURI);
    } catch {
      return;
    }
    if (url.origin !== origin || (url.protocol !== "http:" && url.protocol !== "https:")) return;
    if (ALTAR_PATH.test(url.pathname)) {
      e.preventDefault();
      opts.onEscape();
      return;
    }
    const here = win.location;
    if (url.hash && url.pathname === here.pathname && url.search === here.search) return;
    // also keeps the site's own handlers (next/link's client navigation) out of it
    e.preventDefault();
    e.stopPropagation();
    frameNavigation.replace(win, url.href);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape" && !e.repeat && !e.defaultPrevented) opts.onEscape();
  };
  // Chrome delivers the wheel to a frame inside the pane's 3D transform but
  // doesn't scroll it (see panelScroll.ts), so the frame scrolls in JS too.
  const scrollers = new Map<Element, ReturnType<typeof createWheelScroller>>();
  const onWheel = (e: WheelEvent) => {
    const box = scrollerOf(e.target as Element | null, doc);
    if (!box) return;
    let wheel = scrollers.get(box);
    if (!wheel) {
      wheel = createWheelScroller(box, (cb) => win.requestAnimationFrame(cb), (id) => win.cancelAnimationFrame(id));
      scrollers.set(box, wheel);
    }
    if (wheel.onWheel(e)) e.preventDefault();
  };
  doc.addEventListener("click", onClick, true);
  win.addEventListener("keydown", onKey);
  win.addEventListener("wheel", onWheel, { passive: false });
  return () => {
    cancelStage();
    cancelTags();
    doc.removeEventListener("click", onClick, true);
    win.removeEventListener("keydown", onKey);
    win.removeEventListener("wheel", onWheel);
    scrollers.forEach((w) => w.dispose());
  };
}
