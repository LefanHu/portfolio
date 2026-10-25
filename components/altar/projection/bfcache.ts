import { CAMERA_HOME } from "@/lib/altar/layout";
import type { AltarState } from "@/lib/altar/store";

// Links inside a projection navigate the site's frame, not the page (see
// siteFrame.ts), but the page can still be left mid-view (the address bar, a
// link outside the frame). Browser Back can then restore /altar from the
// back/forward cache with the JS heap intact, i.e. still in "viewing" with the
// camera at the close-up. The brief wants Back to land in idle, so a restored
// page snaps straight there.

/**
 * Put the scene in idle at once: closeSection() (sends the items home via
 * resetNonce), camera to CAMERA_HOME without a transition, returnDone().
 * Projection hides the pane when the phase reaches idle, and CameraRig restores
 * orbit input and limits. Returns whether anything changed.
 */
export function snapToIdle(
  store: { getState(): AltarState },
  controls: { setLookAt(...args: [number, number, number, number, number, number, boolean]): unknown } | null,
): boolean {
  const s = store.getState();
  if (s.phase === "idle") return false;
  if (s.phase === "revealing" || s.phase === "viewing") s.closeSection();
  controls?.setLookAt(...CAMERA_HOME.position, ...CAMERA_HOME.target, false);
  store.getState().returnDone();
  return true;
}

/** Call `fn` whenever the page is restored from the back/forward cache. Returns the unsubscribe. */
export function onBfcacheRestore(target: Window, fn: () => void): () => void {
  const onShow = (e: PageTransitionEvent) => {
    if (e.persisted) fn();
  };
  target.addEventListener("pageshow", onShow);
  return () => target.removeEventListener("pageshow", onShow);
}
