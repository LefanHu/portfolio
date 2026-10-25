"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { CuboidCollider, RigidBody, useRapier, type RapierRigidBody } from "@react-three/rapier";
import {
  DRAGGED_GROUPS,
  ITEM_GROUPS,
  clearanceY,
  followStep,
  releaseMotion,
  resolveDragTarget,
  type DragSample,
  type DragZone,
} from "@/lib/altar/drag";
import { itemCollider, itemScale } from "@/lib/altar/itemColliders";
import { ITEMS, type ItemId } from "@/lib/altar/items";
import { DESK_ROT, ITEM_HOME, shouldRespawn } from "@/lib/altar/layout";
import { RECIPES } from "@/lib/altar/recipes";
import { useAltarStore } from "@/lib/altar/store";
import { SUMMON_DROP_POINT, SUMMON_FLIGHT_MS, SUMMON_RELEASE_SPEED, summonPath } from "@/lib/altar/summon";
import type { Vec3 } from "@/lib/altar/theme";
import { getCameraControls } from "../cameraControls";
import HoverTip from "../scene/HoverTip";
import { isOccluded } from "../scene/occluders";
import ItemHighlight from "./ItemHighlight";
import ItemModel from "./ItemModel";

/** What Items.tsx needs from each item for the eject / reset / phase / summon effects. */
export interface ItemHandle {
  body(): RapierRigidBody | null;
  isDragging(): boolean;
  /** A summon flight is pending (inside its delay) or under way. */
  isFlying(): boolean;
  /** Drop the item where it is (no throw); also cancels a summon flight. */
  endDrag(): void;
  /** Hide the hover tooltip (an eject moves the item out from under the pointer). */
  clearHover(): void;
  /** Teleport home: upright, at rest, awake. Cancels a summon flight. */
  sendHome(): void;
  /**
   * After `delayMs`, fly into the cauldron and drop in, provided summon `nonce`
   * is still the store's current run. Resolves once the body is released, or
   * early if the flight is cancelled.
   */
  summon(delayMs: number, nonce: number): Promise<void>;
}

const HOME_ROTATION: Vec3 = [0, DESK_ROT, 0];
const HOME_QUAT = new THREE.Quaternion().setFromEuler(new THREE.Euler(...HOME_ROTATION));
/** Spawn a hair above the surface so a body never starts inside the desk or ground. */
const SPAWN_LIFT = 0.01;
const SAMPLE_KEEP_S = 0.3;
/** Slow yaw spin while a summoned item flies (rad / s). */
const FLIGHT_SPIN = 1.5;

const _v = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _qTarget = new THREE.Quaternion();
const _yAxis = new THREE.Vector3(0, 1, 0);

/**
 * Screen height (NDC y) of each board-highlighted item's tag anchor, so the
 * pair can agree which compact tag stacks on top: the higher one on screen
 * lifts, which keeps the two apart from any camera angle.
 */
const tagAnchorY = new Map<ItemId, number>();
/** NDC dead band before the pair swaps which tag is lifted (no flicker on a near-tie while orbiting). */
const TAG_SWAP_EPS = 0.01;

interface DragState {
  active: boolean;
  pointerId: number;
  captured: Element | null;
  yaw: number;
  zone: DragZone | null;
  /** Last held point, for the drop-in release over the cauldron. */
  target: Vec3 | null;
  samples: DragSample[];
}

interface FlightState {
  /** Waiting out its delay, or flying (kinematic). */
  stage: "none" | "pending" | "flying";
  /** The store's summonNonce of the run that started this flight. */
  nonce: number;
  /** performance.now() at which a pending flight may take off. */
  startAt: number;
  /** Flight time so far (s), summed from clamped frame deltas: a stalled tab can't skip the flight. */
  elapsed: number;
  from: Vec3;
  yaw: number;
  resolve: (() => void) | null;
}

