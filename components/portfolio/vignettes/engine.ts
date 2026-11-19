/**
 * Draws every experience vignette with one WebGL context.
 *
 * A browser allows only a handful of WebGL contexts per page, and a canvas
 * fixed over the page would lag behind scrolling. So there is one renderer on
 * a canvas that is never in the document; each figure owns an ordinary 2D
 * canvas in the page, and each frame the engine renders the scenes that are
 * on screen and copies each picture across.
 *
 * This module (with three.js and the scenes) is loaded on demand by
 * Vignette.tsx, the first time a figure comes near the viewport.
 */
import * as THREE from "three";
import { subscribeTheme, THEME_FADE_MS } from "@/lib/theme";
import type { VignetteId } from "./captions";
import { DEFAULT_VIEW, disposeTree } from "./kit";
import { motionPaused, subscribeMotion } from "./motion";
import { createPalette, readPalette } from "./palette";
import { SCENES } from "./scenes";
import type { Palette, View, Vignette, VignetteFactory } from "./types";

/* ── Drawing one vignette ──────────────────────────────────────────────── */

/** A built vignette with its lights, ready to draw. */
export interface Stage {
  scene: THREE.Scene;
  vignette: Vignette;
  view: View;
}

export function createStage(factory: VignetteFactory, palette: Palette): Stage {
  const vignette = factory(palette);
  const scene = new THREE.Scene();
  // Tuned so a box in a token colour shows that colour on top and two darker sides.
  const sun = new THREE.DirectionalLight(0xffffff, 2.3);
  sun.position.set(0.3, 1, 0.8);
  scene.add(new THREE.AmbientLight(0xffffff, 1.5), sun, vignette.root);
  return { scene, vignette, view: { ...DEFAULT_VIEW, ...vignette.view } };
}

export function disposeStage(stage: Stage) {
  disposeTree(stage.vignette.root);
}

const CAMERA_DISTANCE = 30;
/** How far the pointer can swing the camera, in radians. */
const TILT = { yaw: 0.2, pitch: 0.09 };

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, CAMERA_DISTANCE * 2);

function aimCamera(view: View, aspect: number, tiltX: number, tiltY: number) {
  // Show at least the view's frame, whatever the shape of the canvas.
  const [frameWidth, frameHeight] = view.frame;
  const halfHeight = Math.max(frameHeight, frameWidth / aspect) / 2;
  camera.left = -halfHeight * aspect;
  camera.right = halfHeight * aspect;
  camera.top = halfHeight;
  camera.bottom = -halfHeight;
  camera.updateProjectionMatrix();

  const yaw = view.yaw + tiltX * TILT.yaw;
  const pitch = view.pitch + tiltY * TILT.pitch;
  const [x, y, z] = view.target;
  camera.position.set(
    x + CAMERA_DISTANCE * Math.sin(yaw) * Math.cos(pitch),
    y + CAMERA_DISTANCE * Math.sin(pitch),
    z + CAMERA_DISTANCE * Math.cos(yaw) * Math.cos(pitch),
  );
  camera.lookAt(x, y, z);
}

/**
 * Renders `stage` at time `t` into the bottom-left `width` × `height` pixels
 * of the renderer's canvas, which must be at least that large.
 */
export function drawStage(
  renderer: THREE.WebGLRenderer,
  stage: Stage,
  width: number,
  height: number,
  t: number,
  tiltX = 0,
  tiltY = 0,
) {
  stage.vignette.update(t);
  aimCamera(stage.view, width / height, tiltX, tiltY);
  renderer.setViewport(0, 0, width, height);
  renderer.setScissor(0, 0, width, height);
  renderer.setScissorTest(true);
  renderer.clear();
  renderer.render(stage.scene, camera);
}

export function createRenderer(): THREE.WebGLRenderer | null {
  try {
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    // Sizes below are in device pixels already.
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);
    return renderer;
  } catch {
    // No WebGL (blocked, unsupported, out of contexts).
    return null;
  }
}

/* ── The figures on the page ───────────────────────────────────────────── */

