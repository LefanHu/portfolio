"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { ALTAR_POS, CAULDRON } from "@/lib/altar/layout";
import { PANEL_CENTER, PANEL_SIZE } from "@/lib/altar/projection";
import type { Theme } from "@/lib/altar/store";
import { CAMERA, THEMES, THEME_TRANSITION_S } from "@/lib/altar/theme";
import { mulberry32 } from "../scene/geo";
import { POINT_SIZE_GLSL, pointUniforms, updatePointUniforms, type PointUniforms } from "../scene/pointSize";
import { setProp } from "../scene/Std";
import type { PanelStage } from "./SectionPanel";

// The three.js half of a projection: a glowing frame with accent corner
// brackets around the DOM pane, a beam from the cauldron, and rising sparks.
// Everything is HDR in the dark theme so it blooms; ink-like in the light one.

const INK = new THREE.Color("#1b2836");
/** Exponential approach rate for theme cross-fades (≈ THEME_TRANSITION_S to settle). */
const THEME_RATE = 3 / THEME_TRANSITION_S;
const _c = new THREE.Color();
const _p = new THREE.Vector3();

function ease(t: number) {
  const k = THREE.MathUtils.clamp(t, 0, 1);
  return 1 - Math.pow(1 - k, 3);
}

/** How strongly the effects run per stage (frame/brackets opacity, beam, spark rate). */
function activityFor(stage: PanelStage, viewing: boolean) {
  if (stage === "dissolve") return 0;
  return viewing ? 0.45 : 1;
}

interface FxProps {
  stage: PanelStage;
  /** Phase is viewing (calmer effects). */
  viewing: boolean;
  accent: string;
  theme: Theme;
}

/** Shared per-frame state: draw-in progress and smoothed activity. */
function useFxClock(stage: PanelStage, viewing: boolean) {
  const start = useRef<number | null>(null);
  const activity = useRef(0);
  const lastStage = useRef<PanelStage | null>(null);
  return (t: number, dt: number) => {
    if (stage === "wire" && lastStage.current !== "wire") start.current = t;
    if (start.current === null) start.current = t - 10; // mounted mid-cycle: fully drawn
    lastStage.current = stage;
    const target = activityFor(stage, viewing);
    const rate = stage === "dissolve" ? 3.5 : 2.5;
    activity.current += (target - activity.current) * (1 - Math.exp(-dt * rate));
    return { drawn: t - start.current, activity: activity.current };
  };
}

/* ------------------------------------------------------------------ frame */

const PAD = 0.035;
const BRACKET_PAD = 0.075;
const BRACKET_ARM = 0.2;
/** On-screen line thickness in px, kept constant at any camera distance. */
const LINE_PX = 1.6;

