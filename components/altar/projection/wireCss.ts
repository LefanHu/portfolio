import { STAGE_MS, WIRE_SEGMENT_MS } from "@/lib/altar/projection";
import { THEMES } from "@/lib/altar/theme";

// The wire stage inside the framed site. The parent's stylesheet can't reach
// into the iframe, so this is injected into its <head> (see siteFrame.ts).
//
// Every rule is keyed off an attribute on the frame's <html>, so once the
// projection settles at "filled" the site renders exactly as on its own:
//   data-ap-stage="wire"     text is transparent, tagged boxes draw their
//                            outlines, text blocks show skeleton bars, images
//                            and gradient text are hidden.
//   data-ap-fade             set briefly on entering "filled": everything
//                            fades from the wire look to the real page.
//   data-ap-stage="dissolve" back to outlines and bars (the panel itself fades out).
// The framed site wears the altar's theme (data-theme on its <html>, see
// setFrameTheme), so the wire is drawn in that theme's line colour on the
// site's own sky. While it is framed, at any stage, the site also loses its
// own theme toggle (the altar's is beside the pane, and two would fight) and
// its root scrollbar (the pane scrolls by wheel, see panelScroll.ts).

/** Stages that show the wire layers (outlines, bars); the fade lets them fade out. */
const LAYERS = 'html:where([data-ap-stage="wire"], [data-ap-stage="dissolve"], [data-ap-fade])';
const WIRE = 'html[data-ap-stage="wire"]';
const DISSOLVE = 'html[data-ap-stage="dissolve"]';
const BLANK = 'html:where([data-ap-stage="wire"], [data-ap-stage="dissolve"])';

export const WIRE_CSS = `
@property --ap-bar {
  syntax: "<color>";
  inherits: false;
  initial-value: transparent;
}
html {
  --ap-wire: ${THEMES.dark.projection.line};
  --ap-seg: ${WIRE_SEGMENT_MS}ms;
  --ap-fill: ${STAGE_MS.fill}ms;
  --ap-dissolve: ${STAGE_MS.dissolve}ms;
}
html[data-theme="light"] {
  --ap-wire: ${THEMES.light.projection.line};
}
html[data-ap-stage] {
  scrollbar-width: none;
}
html[data-ap-stage]::-webkit-scrollbar {
  display: none;
}
html[data-ap-stage] [data-theme-toggle] {
  display: none;
}
/* the outline layers overhang their boxes by a pixel: no scrollbars for that (the scroll offsets stay) */
${LAYERS} {
  overflow: hidden;
}

/* Outline-draw layer of wire boxes and images. */
${LAYERS} :is([data-wire="box"], [data-wire="img"])::before {
  content: "";
  position: absolute;
  inset: -1px;
  z-index: 1;
  pointer-events: none;
  border-radius: inherit;
  background:
    linear-gradient(var(--ap-wire), var(--ap-wire)) top left / 100% 1px no-repeat,
    linear-gradient(var(--ap-wire), var(--ap-wire)) top right / 1px 100% no-repeat,
    linear-gradient(var(--ap-wire), var(--ap-wire)) bottom right / 100% 1px no-repeat,
    linear-gradient(var(--ap-wire), var(--ap-wire)) bottom left / 1px 100% no-repeat;
  opacity: 0;
  transition: opacity var(--ap-fill) ease;
}
/* the outline layers anchor to the block; positioned site elements already do */
${LAYERS} :is([data-wire="box"], [data-wire="img"]):not(.absolute, .fixed, .relative, .sticky) {
  position: relative;
}
/* Crossed frame over images. */
${LAYERS} [data-wire="img"]::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(to top right, transparent calc(50% - 0.6px), var(--ap-wire) 50%, transparent calc(50% + 0.6px)),
    linear-gradient(to bottom right, transparent calc(50% - 0.6px), var(--ap-wire) 50%, transparent calc(50% + 0.6px));
  opacity: 0;
  transition: opacity var(--ap-fill) ease;
}
/* Skeleton bars, one per line of text (not gradient-clipped text: the bars would replace its fill). */
${LAYERS} [data-wire="text"]:not([class*="bg-clip-text"]) {
  --ap-bar: transparent;
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0 calc((var(--lh, 1lh) - 0.5em) / 2),
    var(--ap-bar) calc((var(--lh, 1lh) - 0.5em) / 2) calc((var(--lh, 1lh) + 0.5em) / 2),
    transparent calc((var(--lh, 1lh) + 0.5em) / 2) var(--lh, 1lh)
  );
  background-repeat: no-repeat;
  background-size: 100% 100%;
}
/*
 * The fade in and the dissolve are transitions. Zero specificity: unlayered, so
 * it beats Tailwind's layered transition utilities, while the site's own
 * unlayered CSS-module transitions (SlidingCards) still win. Once the fade
 * ends, the site's hover transitions are its own again.
 */
:where(html[data-ap-fade], ${DISSOLVE}) :where(body *, body *::before, body *::after) {
  transition-property: color, border-color, background-color, box-shadow, text-shadow, opacity, --ap-bar;
  transition-duration: var(--ap-fill);
}
${DISSOLVE} body * {
  transition-duration: calc(var(--ap-dissolve) * 0.35);
}

/* wire and dissolve: the page's own paint goes, the wire stays */
${BLANK} body * {
  color: transparent !important;
  text-shadow: none !important;
}
/* list markers the site colours on their own */
${BLANK} body ::marker {
  color: transparent !important;
}
${WIRE} body * {
  border-color: transparent !important;
  box-shadow: none !important;
}
/* the site's sticky header keeps its backing: what has scrolled beneath it stays hidden, as on the settled page */
${WIRE} body :not([data-site-header]) {
  background-color: transparent !important;
}
/* pictures and icons have no text color to blank; gradient-clipped text keeps its fill */
${BLANK} body :is(img, svg, canvas, video, [class*="bg-clip-text"]),
${BLANK} [data-wire="img"] > * {
  opacity: 0;
}
${WIRE} :is([data-wire="box"], [data-wire="img"])::before {
  opacity: 0.9;
  animation: ap-draw var(--ap-seg) cubic-bezier(0.55, 0, 0.3, 1) var(--wd, 0ms) both;
}
${WIRE} [data-wire="img"]::after {
  opacity: 0.55;
  animation: ap-fade-in var(--ap-seg) ease var(--wd, 0ms) both;
}
${WIRE} [data-wire="text"] {
  --ap-bar: color-mix(in srgb, var(--ap-wire) 34%, transparent);
  animation: ap-bar var(--ap-seg) cubic-bezier(0.55, 0, 0.3, 1) var(--wd, 0ms) both;
}
${DISSOLVE} :is([data-wire="box"], [data-wire="img"])::before {
  opacity: 0.8;
}
${DISSOLVE} [data-wire="text"] {
  --ap-bar: color-mix(in srgb, var(--ap-wire) 30%, transparent);
}

@keyframes ap-draw {
  from {
    background-size: 0 1px, 1px 0, 0 1px, 1px 0;
  }
  to {
    background-size: 100% 1px, 1px 100%, 100% 1px, 1px 100%;
  }
}
@keyframes ap-bar {
  from {
    background-size: 0% 100%;
  }
  to {
    background-size: 100% 100%;
  }
}
@keyframes ap-fade-in {
  from {
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  html[data-ap-stage] *,
  html[data-ap-stage] *::before,
  html[data-ap-stage] *::after {
    animation-duration: 1ms !important;
    animation-delay: 0ms !important;
    animation-iteration-count: 1 !important;
  }
}
`;