interface Slot {
  id: VignetteId;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  stage: Stage | null;
  /** Built with colours that have since changed in ways a live reference may not cover. */
  stale: boolean;
  visible: boolean;
  /** Needs drawing even while nothing is playing. */
  dirty: boolean;
  painted: boolean;
  /** Where the pointer asks the camera to swing (-1..1), and where it has eased to. */
  aim: { x: number; y: number };
  tilt: { x: number; y: number };
  onFirstFrame: () => void;
}

/** What Vignette.tsx holds for a mounted figure. */
export interface Mounted {
  /** Pointer position over the figure, each axis -1..1, or null when it leaves. */
  point(position: { x: number; y: number } | null): void;
  unmount(): void;
}

// A frame after a hidden tab reports the whole gap; capping it keeps scenes from leaping.
const MAX_STEP = 0.1;
const MAX_PIXEL_RATIO = 2;
/** Start drawing a little before a figure scrolls into view. */
const VISIBLE_MARGIN = "80px";

const slots = new Map<HTMLCanvasElement, Slot>();
const palette = createPalette();

let renderer: THREE.WebGLRenderer | null = null;
let contextLost = false;
let frameRequest = 0;
let lastFrame = 0;
/** Seconds of animation played so far. Stops while paused. */
let clock = 0;
/** Until when the theme's colour tokens are still cross-fading. */
let fadingUntil = 0;
let observers: { sight: IntersectionObserver; size: ResizeObserver } | null = null;
let detach: (() => void) | null = null;

const playing = () => !motionPaused() && !document.hidden;
const fading = (now: number) => now < fadingUntil;

function fitRenderer(width: number, height: number) {
  if (!renderer) return;
  const size = renderer.getSize(new THREE.Vector2());
  // Grow only: every figure draws into the same corner of one canvas.
  if (width > size.x || height > size.y) {
    renderer.setSize(Math.max(width, size.x), Math.max(height, size.y), false);
  }
}

function paint(slot: Slot, step: number) {
  const { canvas, context } = slot;
  const { width, height } = canvas;
  if (!renderer || contextLost || width === 0 || height === 0) return;

  if (slot.stage && slot.stale) {
    disposeStage(slot.stage);
    slot.stage = null;
  }
  slot.stage ??= createStage(SCENES[slot.id], palette);
  slot.stale = false;

  // The camera eases after the pointer while playing, and sits square otherwise.
  const follow = playing() ? 1 - Math.exp(-step * 6) : 1;
  const aim = playing() ? slot.aim : { x: 0, y: 0 };
  slot.tilt.x += (aim.x - slot.tilt.x) * follow;
  slot.tilt.y += (aim.y - slot.tilt.y) * follow;

  fitRenderer(width, height);
  // Every scene opens on its still frame and plays on from there.
  const t = clock + (slot.stage.vignette.still ?? 0);
  drawStage(renderer, slot.stage, width, height, t, slot.tilt.x, slot.tilt.y);

  const source = renderer.domElement;
  context.clearRect(0, 0, width, height);
  // WebGL's origin is the bottom-left corner; a canvas image's is the top-left.
  context.drawImage(source, 0, source.height - height, width, height, 0, 0, width, height);

  slot.dirty = false;
  if (!slot.painted) {
    slot.painted = true;
    slot.onFirstFrame();
  }
}

function wantsFrame(now: number) {
  for (const slot of slots.values()) {
    if (slot.visible && (slot.dirty || playing() || fading(now))) return true;
  }
  return false;
}

function requestFrame() {
  if (frameRequest === 0 && wantsFrame(performance.now())) {
    frameRequest = requestAnimationFrame(frame);
  }
}

function frame(now: number) {
  frameRequest = 0;
  const step = Math.min((now - lastFrame) / 1000, MAX_STEP);
  lastFrame = now;
  if (playing()) clock += step;

  const recolour = fadingUntil !== 0;
  if (recolour) {
    readPalette(palette);
    if (!fading(now)) {
      // The fade has landed: rebuild, for any colour a scene derived instead of sharing.
      fadingUntil = 0;
      for (const slot of slots.values()) {
        slot.stale = true;
        slot.dirty = true;
      }
    }
  }

  for (const slot of slots.values()) {
    if (slot.visible && (slot.dirty || recolour || playing())) paint(slot, step);
  }
  requestFrame();
}

