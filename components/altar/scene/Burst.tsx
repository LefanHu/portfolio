"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { CAULDRON } from "@/lib/altar/layout";
import { emits, mood } from "./liveMood";
import { live, themeMix } from "./liveTheme";
import { POINT_SIZE_GLSL, pointUniforms, updatePointUniforms, type PointUniforms } from "./pointSize";

// One-shot cauldron effects, fed by liveMood's `emits`: a ripple and an ember
// puff where an item lands, a bright fountain + shockwave for a valid pair, and
// a sputter (neutral sparks + smoke) for an eject. Basin-local space (y = 0 is
// the basin base). Pools are preallocated; nothing allocates per frame.

const SURFACE = CAULDRON.energyY;
const SPARKS = 150;
const SMOKE = 36;
const RINGS = 4;

const pointsVertex = /* glsl */ `
  attribute vec3 aColor;
  attribute float aAlpha;
  attribute float aSize;
  ${POINT_SIZE_GLSL}
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vColor = aColor;
    vAlpha = aAlpha;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = min(aSize * uScale / max(-mv.z, 0.1), uMaxSize);
  }
`;
const pointsFragment = /* glsl */ `
  uniform float uSoft;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0 || vAlpha <= 0.0) discard;
    float a = pow(1.0 - d, uSoft);
    gl_FragColor = vec4(vColor, vAlpha * a);
  }
`;

function pointsMaterial(blending: THREE.Blending, soft: number) {
  return new THREE.ShaderMaterial({
    uniforms: { ...pointUniforms(), uSoft: { value: soft } },
    vertexShader: pointsVertex,
    fragmentShader: pointsFragment,
    transparent: true,
    depthWrite: false,
    blending,
    toneMapped: false,
  });
}

/** CPU particle pool: preallocated typed arrays, oldest slot reused first. */
class Pool {
  readonly geo = new THREE.BufferGeometry();
  readonly pos: Float32Array;
  readonly col: Float32Array;
  readonly alpha: Float32Array;
  readonly size: Float32Array;
  readonly vel: Float32Array;
  readonly base: Float32Array;
  readonly age: Float32Array;
  readonly span: Float32Array;
  readonly size0: Float32Array;
  readonly grav: Float32Array;
  readonly drag: Float32Array;
  private readonly attrs: THREE.BufferAttribute[];
  private next = 0;
  /** Some particle is (or may be) alive. */
  active = false;
  constructor(
    readonly n: number,
    readonly kind: "spark" | "smoke",
  ) {
    this.pos = new Float32Array(n * 3);
    this.col = new Float32Array(n * 3);
    this.alpha = new Float32Array(n);
    this.size = new Float32Array(n);
    this.vel = new Float32Array(n * 3);
    this.base = new Float32Array(n * 3);
    this.age = new Float32Array(n).fill(1);
    this.span = new Float32Array(n).fill(1);
    this.size0 = new Float32Array(n);
    this.grav = new Float32Array(n);
    this.drag = new Float32Array(n);
    this.attrs = [
      new THREE.BufferAttribute(this.pos, 3),
      new THREE.BufferAttribute(this.col, 3),
      new THREE.BufferAttribute(this.alpha, 1),
      new THREE.BufferAttribute(this.size, 1),
    ];
    ["position", "aColor", "aAlpha", "aSize"].forEach((name, i) => this.geo.setAttribute(name, this.attrs[i]));
  }
  emit(
    x: number,
    y: number,
    z: number,
    vx: number,
    vy: number,
    vz: number,
    c: THREE.Color,
    span: number,
    size: number,
    grav: number,
    drag: number,
  ) {
    const i = this.next;
    const j = i * 3;
    this.next = (i + 1) % this.n;
    this.pos[j] = x;
    this.pos[j + 1] = y;
    this.pos[j + 2] = z;
    this.vel[j] = vx;
    this.vel[j + 1] = vy;
    this.vel[j + 2] = vz;
    this.base[j] = c.r;
    this.base[j + 1] = c.g;
    this.base[j + 2] = c.b;
    this.age[i] = 0;
    this.span[i] = span;
    this.size0[i] = size;
    this.grav[i] = grav;
    this.drag[i] = drag;
    this.active = true;
  }
  /**
   * Integrate and shade; returns whether anything is still alive. Sparks scale
   * their colour by `glow`; smoke uses `tone` at `opacity`.
   */
  step(dt: number, glow: number, tone?: THREE.Color, opacity = 1): boolean {
    if (!this.active) return false;
    let alive = 0;
    for (let i = 0; i < this.n; i++) {
      const j = i * 3;
      if (this.age[i] >= this.span[i]) {
        this.alpha[i] = 0;
        this.size[i] = 0;
        continue;
      }
      this.age[i] += dt;
      const damp = Math.max(0, 1 - this.drag[i] * dt);
      this.vel[j] *= damp;
      this.vel[j + 1] = (this.vel[j + 1] - this.grav[i] * dt) * damp;
      this.vel[j + 2] *= damp;
      this.pos[j] += this.vel[j] * dt;
      this.pos[j + 1] += this.vel[j + 1] * dt;
      this.pos[j + 2] += this.vel[j + 2] * dt;
      const k = Math.min(1, this.age[i] / this.span[i]);
      if (this.kind === "spark") {
        // additive: darker == more transparent
        const f = Math.min(1, k * 14) * Math.pow(1 - k, 1.5) * glow;
        this.col[j] = this.base[j] * f;
        this.col[j + 1] = this.base[j + 1] * f;
        this.col[j + 2] = this.base[j + 2] * f;
        this.alpha[i] = 1;
        this.size[i] = this.size0[i] * (1 - 0.5 * k);
      } else if (tone) {
        this.col[j] = tone.r;
        this.col[j + 1] = tone.g;
        this.col[j + 2] = tone.b;
        this.alpha[i] = opacity * Math.min(1, k * 7) * Math.pow(1 - k, 1.3);
        this.size[i] = this.size0[i] * (1 + 2.4 * Math.sqrt(k));
      }
      alive++;
    }
    for (const a of this.attrs) a.needsUpdate = true;
    this.active = alive > 0;
    return this.active;
  }
}