/** One draggable, throwable desk item: a dynamic body that turns kinematic while held. */
export default function DraggableItem({
  id,
  register,
}: {
  id: ItemId;
  register(id: ItemId, handle: ItemHandle | null): void;
}) {
  const { rapier } = useRapier();
  const body = useRef<RapierRigidBody>(null);
  const visual = useRef<THREE.Group>(null);
  const tip = useRef<THREE.Group>(null);
  const drag = useRef<DragState>({
    active: false,
    pointerId: -1,
    captured: null,
    yaw: 0,
    zone: null,
    target: null,
    samples: [],
  });
  const flight = useRef<FlightState>({
    stage: "none",
    nonce: 0,
    startAt: 0,
    elapsed: 0,
    from: [0, 0, 0],
    yaw: 0,
    resolve: null,
  });
  const wobble = useRef(0);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  /** A summon flight is pending or under way (mirrors `flight.stage`, for render). */
  const [inFlight, setInFlight] = useState(false);
  const idle = useAltarStore((s) => s.phase === "idle");
  /** The board-highlighted recipe's accent, if that recipe uses this item. */
  const highlightAccent = useAltarStore((s) => {
    const recipe = s.highlight ? RECIPES.find((r) => r.section === s.highlight) : undefined;
    return recipe?.items.includes(id) ? recipe.artifact.accent : null;
  });
  /** The other item of the highlighted pair, if this item is in it. */
  const highlightPartner = useAltarStore((s) => {
    const items = RECIPES.find((r) => r.section === s.highlight)?.items;
    return items?.includes(id) ? (items[0] === id ? items[1] : items[0]) : null;
  });
  /** Whether this item's compact highlight tag stacks above its partner's (see tagAnchorY). */
  const [tagLift, setTagLift] = useState(false);
  const tagLiftRef = useRef(false);

  // Stable props: @react-three/rapier re-applies (and re-positions) the body whenever these change.
  const userData = useMemo(() => ({ itemId: id }), [id]);
  const spawn = useMemo<Vec3>(() => [ITEM_HOME[id][0], ITEM_HOME[id][1] + SPAWN_LIFT, ITEM_HOME[id][2]], [id]);
  const collider = useMemo(() => itemCollider(id), [id]);
  const scale = itemScale(id);
  const tipHeight = collider.offset[1] + collider.half[1] + 0.12;
  /** Horizontal reach of the collider from the body origin, for wall/desk clearance. */
  const reach = Math.hypot(collider.half[0], collider.half[2]) + Math.hypot(collider.offset[0], collider.offset[2]);

  const { handle, endDrag, finishFlight } = useMemo(() => {
    /** Clear the flight state and resolve its promise (the body is left as it is). */
    const finishFlight = () => {
      const f = flight.current;
      f.stage = "none";
      const resolve = f.resolve;
      f.resolve = null;
      setInFlight(false);
      resolve?.();
    };
    /** Stop a pending or active flight: back to a plain dynamic body, promise resolved. */
    const cancelFlight = () => {
      const f = flight.current;
      if (f.stage === "none") return;
      const b = body.current;
      if (b && f.stage === "flying") {
        b.setBodyType(rapier.RigidBodyType.Dynamic, true);
        b.collider(0)?.setCollisionGroups(ITEM_GROUPS);
        b.enableCcd(true);
        b.setLinvel({ x: 0, y: 0, z: 0 }, true);
        b.setAngvel({ x: 0, y: 0, z: 0 }, true);
      }
      finishFlight();
    };
    const endDrag = (throwIt: boolean) => {
      const d = drag.current;
      if (!d.active) return;
      d.active = false;
      const b = body.current;
      if (b) {
        const m = throwIt ? releaseMotion(d.zone, d.target, d.samples) : null;
        if (m?.snapTo) b.setTranslation({ x: m.snapTo[0], y: m.snapTo[1], z: m.snapTo[2] }, true);
        b.setBodyType(rapier.RigidBodyType.Dynamic, true);
        b.collider(0)?.setCollisionGroups(ITEM_GROUPS);
        b.enableCcd(true);
        const [x, y, z] = m?.velocity ?? [0, 0, 0];
        b.setLinvel({ x, y, z }, true);
        b.setAngvel({ x: 0, y: 0, z: 0 }, true);
      }
      try {
        if (d.captured?.hasPointerCapture(d.pointerId)) d.captured.releasePointerCapture(d.pointerId);
      } catch {
        // the element may be gone
      }
      d.captured = null;
      d.target = null;
      d.samples = [];
      // Orbit comes back only in idle; otherwise CameraRig owns it (and keeps it off).
      const controls = getCameraControls();
      if (controls) controls.enabled = useAltarStore.getState().phase === "idle";
      setDragging(false);
      // Tooltips otherwise ride along with a released or ejected item until the pointer moves.
      setHovered(false);
    };
    const handle: ItemHandle = {
      body: () => body.current,
      isDragging: () => drag.current.active,
      isFlying: () => flight.current.stage !== "none",
      endDrag: () => {
        cancelFlight();
        endDrag(false);
      },
      clearHover: () => setHovered(false),
      sendHome() {
        cancelFlight();
        endDrag(false);
        const b = body.current;
        if (!b) return;
        b.setTranslation({ x: spawn[0], y: spawn[1], z: spawn[2] }, true);
        b.setRotation(HOME_QUAT, true);
        b.setLinvel({ x: 0, y: 0, z: 0 }, true);
        b.setAngvel({ x: 0, y: 0, z: 0 }, true);
        b.wakeUp();
      },
      summon(delayMs, nonce) {
        endDrag(false);
        cancelFlight();
        setHovered(false);
        setInFlight(true);
        return new Promise<void>((resolve) => {
          flight.current = {
            stage: "pending",
            nonce,
            startAt: performance.now() + delayMs,
            elapsed: 0,
            from: [0, 0, 0],
            yaw: 0,
            resolve,
          };
        });
      },
    };
    return { handle, endDrag, finishFlight };
  }, [rapier, spawn]);

  useEffect(() => {
    register(id, handle);
    return () => register(id, null);
  }, [id, handle, register]);

  // A pointer released anywhere (even outside the canvas) ends the drag.
  useEffect(() => {
    if (!dragging) return;
    const up = (e: PointerEvent) => {
      if (e.pointerId === drag.current.pointerId) endDrag(true);
    };
    const blur = () => endDrag(false);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      window.removeEventListener("blur", blur);
    };
  }, [dragging, endDrag]);

  useEffect(() => () => void tagAnchorY.delete(id), [id]);

  // Unmounting mid-flight must not leave a summon waiting; mid-drag, must not leave the orbit disabled.
  useEffect(
    () => () => {
      const f = flight.current;
      f.stage = "none";
      const resolve = f.resolve;
      f.resolve = null;
      resolve?.();
      if (!drag.current.active) return;
      drag.current.active = false;
      const controls = getCameraControls();
      if (controls) controls.enabled = useAltarStore.getState().phase === "idle";
    },
    [],
  );

  const cursor = dragging ? "grabbing" : hovered && idle ? "grab" : null;
  useEffect(() => {
    if (!cursor) return;
    document.body.style.cursor = cursor;
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [cursor]);

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (e.button !== 0) return;
    // Only the nearest interactive thing under the cursor reacts, and only if no scenery hides it.
    if (e.intersections[0]?.eventObject !== e.eventObject || isOccluded(e.ray, e.distance)) return;
    e.stopPropagation();
    const b = body.current;
    if (!b || drag.current.active || flight.current.stage !== "none" || useAltarStore.getState().phase !== "idle")
      return;
    const target = e.target as Element;
    target.setPointerCapture(e.pointerId);
    const controls = getCameraControls();
    if (controls) controls.enabled = false; // also cancels a rotation it may have started
    const r = b.rotation();
    _q.set(r.x, r.y, r.z, r.w);
    const fwd = _v.set(1, 0, 0).applyQuaternion(_q);
    drag.current = {
      active: true,
      pointerId: e.pointerId,
      captured: target,
      yaw: Math.atan2(-fwd.z, fwd.x),
      zone: null,
      target: null,
      samples: [],
    };
    b.setBodyType(rapier.RigidBodyType.KinematicPositionBased, true);
    b.collider(0)?.setCollisionGroups(DRAGGED_GROUPS);
    // CCD would stop a kinematic body at the first fixed collider in its path.
    b.enableCcd(false);
    setDragging(true);
  };

  const release = (e: ThreeEvent<PointerEvent>) => {
    if (!drag.current.active || e.pointerId !== drag.current.pointerId) return;
    e.stopPropagation();
    endDrag(true);
  };

  useFrame((state, delta) => {
    const b = body.current;
    if (!b) return;
    const d = drag.current;
    const f = flight.current;
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.1);

    if (f.stage === "pending" && performance.now() >= f.startAt) {
      const s = useAltarStore.getState();
      if (s.phase !== "idle" || !s.summoning || s.summonNonce !== f.nonce) {
        // The summon ended or was replaced while this item waited (lever pulled): stay put. Airborne items still land.
        finishFlight();
      } else {
        // Lift off like a pick-up: kinematic, past the other items, no CCD.
        const p = b.translation();
        const r = b.rotation();
        _q.set(r.x, r.y, r.z, r.w);
        const fwd = _v.set(1, 0, 0).applyQuaternion(_q);
        f.from = [p.x, p.y, p.z];
        f.yaw = Math.atan2(-fwd.z, fwd.x);
        f.elapsed = 0;
        f.stage = "flying";
        b.setBodyType(rapier.RigidBodyType.KinematicPositionBased, true);
        b.collider(0)?.setCollisionGroups(DRAGGED_GROUPS);
        b.enableCcd(false);
      }
    }

    if (d.active) {
      state.raycaster.setFromCamera(state.pointer, state.camera);
      const target = resolveDragTarget(state.raycaster.ray);
      if (target) {
        // A zone switch jumps the target; don't let that read as a throw.
        if (target.zone !== d.zone) d.samples = [];
        d.zone = target.zone;
        d.target = target.position;
        const p = b.translation();
        const next = followStep([p.x, p.y, p.z], target.position, dt);
        // Never sweep through the cauldron wall or the desk on the way.
        next[1] = Math.max(next[1], clearanceY(next, reach));
        b.setNextKinematicTranslation({ x: next[0], y: next[1], z: next[2] });
        // The throw follows the pointer's recent motion, not the easing body.
        d.samples.push({ t, p: target.aim });
        while (d.samples.length > 2 && d.samples[0].t < t - SAMPLE_KEEP_S) d.samples.shift();
      }
      // Ease upright, keeping the yaw it was picked up with.
      const r = b.rotation();
      _q.set(r.x, r.y, r.z, r.w);
      _qTarget.setFromAxisAngle(_yAxis, d.yaw);
      _q.slerp(_qTarget, 1 - Math.exp(-dt / 0.1));
      b.setNextKinematicRotation(_q);
    } else if (f.stage === "flying") {
      f.elapsed += dt;
      const k = (f.elapsed * 1000) / SUMMON_FLIGHT_MS;
      if (k >= 1) {
        // Released just above the rim, dropping in.
        const [x, y, z] = SUMMON_DROP_POINT;
        b.setTranslation({ x, y, z }, true);
        b.setBodyType(rapier.RigidBodyType.Dynamic, true);
        b.collider(0)?.setCollisionGroups(ITEM_GROUPS);
        b.enableCcd(true);
        b.setLinvel({ x: 0, y: -SUMMON_RELEASE_SPEED, z: 0 }, true);
        b.setAngvel({ x: 0, y: 0, z: 0 }, true);
        finishFlight();
      } else {
        const [x, y, z] = summonPath(f.from, k);
        b.setNextKinematicTranslation({ x, y, z });
        // Ease upright while spinning slowly about y.
        const r = b.rotation();
        _q.set(r.x, r.y, r.z, r.w);
        _qTarget.setFromAxisAngle(_yAxis, f.yaw + FLIGHT_SPIN * f.elapsed);
        _q.slerp(_qTarget, 1 - Math.exp(-dt / 0.15));
        b.setNextKinematicRotation(_q);
      }
    } else if (f.stage === "none" && shouldRespawn(b.translation().y)) {
      handle.sendHome();
    }

    // Hover (or board highlight) wobble on the visual only (the collider stays put).
    const showWobble = (hovered || highlightAccent !== null) && !d.active && f.stage !== "flying" && idle;
    wobble.current += ((showWobble ? 1 : 0) - wobble.current) * (1 - Math.exp(-dt / 0.08));
    const w = wobble.current;
    if (visual.current) {
      visual.current.rotation.set(
        Math.cos(t * 7.1) * 0.05 * w,
        Math.sin((t + id.length) * 0.7) * 0.025,
        Math.sin(t * 9.3) * 0.07 * w,
      );
      visual.current.position.y = 0.04 * w;
    }
    if (tip.current) {
      const p = b.translation();
      tip.current.position.set(p.x, p.y + tipHeight, p.z);
      if (highlightPartner) {
        const y = _v.set(p.x, p.y + tipHeight, p.z).project(state.camera).y;
        tagAnchorY.set(id, y);
        const other = tagAnchorY.get(highlightPartner);
        const dy = other === undefined ? 0 : y - other;
        // The higher tag lifts; on a near-tie keep the current choice (a fixed order by id to start).
        const lift =
          dy > TAG_SWAP_EPS
            ? true
            : dy < -TAG_SWAP_EPS
              ? false
              : other === undefined
                ? id > highlightPartner
                : tagLiftRef.current;
        if (lift !== tagLiftRef.current) {
          tagLiftRef.current = lift;
          setTagLift(lift);
        }
      } else {
        tagAnchorY.delete(id);
      }
    }
  });

  const highlighted = highlightAccent !== null && !inFlight;
  const showTip = (hovered || highlighted) && !dragging && !inFlight && idle;

  return (
    <>
      <RigidBody
        ref={body}
        type="dynamic"
        colliders={false}
        position={spawn}
        rotation={HOME_ROTATION}
        userData={userData}
        ccd
        linearDamping={0.1}
        angularDamping={0.6}
      >
        <CuboidCollider
          args={collider.half}
          position={collider.offset}
          rotation={[0, collider.rotY, 0]}
          collisionGroups={ITEM_GROUPS}
          friction={0.8}
          restitution={0.1}
        />
        <group
          userData={userData}
          onPointerDown={onPointerDown}
          onPointerUp={release}
          onPointerCancel={release}
          onClick={(e) => e.stopPropagation()}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(!isOccluded(e.ray, e.distance) && flight.current.stage === "none");
          }}
          onPointerMove={(e) => {
            e.stopPropagation();
            setHovered(!isOccluded(e.ray, e.distance) && flight.current.stage === "none");
          }}
          onPointerOut={() => setHovered(false)}
        >
          <group ref={visual}>
            <group scale={scale}>
              <ItemModel id={id} />
            </group>
          </group>
        </group>
      </RigidBody>
      <group ref={tip}>
        {showTip &&
          // A pointer hover gets the full tip; a board highlight a compact tag, the pair's stacked.
          (hovered ? (
            <HoverTip name={ITEMS[id].name} flavor={ITEMS[id].flavor} />
          ) : (
            <HoverTip name={ITEMS[id].short} compact lift={tagLift} accent={highlightAccent ?? undefined} />
          ))}
        {/* The tip group sits tipHeight above the body origin, i.e. the item's base. */}
        <group position={[0, -tipHeight, 0]}>
          <ItemHighlight accent={highlighted ? highlightAccent : null} radius={reach + 0.08} />
        </group>
      </group>
    </>
  );
}
