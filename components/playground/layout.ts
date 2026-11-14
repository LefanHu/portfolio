// Shared by the playground and its loading placeholder, so the page does not
// shift when the real thing takes over.

/**
 * The stage is a dark frame in both themes: the experiments paint their own
 * dark backgrounds, and a light surround would glare through every fade.
 */
export const STAGE_BACKGROUND = "#05070f";

/**
 * From lg up: the stage with the list beside it, together as tall as the
 * viewport allows. Below: the stage, then the picker as a row under it.
 * The stage comes first in both, so reading order, tab order and what is on
 * screen always agree.
 */
export const PLAYGROUND_GRID =
  "mt-8 grid gap-4 lg:max-h-208 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-6";

/** The stage's dark frame: 4:3 on small screens, the height the page has left on large ones. */
export const STAGE_FRAME = "aspect-[4/3] max-h-[65svh] w-full lg:aspect-auto lg:max-h-none lg:min-h-88 lg:flex-1";