interface Ring {
  mesh: THREE.Mesh | null;
  mat: THREE.MeshBasicMaterial;
  color: THREE.Color;
  age: number;
  span: number;
  r0: number;
  r1: number;
  vy: number;
  peak: number;
}

/** Expanding flat shockwave rings, reused round-robin. */
class Rings {
  readonly geo = new THREE.RingGeometry(0.88, 1, 48, 1);
  readonly list: Ring[] = Array.from({ length: RINGS }, () => ({
    mesh: null,
    mat: new THREE.MeshBasicMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      side: THREE.DoubleSide,
    }),
    color: new THREE.Color(),
    age: 1,
    span: 1,
    r0: 0,
    r1: 1,
    vy: 0,
    peak: 1,
  }));
  private next = 0;
  fire(x: number, y: number, z: number, c: THREE.Color, r0: number, r1: number, span: number, vy: number, peak: number) {
    const r = this.list[this.next];
    this.next = (this.next + 1) % RINGS;
    r.color.copy(c);
    r.age = 0;
    r.span = span;
    r.r0 = r0;
    r.r1 = r1;
    r.vy = vy;
    r.peak = peak;
    r.mesh?.position.set(x, y, z);
  }
  step(dt: number, glow: number) {
    for (const r of this.list) {
      const mesh = r.mesh;
      if (!mesh) continue;
      if (r.age >= r.span) {
        mesh.visible = false;
        continue;
      }
      r.age += dt;
      const k = Math.min(1, r.age / r.span);
      mesh.visible = true;
      mesh.scale.setScalar(THREE.MathUtils.lerp(r.r0, r.r1, 1 - Math.pow(1 - k, 3)));
      mesh.position.y += r.vy * dt;
      r.mat.color.copy(r.color).multiplyScalar(glow * r.peak * Math.pow(1 - k, 2) * Math.min(1, k * 10));
    }
  }
  dispose() {
    this.geo.dispose();
    for (const r of this.list) r.mat.dispose();
  }
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const _c = new THREE.Color();
const _smoke = new THREE.Color();
const SMOKE_DARK = new THREE.Color("#8a929e");
const SMOKE_LIGHT = new THREE.Color("#5a5e66");
/** Dull, desaturated ash: sputter sparks (dim) and smoke (tinted per theme). */
const NEUTRAL = new THREE.Color("#cfd1d4").multiplyScalar(0.45);

