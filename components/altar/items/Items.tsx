"use client";

import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { ejectVelocity } from "@/lib/altar/drag";
import { ITEMS, type ItemId } from "@/lib/altar/items";
import { ALTAR_POS } from "@/lib/altar/layout";
import { altarOccupancy, getAltarOccupantBody, getAltarOccupants } from "@/lib/altar/occupancy";
import { cauldronContains, setPresent } from "@/lib/altar/sensor";
import { useAltarStore } from "@/lib/altar/store";
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
 * The ten draggable desk items, plus the store-driven effects on them:
 * eject (ejectNonce), return home (resetNonce), dropping any held item when the
 * phase leaves idle, and the settle debounce that calls evaluate().
 */
export default function Items() {
  const handles = useRef(new Map<ItemId, ItemHandle>());
  const register = useCallback((id: ItemId, h: ItemHandle | null) => {
    if (h) handles.current.set(id, h);
    else handles.current.delete(id);
  }, []);

  useSettleEvaluate();
  useHitboxFilter();

  // Cauldron occupancy, from item centres each frame (held items never count).
  useFrame(() => {
    for (const [id, h] of handles.current) {
      const b = h.body();
      if (!b) continue;
      const c = b.worldCom();
      setPresent(altarOccupancy, id, cauldronContains([c.x, c.y, c.z], h.isDragging()), b);
    }
  });
  useEffect(
    () => () => {
      for (const id of altarOccupancy.occupants()) altarOccupancy.leave(id);
    },
    [],
  );

  useEffect(
    () =>
      useAltarStore.subscribe((s, prev) => {
        if (s.phase !== "idle" && prev.phase === "idle") {
          for (const h of handles.current.values()) h.endDrag();
        }
        if (s.resetNonce !== prev.resetNonce) {
          // Out of the cauldron before returnDone() re-syncs occupancy.
          for (const h of handles.current.values()) h.sendHome();
        }
        if (s.ejectNonce !== prev.ejectNonce) {
          // Physical occupants, not `contents` (clearAltar already emptied it).
          for (const id of getAltarOccupants()) {
            const h = handles.current.get(id);
            if (h?.isDragging()) continue;
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
        }
      }),
    [],
  );

  return (
    <>
      {IDS.map((id) => (
        <DraggableItem key={id} id={id} register={register} />
      ))}
    </>
  );
}