/** The backing size of a figure's canvas follows its box on the page. */
function resize(slot: Slot, cssWidth: number, cssHeight: number) {
  const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
  const width = Math.round(cssWidth * ratio);
  const height = Math.round(cssHeight * ratio);
  if (slot.canvas.width === width && slot.canvas.height === height) return;
  slot.canvas.width = width;
  slot.canvas.height = height;
  slot.dirty = true;
  // Resizing a canvas clears it, so redraw before the browser paints.
  if (slot.visible) paint(slot, 0);
}

function start(): boolean {
  renderer = createRenderer();
  if (!renderer) return false;

  const source = renderer.domElement;
  const onLost = (event: Event) => {
    // Lets the browser hand the context back.
    event.preventDefault();
    contextLost = true;
  };
  const onRestored = () => {
    contextLost = false;
    wake();
  };
  source.addEventListener("webglcontextlost", onLost);
  source.addEventListener("webglcontextrestored", onRestored);

  readPalette(palette);
  const stopTheme = subscribeTheme(() => {
    // The tokens cross-fade for a moment; follow them until they settle.
    fadingUntil = performance.now() + THEME_FADE_MS + 100;
    requestFrame();
  });
  const stopMotion = subscribeMotion(wake);
  document.addEventListener("visibilitychange", wake);

  observers = {
    sight: new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const slot = slots.get(entry.target as HTMLCanvasElement);
          if (!slot) continue;
          slot.visible = entry.isIntersecting;
          if (slot.visible) slot.dirty = true;
        }
        requestFrame();
      },
      { rootMargin: VISIBLE_MARGIN },
    ),
    size: new ResizeObserver((entries) => {
      for (const entry of entries) {
        const slot = slots.get(entry.target as HTMLCanvasElement);
        if (slot) resize(slot, entry.contentRect.width, entry.contentRect.height);
      }
    }),
  };

  detach = () => {
    source.removeEventListener("webglcontextlost", onLost);
    source.removeEventListener("webglcontextrestored", onRestored);
    stopTheme();
    stopMotion();
    document.removeEventListener("visibilitychange", wake);
  };
  return true;
}

/** Redraw every figure once and resume the loop if anything should be moving. */
function wake() {
  for (const slot of slots.values()) slot.dirty = true;
  // Skip the time spent idle rather than playing it back in one step.
  lastFrame = performance.now();
  requestFrame();
}

function stop() {
  cancelAnimationFrame(frameRequest);
  frameRequest = 0;
  observers?.sight.disconnect();
  observers?.size.disconnect();
  observers = null;
  detach?.();
  detach = null;
  renderer?.dispose();
  renderer?.forceContextLoss();
  renderer = null;
  contextLost = false;
}

/**
 * Starts drawing the vignette for `id` on `canvas`, sized by the canvas's CSS
 * box. Returns null when WebGL is not available. `onFirstFrame` runs once the
 * canvas holds a picture.
 */
export function mountVignette(canvas: HTMLCanvasElement, id: VignetteId, onFirstFrame: () => void): Mounted | null {
  const context = canvas.getContext("2d");
  if (!context) return null;
  if (!renderer && !start()) return null;

  const slot: Slot = {
    id,
    canvas,
    context,
    stage: null,
    stale: false,
    visible: false,
    dirty: true,
    painted: false,
    aim: { x: 0, y: 0 },
    tilt: { x: 0, y: 0 },
    onFirstFrame,
  };
  slots.set(canvas, slot);
  observers?.size.observe(canvas);
  observers?.sight.observe(canvas);

  return {
    point(position) {
      slot.aim = position ?? { x: 0, y: 0 };
    },
    unmount() {
      observers?.size.unobserve(canvas);
      observers?.sight.unobserve(canvas);
      if (slot.stage) disposeStage(slot.stage);
      slots.delete(canvas);
      // The last figure gone (a page change): give the WebGL context back.
      if (slots.size === 0) stop();
    },
  };
}
