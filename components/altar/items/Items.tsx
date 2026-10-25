"use client";

import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { ejectVelocity } from "@/lib/altar/drag";
import { ITEMS, type ItemId } from "@/lib/altar/items";
import { ALTAR_POS } from "@/lib/altar/layout";
import { altarOccupancy, getAltarOccupantBody, getAltarOccupants } from "@/lib/altar/occupancy";
import { RECIPES } from "@/lib/altar/recipes";
import { cauldronContains, setPresent } from "@/lib/altar/sensor";
import { useAltarStore } from "@/lib/altar/store";
import { SUMMON_EJECT_WAIT_MS, SUMMON_STAGGER_MS, summonPlan } from "@/lib/altar/summon";
import { isHitbox } from "../scene/hitbox";
import DraggableItem, { type ItemHandle } from "./DraggableItem";
import { useSettleEvaluate } from "./useSettleEvaluate";

const IDS = Object.keys(ITEMS) as ItemId[];

function isItem(o: THREE.Object3D | null): boolean {
  for (let n = o; n; n = n.parent) if (n.userData?.itemId) return true;
  return false;
}

/**
 * Invisible enlarged hit boxes (lantern, lever) must not steal item drags: when
 * a ray hits an item, drop hit-box hits from it. Real lantern/lever meshes still
 * win when they are nearer than the item.
 */
function useHitboxFilter() {
  const setEvents = useThree((s) => s.setEvents);
  useEffect(() => {
    setEvents({
      filter: (hits) => (hits.some((h) => isItem(h.object)) ? hits.filter((h) => !isHitbox(h.object)) : hits),
    });
    return () => setEvents({ filter: undefined });
  }, [setEvents]);
}

/**
 * The draggable items (desk ingredients and stand relics), plus the store-driven effects on them:
 * eject (ejectNonce), return home (resetNonce), dropping any held item (and
 * cancelling summon flights) when the phase leaves idle, summoning a recipe
 * (summonNonce), and the settle debounce that calls evaluate().
 */
export default function Items() {
  const handles = useRef(new Map<ItemId, ItemHandle>());
  const register = useCallback((id: ItemId, h: ItemHandle | null) => {
    if (h) handles.current.set(id, h);
    else handles.current.delete(id);
  }, []);

  useSettleEvaluate();
  useHitboxFilter();

  // Cauldron occupancy, from item centres each frame (held or summon-flying items never count).
  useFrame(() => {
    for (const [id, h] of handles.current) {
      const b = h.body();
      if (!b) continue;
      const c = b.worldCom();
      setPresent(altarOccupancy, id, cauldronContains([c.x, c.y, c.z], h.isDragging() || h.isFlying()), b);
    }
  });
  useEffect(
    () => () => {
      for (const id of altarOccupancy.occupants()) altarOccupancy.leave(id);
    },
    [],
  );

  useEffect(() => {
    /** Throw cauldron occupants out over the rim (held or flying items are left alone). */
    const ejectOccupants = (ids: ItemId[]) => {
      for (const id of ids) {
        const h = handles.current.get(id);
        if (h?.isDragging() || h?.isFlying()) continue;
        h?.clearHover();
        const b = getAltarOccupantBody(id);
        if (!b) continue;
        const p = b.translation();
        const [x, y, z] = ejectVelocity([p.x, p.y, p.z], ALTAR_POS, (Math.random() - 0.5) * 0.6);
        b.setLinvel({ x, y, z }, true);
        b.setAngvel(
          { x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 4, z: (Math.random() - 0.5) * 6 },
          true,
        );
      }
    };

    let disposed = false;
    let ejectWait: ReturnType<typeof setTimeout> | undefined;
    /** The nonce of the summon run in progress, if any. */
    let running: number | null = null;
    /** End summon `nonce`, unless a newer summon (or a reset) already took over. */
    const finishSummon = (nonce: number) => {
      if (running === nonce) running = null;
      const st = useAltarStore.getState();
      if (st.summoning && st.summonNonce === nonce) st.summonDone();
    };
    const runSummon = async (nonce: number, pair: readonly [ItemId, ItemId]) => {
      running = nonce;
      try {
        const { extras, fly } = summonPlan(pair, getAltarOccupants());
        if (extras.length > 0) {
          ejectOccupants(extras);
          await new Promise<void>((resolve) => {
            ejectWait = setTimeout(resolve, SUMMON_EJECT_WAIT_MS);
          });
          if (disposed) return;
          const st = useAltarStore.getState();
          if (st.phase !== "idle" || !st.summoning || st.summonNonce !== nonce) return;
        }
        // A cancelled flight (phase left idle, unmount) resolves early, so this always completes.
        await Promise.all(fly.map((id, i) => handles.current.get(id)?.summon(i * SUMMON_STAGGER_MS, nonce)));
      } finally {
        // Also on a throw: `summoning` must never stay stuck. Guarded by nonce, so a stale run is a no-op.
        if (!disposed) finishSummon(nonce);
      }
    };

    const unsubscribe = useAltarStore.subscribe((s, prev) => {
      if (s.phase !== "idle" && prev.phase === "idle") {
        for (const h of handles.current.values()) h.endDrag();
      }
      if (s.resetNonce !== prev.resetNonce) {
        // Out of the cauldron before returnDone() re-syncs occupancy.
        for (const h of handles.current.values()) h.sendHome();
      }
      if (s.ejectNonce !== prev.ejectNonce) {
        // Physical occupants, not `contents` (clearAltar already emptied it).
        ejectOccupants(getAltarOccupants());
      }
      if (s.summonNonce !== prev.summonNonce && s.summoning) {
        const pair = RECIPES.find((r) => r.section === s.summonSection)?.items;
        if (pair) void runSummon(s.summonNonce, pair);
        else finishSummon(s.summonNonce);
      }
    });
    return () => {
      unsubscribe();
      disposed = true;
      clearTimeout(ejectWait);
      if (running !== null) finishSummon(running);
    };
  }, []);

  return (
    <>
      {IDS.map((id) => (
        <DraggableItem key={id} id={id} register={register} />
      ))}
    </>
  );
}