/** Outline + corner brackets in panel-local space (the pane spans ±W/2, ±H/2). */
export function ProjectionFrame({ stage, viewing, accent, theme }: FxProps) {
  const line = useMemo(
    () => new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, depthWrite: false, fog: false }),
    [],
  );
  const bracket = useMemo(
    () => new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, depthWrite: false, fog: false }),
    [],
  );
  const unit = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  useEffect(
    () => () => {
      line.dispose();
      bracket.dispose();
      unit.dispose();
    },
    [line, bracket, unit],
  );
  const lineColor = useRef(new THREE.Color());
  const bracketColor = useRef(new THREE.Color());
  const first = useRef(true);
  const clock = useFxClock(stage, viewing);
  const edges = useRef<THREE.Mesh[]>([]);
  const arms = useRef<THREE.Mesh[]>([]);
  const group = useRef<THREE.Group>(null);

  const W = PANEL_SIZE.width / 2 + PAD;
  const H = PANEL_SIZE.height / 2 + PAD;
  const BW = PANEL_SIZE.width / 2 + BRACKET_PAD;
  const BH = PANEL_SIZE.height / 2 + BRACKET_PAD;
  // [x, y, horizontal?, length, sign along its length (draw direction)]
  const edgeDefs: [number, number, boolean, number, number][] = [
    [0, H, true, 2 * W, 1],
    [W, 0, false, 2 * H, -1],
    [0, -H, true, 2 * W, -1],
    [-W, 0, false, 2 * H, 1],
  ];
  const corners: [number, number][] = [
    [-1, 1],
    [1, 1],
    [1, -1],
    [-1, -1],
  ];

  useFrame(({ clock: c, camera, size }, delta) => {
    const dt = Math.min(delta, 0.1);
    const { drawn, activity } = clock(c.elapsedTime, dt);
    const p = THEMES[theme].projection;
    const dark = theme === "dark";
    // colors: theme line (boosted in dark) and the recipe accent
    _c.set(p.line).multiplyScalar(dark ? p.lineBoost * 0.8 : 1);
    const k = first.current ? 1 : 1 - Math.exp(-dt * THEME_RATE);
    lineColor.current.lerp(_c, k);
    _c.set(accent);
    if (dark) _c.multiplyScalar(2.4);
    else _c.lerp(INK, 0.5);
    bracketColor.current.lerp(_c, k);
    first.current = false;
    line.color.copy(lineColor.current);
    bracket.color.copy(bracketColor.current);
    const fade = stage === "dissolve" ? activity : Math.max(activity, 0.6);
    setProp(line, "opacity", (dark ? 0.85 : 0.7) * fade);
    setProp(bracket, "opacity", fade);

    // constant on-screen thickness
    const g = group.current;
    if (!g) return;
    g.getWorldPosition(_p);
    const dist = _p.distanceTo(camera.position);
    const fov = (camera as THREE.PerspectiveCamera).fov ?? 32;
    const worldPerPx = (2 * dist * Math.tan((fov * Math.PI) / 360)) / Math.max(size.height, 1);
    const th = LINE_PX * worldPerPx;

    // draw-in: brackets pop first, then the outline runs around
    const pop = ease(drawn / 0.35);
    const run = ease((drawn - 0.15) / 0.75);
    edges.current.forEach((m, i) => {
      if (!m) return;
      const [x, y, horiz, len, sign] = edgeDefs[i];
      const l = Math.max(len * run, 1e-4);
      const off = (sign * (len - l)) / 2;
      if (horiz) {
        m.position.set(x - off, y, 0);
        m.scale.set(l + th, th, 1);
      } else {
        m.position.set(x, y + off, 0);
        m.scale.set(th, l, 1);
      }
    });
    const bt = th * (dark ? 2 : 2.6);
    arms.current.forEach((m, i) => {
      if (!m) return;
      const [sx, sy] = corners[Math.floor(i / 2)];
      const arm = BRACKET_ARM * pop;
      if (i % 2 === 0) {
        m.position.set(sx * BW - (sx * arm) / 2, sy * BH, 0);
        m.scale.set(Math.max(arm, 1e-4), bt, 1);
      } else {
        m.position.set(sx * BW, sy * BH - (sy * arm) / 2, 0);
        m.scale.set(bt, Math.max(arm, 1e-4), 1);
      }
    });
    const swell = stage === "dissolve" ? 1 + (1 - activity) * 0.04 : 1;
    g.scale.setScalar(swell);
  });

  return (
    <group ref={group} position={[0, 0, -0.002]}>
      {edgeDefs.map((_, i) => (
        <mesh
          key={`e${i}`}
          ref={(m) => {
            if (m) edges.current[i] = m;
          }}
          geometry={unit}
          material={line}
          renderOrder={5}
        />
      ))}
      {corners.flatMap((_, ci) =>
        [0, 1].map((j) => (
          <mesh
            key={`b${ci}${j}`}
            ref={(m) => {
              if (m) arms.current[ci * 2 + j] = m;
            }}
            geometry={unit}
            material={bracket}
            renderOrder={5}
          />
        )),
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ beam + sparks (world space) */

/** World y of the cauldron's energy surface. */
const SURFACE_Y = ALTAR_POS[1] + CAULDRON.basinBase + CAULDRON.energyY;
const BEAM_TOP = PANEL_CENTER[1] - PANEL_SIZE.height / 2 - 0.05;
const BEAM_H = BEAM_TOP - SURFACE_Y;

const beamVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const beamFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    float up = vUv.y;
    float body = pow(1.0 - up, 1.4) * 0.75 + smoothstep(0.75, 1.0, up) * 0.45;
    float streak = 0.55 + 0.45 * sin(vUv.x * 75.4 + uTime * 0.7) * sin(vUv.x * 31.4 - uTime * 0.45);
    float rise = 0.75 + 0.25 * sin(up * 18.0 - uTime * 4.0);
    gl_FragColor = vec4(uColor, uOpacity * body * streak * rise);
  }
`;

const sparkVertex = /* glsl */ `
  attribute vec4 aSeed; // angle, start radius, speed, phase
  uniform float uTime;
  uniform float uHeight;
  uniform float uSpread;
  ${POINT_SIZE_GLSL}
  uniform float uSize;
  varying float vAlpha;
  void main() {
    float life = fract(aSeed.w + uTime * aSeed.z);
    float h = life * uHeight;
    float a = aSeed.x + life * (1.5 + aSeed.z * 2.0);
    float r = mix(aSeed.y, uSpread * (0.35 + 0.65 * fract(aSeed.x * 7.13)), smoothstep(0.0, 1.0, life));
    vec3 p = vec3(cos(a) * r, h, sin(a) * r);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = min(uSize * (0.6 + 0.8 * fract(aSeed.y * 13.7)) * uScale / -mv.z, uMaxSize);
    vAlpha = smoothstep(0.0, 0.08, life) * (1.0 - smoothstep(0.7, 1.0, life));
  }
`;
const sparkFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uActivity;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float disc = 1.0 - smoothstep(0.0, 0.5, d);
    gl_FragColor = vec4(uColor, disc * disc * vAlpha * uActivity);
  }
`;

const SPARKS = 220;
/**
 * Spark world size. The scale used to be height / 2 (CSS px, no DPR) with size
 * 0.07; with the world-accurate scale (height / (2·tan(fov/2))) this keeps the
 * same size at dpr 1, and DPR now applies.
 */
const SPARK_SIZE = 0.07 * Math.tan((CAMERA.fov * Math.PI) / 360);

/** The beam and the sparks rising from the cauldron to the pane (world space). */
export function ProjectionBeam({ stage, viewing, accent, theme }: FxProps) {
  const beam = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color() }, uOpacity: { value: 0 } },
        vertexShader: beamVertex,
        fragmentShader: beamFragment,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    [],
  );
  const sparks = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uHeight: { value: BEAM_H },
          uSpread: { value: PANEL_SIZE.width * 0.45 },
          ...pointUniforms(),
          uSize: { value: SPARK_SIZE },
          uColor: { value: new THREE.Color() },
          uActivity: { value: 0 },
        },
        vertexShader: sparkVertex,
        fragmentShader: sparkFragment,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );
  const geo = useMemo(() => {
    const rnd = mulberry32(4242);
    const seeds = new Float32Array(SPARKS * 4);
    for (let i = 0; i < SPARKS; i++) {
      seeds[i * 4] = rnd() * Math.PI * 2;
      seeds[i * 4 + 1] = Math.sqrt(rnd()) * (CAULDRON.rimInner - 0.2);
      seeds[i * 4 + 2] = 0.35 + rnd() * 0.45;
      seeds[i * 4 + 3] = rnd();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(SPARKS * 3), 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
    return g;
  }, []);
  useEffect(
    () => () => {
      beam.dispose();
      sparks.dispose();
      geo.dispose();
    },
    [beam, sparks, geo],
  );
  const color = useRef(new THREE.Color());
  const first = useRef(true);
  const clock = useFxClock(stage, viewing);

  useFrame(({ clock: c, camera, gl, size }, delta) => {
    const dt = Math.min(delta, 0.1);
    const t = c.elapsedTime;
    const { activity } = clock(t, dt);
    const dark = theme === "dark";
    _c.set(accent);
    if (dark) _c.multiplyScalar(1.8);
    else _c.lerp(INK, 0.3);
    color.current.lerp(_c, first.current ? 1 : 1 - Math.exp(-dt * THEME_RATE));
    first.current = false;
    const blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
    for (const m of [beam, sparks]) {
      if (m.blending !== blending) {
        m.blending = blending;
        m.needsUpdate = true;
      }
    }
    const bu = beam.uniforms;
    setProp(bu.uTime, "value", t);
    bu.uColor.value.copy(color.current);
    setProp(bu.uOpacity, "value", (dark ? 0.22 : 0.16) * activity);
    const su = sparks.uniforms;
    setProp(su.uTime, "value", t);
    su.uColor.value.copy(color.current);
    setProp(su.uActivity, "value", (dark ? 1 : 0.85) * activity);
    updatePointUniforms(su as unknown as PointUniforms, gl, camera, size.height);
  });

  return (
    <group position={[ALTAR_POS[0], SURFACE_Y, ALTAR_POS[2]]}>
      <mesh material={beam} position={[0, BEAM_H / 2, 0]} renderOrder={4}>
        <cylinderGeometry args={[PANEL_SIZE.width * 0.42, CAULDRON.rimInner - 0.1, BEAM_H, 24, 1, true]} />
      </mesh>
      <points geometry={geo} material={sparks} frustumCulled={false} renderOrder={6} />
    </group>
  );
}
