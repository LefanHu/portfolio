/**
 * One line under each role's vignette saying what the animation shows. Keyed
 * by the role's id in lib/portfolio/experience.ts; a role with a caption here
 * gets a figure on its card, and scenes/index.ts must have a scene for it.
 *
 * Kept apart from the scenes so the server can render the captions without
 * pulling three.js into the page.
 */
export const VIGNETTE_CAPTIONS = {
  "aven-financial": "Blueprint for now: starts May 2027",
  atoms: "Blueprint for now: starts January 2027",
  "capital-one": "A Figma frame rebuilt as an Astro page, block by block",
  "amazon-robotics": "Drive units carrying pods along planned routes",
  adentro: "Monitoring sweeps a cluster and catches a failing service",
  ciena: "Device logs merged into one stream, with errors picked out",
  telus: "Service calls dispatched to field technicians",
} as const;

export type VignetteId = keyof typeof VIGNETTE_CAPTIONS;

export function isVignetteId(id: string): id is VignetteId {
  return Object.hasOwn(VIGNETTE_CAPTIONS, id);
}
