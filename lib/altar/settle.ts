import { SETTLE_MS, type AltarState } from "./store";

type StoreLike = {
  getState(): AltarState;
  subscribe(listener: (s: AltarState, prev: AltarState) => void): () => void;
};

/**
 * Debounced evaluation: `evaluate()` runs `ms` after the last change to the
 * cauldron's contents, while the phase is idle and something is inside.
 */
export function createSettleScheduler(store: StoreLike, ms = SETTLE_MS) {
  return {
    connect(): () => void {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const unsub = store.subscribe((s, prev) => {
        if (s.contents === prev.contents && s.phase === prev.phase) return;
        clearTimeout(timer);
        timer = undefined;
        if (s.phase === "idle" && s.contents.length > 0) {
          timer = setTimeout(() => store.getState().evaluate(), ms);
        }
      });
      return () => {
        unsub();
        clearTimeout(timer);
      };
    },
  };
}
