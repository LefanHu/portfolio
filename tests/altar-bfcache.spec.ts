import { describe, expect, it, vi } from "vitest";
import { onBfcacheRestore, snapToIdle } from "@/components/altar/projection/bfcache";
import { CAMERA_HOME } from "@/lib/altar/layout";
import { createAltarStore } from "@/lib/altar/store";

function viewingStore() {
  const store = createAltarStore("dark");
  store.getState().openSection("projects");
  store.getState().revealDone();
  expect(store.getState().phase).toBe("viewing");
  return store;
}

describe("snapToIdle", () => {
  it("returns a viewing scene to idle at once: camera home, items sent home", () => {
    const store = viewingStore();
    const setLookAt = vi.fn();
    const nonce = store.getState().resetNonce;
    expect(snapToIdle(store, { setLookAt })).toBe(true);
    const s = store.getState();
    expect(s.phase).toBe("idle");
    expect(s.activeSection).toBeNull();
    expect(s.resetNonce).toBe(nonce + 1);
    expect(s.unlocked).toEqual(["projects"]);
    expect(setLookAt).toHaveBeenCalledWith(...CAMERA_HOME.position, ...CAMERA_HOME.target, false);
  });
  it("finishes a reveal or a return too", () => {
    const revealing = createAltarStore("dark");
    revealing.getState().openSection("about");
    expect(snapToIdle(revealing, null)).toBe(true);
    expect(revealing.getState().phase).toBe("idle");

    const returning = viewingStore();
    returning.getState().closeSection();
    expect(snapToIdle(returning, null)).toBe(true);
    expect(returning.getState().phase).toBe("idle");
  });
  it("does nothing when already idle", () => {
    const store = createAltarStore("dark");
    const setLookAt = vi.fn();
    expect(snapToIdle(store, { setLookAt })).toBe(false);
    expect(setLookAt).not.toHaveBeenCalled();
    expect(store.getState().resetNonce).toBe(0);
  });
});

describe("onBfcacheRestore", () => {
  const show = (persisted: boolean) => new PageTransitionEvent("pageshow", { persisted });

  it("fires only for pages restored from the back/forward cache", () => {
    const fn = vi.fn();
    const off = onBfcacheRestore(window, fn);
    window.dispatchEvent(show(false));
    expect(fn).not.toHaveBeenCalled();
    window.dispatchEvent(show(true));
    expect(fn).toHaveBeenCalledTimes(1);
    off();
    window.dispatchEvent(show(true));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
