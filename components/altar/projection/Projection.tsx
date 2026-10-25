"use client";

import { useEffect, useState } from "react";
import type * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { CAMERA_HOME } from "@/lib/altar/layout";
import {
  FLY_SMOOTH_TIME,
  FLY_TIMEOUT_MS,
  PANEL_CENTER,
  PANEL_EM,
  PANEL_SIZE,
  PANEL_TILT,
  PANEL_YAW,
  STAGE_MS,
  fitDistance,
  htmlDistanceFactor,
  panelCameraPose,
  panelNormal,
  panelPixels,
} from "@/lib/altar/projection";
import { useAltarStore, type AltarState } from "@/lib/altar/store";
import type { Vec3 } from "@/lib/altar/theme";
import { viewAccent, type ViewId } from "@/lib/altar/views";
import { getCameraControls } from "../cameraControls";
import { onBfcacheRestore, snapToIdle } from "./bfcache";
import { ProjectionBeam, ProjectionFrame } from "./ProjectionFx";
import SitePanel, { type PanelStage } from "./SitePanel";

const NORMAL = panelNormal(PANEL_YAW, PANEL_TILT);
const DEFAULT_SMOOTH_TIME = 0.25;

interface View {
  section: ViewId;
  stage: PanelStage;
}

type Pose = { position: Vec3; target: Vec3 };

/**
 * The section projection and its lifecycle.
 *
 * revealing: mount the pane at "wire" → draw-in (STAGE_MS.wire) → "filled" and
 *   fly the camera head-on until the pane fills PANEL_FILL of the viewport →
 *   on camera rest, revealDone().
 * returning: "dissolve" and fly to CAMERA_HOME together → returnDone() when
 *   both are finished, then unmount.
 *
 * Each transition takes a token; a superseded or unmounted transition checks
 * it after every await and quietly stops, so it can never call revealDone /
 * returnDone for a later cycle (camera-controls rest promises never reject; a
 * stale one resolves on the next flight's rest). The store actions are
 * phase-guarded too. Entering idle (normally via dismiss, or snapToIdle on a
 * back/forward-cache restore) cancels anything in flight and hides the pane.
 * Camera input and orbit limits are owned by CameraRig.
 */
export default function Projection() {
  const [view, setView] = useState<View | null>(null);
  const theme = useAltarStore((s) => s.theme);
  const viewing = useAltarStore((s) => s.phase === "viewing");
  const size = useThree((s) => s.size);
  const get = useThree((s) => s.get);

  useEffect(() => {
    let token = 0;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = setTimeout(() => {
          timers.delete(id);
          resolve();
        }, ms);
        timers.add(id);
      });
    /** Start a new transition (cancelling the previous one); returns its liveness check. */
    const begin = () => {
      token++;
      timers.forEach(clearTimeout);
      timers.clear();
      const mine = token;
      return () => mine === token;
    };
    const closeUp = (): Pose => {
      const { camera, size: s } = get();
      const fov = (camera as THREE.PerspectiveCamera).fov;
      return panelCameraPose(PANEL_CENTER, NORMAL, fitDistance(PANEL_SIZE, fov, s.width / Math.max(s.height, 1)));
    };
    /** Fly the camera; resolves on rest (or after FLY_TIMEOUT_MS, so a lost rest event can't strand a phase). */
    const fly = async (pose: Pose) => {
      const c = getCameraControls();
      if (!c) return;
      c.smoothTime = FLY_SMOOTH_TIME;
      await Promise.race([c.setLookAt(...pose.position, ...pose.target, true), wait(FLY_TIMEOUT_MS)]);
    };
    const settleCamera = () => {
      const c = getCameraControls();
      if (c) c.smoothTime = DEFAULT_SMOOTH_TIME;
    };

    async function reveal(section: ViewId) {
      const live = begin();
      setView({ section, stage: "wire" });
      await wait(STAGE_MS.wire);
      if (!live()) return;
      setView({ section, stage: "filled" });
      await fly(closeUp());
      if (!live()) return;
      settleCamera();
      useAltarStore.getState().revealDone();
    }

    async function dismiss() {
      const live = begin();
      setView((v) => v && { ...v, stage: "dissolve" });
      await Promise.all([wait(STAGE_MS.dissolve), fly(CAMERA_HOME)]);
      if (!live()) return;
      settleCamera();
      setView(null);
      useAltarStore.getState().returnDone();
    }

    /** Already viewing on mount (hot reload): show the content and frame it. */
    async function resumeViewing(section: ViewId) {
      const live = begin();
      setView({ section, stage: "filled" });
      await fly(closeUp());
      if (live()) settleCamera();
    }

    /** Idle always means no pane and no transition in flight (normally dismiss() got here first). */
    const toIdle = () => {
      begin();
      settleCamera();
      setView(null);
    };

    const enter = (s: AltarState) => {
      if (s.phase === "revealing" && s.activeSection) void reveal(s.activeSection);
      else if (s.phase === "viewing" && s.activeSection) void resumeViewing(s.activeSection);
      else if (s.phase === "returning") void dismiss();
      else if (s.phase === "idle") toIdle();
    };
    enter(useAltarStore.getState());
    const unsubscribe = useAltarStore.subscribe((s, prev) => {
      if (s.phase !== prev.phase) enter(s);
    });
    // Browser Back after leaving /altar (a top-level navigation) can restore
    // this page from the back/forward cache mid-view; land in idle instead
    // (see bfcache.ts).
    const offRestore = onBfcacheRestore(window, () => snapToIdle(useAltarStore, getCameraControls()));
    return () => {
      offRestore();
      unsubscribe();
      begin();
      settleCamera();
    };
  }, [get]);

  // Keep the close-up framed if the window resizes while a section is open.
  useEffect(() => {
    if (useAltarStore.getState().phase !== "viewing") return;
    const c = getCameraControls();
    if (!c) return;
    const camera = get().camera as THREE.PerspectiveCamera;
    const pose = panelCameraPose(
      PANEL_CENTER,
      NORMAL,
      fitDistance(PANEL_SIZE, camera.fov, size.width / Math.max(size.height, 1)),
    );
    void c.setLookAt(...pose.position, ...pose.target, true);
  }, [size.width, size.height, get]);

  if (!view) return null;
  const accent = viewAccent(view.section);
  // Lay the DOM out at its on-screen size at the close-up, so it renders 1:1 there.
  const px = panelPixels(PANEL_SIZE, size);

  return (
    <>
      <group position={PANEL_CENTER} rotation={[PANEL_TILT, PANEL_YAW, 0, "YXZ"]}>
        <ProjectionFrame stage={view.stage} viewing={viewing} accent={accent} theme={theme} />
        <Html
          transform
          distanceFactor={htmlDistanceFactor(PANEL_SIZE.width, px.width)}
          zIndexRange={[40, 0]}
          pointerEvents={view.stage === "filled" ? "auto" : "none"}
        >
          <div style={{ width: px.width, height: px.height, fontSize: px.width * PANEL_EM }}>
            {/* keyed: a new view is a new frame (first-load anchor, hidden until loaded) */}
            <SitePanel key={view.section} view={view.section} stage={view.stage} theme={theme} />
          </div>
        </Html>
      </group>
      <ProjectionBeam stage={view.stage} viewing={viewing} accent={accent} theme={theme} />
    </>
  );
}
