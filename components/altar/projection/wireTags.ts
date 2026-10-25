import type { MouseEvent as ReactMouseEvent } from "react";

/** Wire blocks get a staggered line-draw each, so the draw-in stays bounded on long sections. */
export const MAX_WIRE_BLOCKS = 80;

const TEXT = "h1, h2, h3, h4, p, dt, dd";
const BOX = "article, section, a, li";

/**
 * Marks what the wire stage draws in a rendered main-site section: "text"
 * skeleton bars, "box" outlines, and "img" crossed frames. Walks `root` in
 * document order and returns how many blocks it newly tagged (stops at `max`).
 * Anything left untagged simply fades in at "filled".
 *
 * The site's components carry no wire markup, so this infers it: headings and
 * paragraphs are text; cards (rounded/bordered classes, plus article, section,
 * a, li) are boxes. An <img> can't take pseudo-elements, so its parent is the
 * "img" block, and only when the img is that parent's sole element child.
 */
export function tagWireBlocks(root: HTMLElement, max = MAX_WIRE_BLOCKS): number {
  let count = 0;
  for (const el of root.querySelectorAll<HTMLElement>("*")) {
    if (count >= max) break;
    if (el.hasAttribute("data-wire")) continue;
    const inText = el.parentElement?.closest('[data-wire="text"]');
    if (inText && root.contains(inText)) continue;

    let kind: "text" | "box" | "img" | null = null;
    if (el.matches(TEXT)) kind = "text";
    else if (el.childElementCount === 1 && el.firstElementChild instanceof HTMLImageElement) kind = "img";
    // an <img> itself can't draw outlines (no pseudo-elements): only its wrapper is a block
    else if (!(el instanceof HTMLImageElement) && (el.matches(BOX) || /rounded|border/.test(el.getAttribute("class") ?? ""))) {
      kind = "box";
    }
    if (!kind) continue;
    el.setAttribute("data-wire", kind);
    count++;
  }
  return count;
}

/**
 * Delegated link handling for the projected pages: the altar is one
 * experience, so external links open in a new tab. Internal links and
 * mailto: are left alone. Attach as a capture handler on the panel root.
 */
export function openExternalInNewTab(e: MouseEvent | ReactMouseEvent, origin: string = location.origin): void {
  const target = e.target;
  if (!(target instanceof Element)) return;
  const href = target.closest("a[href]")?.getAttribute("href");
  if (!href) return;
  let url: URL;
  try {
    url = new URL(href, origin);
  } catch {
    return;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return;
  if (url.origin === origin) return;
  e.preventDefault();
  window.open(url.href, "_blank", "noopener,noreferrer");
}