export default function Burst() {
  const sparks = useMemo(() => new Pool(SPARKS, "spark"), []);
  const smoke = useMemo(() => new Pool(SMOKE, "smoke"), []);
  const rings = useMemo(() => new Rings(), []);
  const sparkMat = useMemo(() => pointsMaterial(THREE.AdditiveBlending, 1.8), []);
  const smokeMat = useMemo(() => pointsMaterial(THREE.NormalBlending, 1), []);
  const sparkPts = useRef<THREE.Points>(null);
  const smokePts = useRef<THREE.Points>(null);

  useEffect(
    () => () => {
      sparks.geo.dispose();
      smoke.geo.dispose();
      rings.dispose();
      sparkMat.dispose();
      smokeMat.dispose();
    },
    [sparks, smoke, rings, sparkMat, smokeMat],
  );

  useFrame(({ camera, gl, size }, delta) => {
    const dt = Math.min(delta, 0.05);

    // splash: a ripple and an ember puff where an item landed
    for (let s = 0; s < emits.splashN; s++) {
      const e = emits.splashes[s];
      const lim = CAULDRON.rimInner - 0.25;
      const rr = Math.hypot(e.x, e.z);
      const f = rr > lim ? lim / rr : 1;
      const x = e.x * f;
      const z = e.z * f;
      rings.fire(x, SURFACE + 0.03, z, e.a, 0.12, Math.min(0.85, CAULDRON.rimInner - rr * f), 0.8, 0, 1);
      // a soft glow puff, then a spray of embers
      for (let i = 0; i < 3; i++) {
        _c.copy(i % 2 ? e.b : e.a).multiplyScalar(0.3);
        sparks.emit(x, SURFACE + 0.12 + i * 0.12, z, 0, 0.5, 0, _c, rand(0.4, 0.55), rand(0.8, 1.1), 0, 2);
      }
      for (let i = 0; i < 28; i++) {
        const a = rand(0, Math.PI * 2);
        const out = rand(0.3, 1.1);
        _c.copy(i % 2 ? e.b : e.a).multiplyScalar(1.5);
        sparks.emit(x, SURFACE + 0.08, z, Math.cos(a) * out, rand(2.2, 3.8), Math.sin(a) * out, _c, rand(0.7, 1.1), rand(0.1, 0.18), 4, 0.6);
      }
    }
    emits.splashN = 0;

    // surge: a fountain of accent embers and a shockwave that rises into the beam
    if (emits.surge) {
      emits.surge = false;
      const c = emits.surgeColor;
      rings.fire(0, SURFACE + 0.03, 0, c, 0.2, CAULDRON.rimInner + 0.05, 0.7, 0, 1.4);
      rings.fire(0, SURFACE + 0.25, 0, c, CAULDRON.rimInner, CAULDRON.rimInner + 1.1, 1.1, 1.6, 0.9);
      _c.copy(mood.core);
      for (let i = 0; i < 90; i++) {
        const a = rand(0, Math.PI * 2);
        const r = Math.sqrt(Math.random()) * (CAULDRON.rimInner - 0.15);
        const out = rand(0.2, 1.3);
        sparks.emit(Math.cos(a) * r, SURFACE + 0.05, Math.sin(a) * r, Math.cos(a) * out, rand(3.2, 7.2), Math.sin(a) * out, i % 4 === 0 ? _c : c, rand(0.9, 1.6), rand(0.1, 0.2), 1.4, 0.9);
      }
    }

    // sputter: dull neutral sparks and a puff of smoke
    if (emits.sputter) {
      emits.sputter = false;
      for (let i = 0; i < 28; i++) {
        const a = rand(0, Math.PI * 2);
        const out = rand(0.8, 2.6);
        sparks.emit(Math.cos(a) * 0.5, SURFACE + 0.1, Math.sin(a) * 0.5, Math.cos(a) * out, rand(1.6, 4.2), Math.sin(a) * out, NEUTRAL, rand(0.35, 0.8), rand(0.05, 0.09), 7, 0.4);
      }
      for (let i = 0; i < SMOKE; i++) {
        const a = rand(0, Math.PI * 2);
        const r = Math.sqrt(Math.random()) * (CAULDRON.rimInner - 0.3);
        const out = rand(0.1, 0.45);
        smoke.emit(Math.cos(a) * r, SURFACE + rand(0.05, 0.4), Math.sin(a) * r, Math.cos(a) * out, rand(0.5, 1.3), Math.sin(a) * out, NEUTRAL, rand(1.3, 2.3), rand(0.45, 0.75), -0.15, 0.8);
      }
    }

    const m = themeMix();
    const glow = live.cauldron.emberIntensity * 0.9;
    updatePointUniforms(sparkMat.uniforms as unknown as PointUniforms, gl, camera, size.height);
    updatePointUniforms(smokeMat.uniforms as unknown as PointUniforms, gl, camera, size.height);

    _smoke.copy(SMOKE_DARK).lerp(SMOKE_LIGHT, m);
    if (sparkPts.current) sparkPts.current.visible = sparks.step(dt, glow);
    if (smokePts.current) smokePts.current.visible = smoke.step(dt, 1, _smoke, THREE.MathUtils.lerp(0.5, 0.55, m));
    rings.step(dt, glow);
  });

  return (
    <>
      <points ref={sparkPts} geometry={sparks.geo} material={sparkMat} frustumCulled={false} renderOrder={4} visible={false} />
      <points ref={smokePts} geometry={smoke.geo} material={smokeMat} frustumCulled={false} renderOrder={5} visible={false} />
      {rings.list.map((r, i) => (
        <mesh
          key={i}
          ref={(m) => {
            r.mesh = m;
          }}
          geometry={rings.geo}
          material={r.mat}
          rotation={[-Math.PI / 2, 0, 0]}
          renderOrder={4}
          visible={false}
        />
      ))}
    </>
  );
}
