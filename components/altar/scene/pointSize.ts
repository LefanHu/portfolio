import * as THREE from "three";
import { maxPointSize, pointScale } from "@/lib/altar/points";

// Shared per-frame update for the custom point shaders' uScale / uMaxSize
// uniforms (see lib/altar/points.ts): DPR-correct and clamped to the driver cap.

export interface PointUniforms {
  uScale: THREE.IUniform<number>;
  uMaxSize: THREE.IUniform<number>;
}

/** Uniform entries for a ShaderMaterial; uScale/uMaxSize are set each frame by updatePointUniforms. */
export function pointUniforms(): PointUniforms {
  return { uScale: { value: 1 }, uMaxSize: { value: 64 } };
}

/** GLSL for the clamp: `gl_PointSize = min(size, uMaxSize);`. */
export const POINT_SIZE_GLSL = /* glsl */ `
  uniform float uScale;
  uniform float uMaxSize;
`;

const caps = new WeakMap<object, number>();

function capOf(gl: THREE.WebGLRenderer): number {
  const ctx = gl.getContext();
  let cap = caps.get(ctx);
  if (cap === undefined) {
    cap = maxPointSize(ctx.getParameter(ctx.ALIASED_POINT_SIZE_RANGE) as Float32Array | null);
    caps.set(ctx, cap);
  }
  return cap;
}

/** Call in useFrame with the R3F state. */
export function updatePointUniforms(
  u: PointUniforms,
  gl: THREE.WebGLRenderer,
  camera: THREE.Camera,
  cssHeight: number,
) {
  const fov = (camera as THREE.PerspectiveCamera).fov ?? 32;
  u.uScale.value = pointScale(cssHeight, gl.getPixelRatio(), fov);
  u.uMaxSize.value = capOf(gl);
}
