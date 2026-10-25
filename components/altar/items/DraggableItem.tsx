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
import { useAltarStore } from "@/lib/altar/store";
import type { Vec3 } from "@/lib/altar/theme";
import { getCameraControls } from "../cameraControls";
import HoverTip from "../scene/HoverTip";
import { isOccluded } from "../scene/occluders";
import ItemModel from "./ItemModel";

/** What Items.tsx needs from each item for the eject / reset / phase effects. */
export interface ItemHandle {
  body(): RapierRigidBody | null;
  isDragging(): boolean;
  /** Drop the item where it is (no throw). */
  endDrag(): void;
  /** Hide the hover tooltip (an eject moves the item out from under the pointer). */
  clearHover(): void;
  /** Teleport home: upright, at rest, awake. */
  sendHome(): void;
}

const HOME_ROTATION: Vec3 = [0, DESK_ROT, 0];
const HOME_QUAT = new THREE.Quaternion().setFromEuler(new THREE.Euler(...HOME_ROTATION));
/** Spawn a hair above the surface so a body never starts inside the desk or ground. */
const SPAWN_LIFT = 0.01;
const SAMPLE_KEEP_S = 0.3;

const _v = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _qTarget = new THREE.Quaternion();
const _yAxis = new THREE.Vector3(0, 1, 0);

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
  const wobble = useRef(0);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const idle = useAltarStore((s) => s.phase === "idle");

  // Stable props: @react-three/rapier re-applies (and re-positions) the body whenever these change.
  const userData = useMemo(() => ({ itemId: id }), [id]);
  const spawn = useMemo<Vec3>(() => [ITEM_HOME[id][0], ITEM_HOME[id][1] + SPAWN_LIFT, ITEM_HOME[id][2]], [id]);
  const collider = useMemo(() => itemCollider(id), [id]);
  const scale = itemScale(id);
  const tipHeight = collider.offset[1] + collider.half[1] + 0.12;
  /** Horizontal reach of the collider from the body origin, for wall/desk clearance. */
  const reach = Math.hypot(collider.half[0], collider.half[2]) + Math.hypot(collider.offset[0], collider.offset[2]);

  const { handle, endDrag } = useMemo(() => {
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
      endDrag: () => endDrag(false),
      clearHover: () => setHovered(false),
      sendHome() {
        endDrag(false);
        const b = body.current;
        if (!b) return;
        b.setTranslation({ x: spawn[0], y: spawn[1], z: spawn[2] }, true);
        b.setRotation(HOME_QUAT, true);
        b.setLinvel({ x: 0, y: 0, z: 0 }, true);
        b.setAngvel({ x: 0, y: 0, z: 0 }, true);
        b.wakeUp();
      },
    };
    return { handle, endDrag };
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

  // Unmounting mid-drag must not leave the orbit disabled.
  useEffect(
    () => () => {
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
    if (!b || drag.current.active || useAltarStore.getState().phase !== "idle") return;
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
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.1);

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
    } else if (shouldRespawn(b.translation().y)) {
      handle.sendHome();
    }

    // Hover wobble on the visual only (the collider stays put).
    const showWobble = hovered && !d.active && idle;
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
    }
  });

  const showTip = hovered && !dragging && idle;

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
            setHovered(!isOccluded(e.ray, e.distance));
          }}
          onPointerMove={(e) => {
            e.stopPropagation();
            setHovered(!isOccluded(e.ray, e.distance));
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
        {showTip && (
          <HoverTip name={ITEMS[id].name} flavor={ITEMS[id].flavor} />
        )}
      </group>
    </>
  );
}
