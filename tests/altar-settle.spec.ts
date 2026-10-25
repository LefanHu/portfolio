import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSettleScheduler } from "@/lib/altar/settle";
import { SETTLE_MS, createAltarStore } from "@/lib/altar/store";

describe("createSettleScheduler", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("evaluates SETTLE_MS after the last contents change", () => {
    const store = createAltarStore();
    const disconnect = createSettleScheduler(store).connect();
    store.getState().itemEntered("driveUnit");
    vi.advanceTimersByTime(SETTLE_MS - 50);
    store.getState().itemEntered("keyboard");
    vi.advanceTimersByTime(SETTLE_MS - 1);
    expect(store.getState().phase).toBe("idle");
    vi.advanceTimersByTime(1);
    expect(store.getState().phase).toBe("revealing");
    expect(store.getState().activeSection).toBe("experience");
    disconnect();
  });

  it("ejects a wrong pair once settled", () => {
    const store = createAltarStore();
    const disconnect = createSettleScheduler(store).connect();
    store.getState().itemEntered("coffeeMug");
    store.getState().itemEntered("serverRack");
    vi.advanceTimersByTime(SETTLE_MS);
    expect(store.getState().contents).toEqual([]);
    expect(store.getState().ejectNonce).toBe(1);
    disconnect();
  });

  it("does nothing when contents empty out before settling", () => {
    const store = createAltarStore();
    const evaluate = vi.spyOn(store.getState(), "evaluate");
    const disconnect = createSettleScheduler(store).connect();
    store.getState().itemEntered("coffeeMug");
    store.getState().itemLeft("coffeeMug");
    vi.advanceTimersByTime(SETTLE_MS * 2);
    expect(evaluate).not.toHaveBeenCalled();
    disconnect();
  });

  it("cancels when the phase leaves idle", () => {
    const store = createAltarStore();
    const disconnect = createSettleScheduler(store).connect();
    store.getState().itemEntered("coffeeMug");
    store.getState().openSection("contact");
    const ejectNonce = store.getState().ejectNonce;
    vi.advanceTimersByTime(SETTLE_MS * 2);
    expect(store.getState().phase).toBe("revealing");
    expect(store.getState().ejectNonce).toBe(ejectNonce);
    disconnect();
  });

  it("stops after disconnect", () => {
    const store = createAltarStore();
    const disconnect = createSettleScheduler(store).connect();
    store.getState().itemEntered("driveUnit");
    store.getState().itemEntered("keyboard");
    disconnect();
    vi.advanceTimersByTime(SETTLE_MS * 2);
    expect(store.getState().phase).toBe("idle");
  });

  it("re-arms when summoning ends without a contents change", () => {
    const store = createAltarStore();
    const disconnect = createSettleScheduler(store).connect();
    store.getState().itemEntered("driveUnit");
    store.getState().itemEntered("keyboard");
    store.getState().summonRecipe("projects");
    vi.advanceTimersByTime(SETTLE_MS * 2);
    expect(store.getState().phase).toBe("idle");
    store.getState().summonDone();
    vi.advanceTimersByTime(SETTLE_MS - 1);
    expect(store.getState().phase).toBe("idle");
    vi.advanceTimersByTime(1);
    expect(store.getState().phase).toBe("revealing");
    expect(store.getState().activeSection).toBe("experience");
    disconnect();
  });
});
