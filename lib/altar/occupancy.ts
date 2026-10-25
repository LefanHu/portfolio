import type { RapierRigidBody } from "@react-three/rapier";
import type { ItemId } from "./items";
import { createSensorTracker, type SensorTracker } from "./sensor";
import { useAltarStore, type AltarState } from "./store";

/** After an eject, wait this long for bodies to fly clear, then re-sync stragglers. */
export const EJECT_RESYNC_MS = 1200;

type StoreLike = {
  getState(): AltarState;
  subscribe(listener: (s: AltarState, prev: AltarState) => void): () => void;
};

export interface Occupancy<B> extends SensorTracker<B> {
  /** Start re-syncing the store from the tracker; returns a disconnect function. */
  connect(): () => void;
}

/**
 * Cauldron occupancy: the sensor tracker wired to the altar store. The store's
 * `contents` can drop items the cauldron still physically holds (clearAltar,
 * returnDone, or enters ignored outside idle). Whenever the phase returns to
 * idle, and EJECT_RESYNC_MS after each eject, items still inside are re-entered.
 */
export function createOccupancy<B = unknown>(
  store: StoreLike,
  ejectResyncMs = EJECT_RESYNC_MS,
): Occupancy<B> {
  const tracker = createSensorTracker<B>(
    (id) => store.getState().itemEntered(id),
    (id) => store.getState().itemLeft(id),
  );
  return {
    ...tracker,
    connect() {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const unsub = store.subscribe((s, prev) => {
        if (s.phase === "idle" && prev.phase !== "idle") tracker.resync();
        if (s.ejectNonce !== prev.ejectNonce) {
          clearTimeout(timer);
          timer = setTimeout(() => tracker.resync(), ejectResyncMs);
        }
      });
      return () => {
        unsub();
        clearTimeout(timer);
      };
    },
  };
}

/** The scene's cauldron occupancy (bodies are rapier RigidBodies). */
export const altarOccupancy = createOccupancy<RapierRigidBody>(useAltarStore);

/** Items physically inside the cauldron right now, regardless of store phase. */
export function getAltarOccupants(): ItemId[] {
  return altarOccupancy.occupants();
}

/** The rigid body of an item inside the cauldron (e.g. to apply an eject impulse). */
export function getAltarOccupantBody(id: ItemId): RapierRigidBody | undefined {
  return altarOccupancy.bodyOf(id);
}
