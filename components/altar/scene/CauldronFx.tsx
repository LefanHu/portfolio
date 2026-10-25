"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { CAULDRON } from "@/lib/altar/layout";
import { LIGHT_DECAY, PALETTE, type Vec3 } from "@/lib/altar/theme";
import { mulberry32, softDotTexture } from "./geo";
import { mood } from "./liveMood";
import { live } from "./liveTheme";
import { setProp, Std } from "./Std";

// The cauldron's magic. Everything here outputs HDR (toneMapped: false) so it
// blooms. Local space: y = 0 is the basin base.

const energyVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const energyFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uCore;
  uniform float uIntensity;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);
    float a = atan(p.y, p.x);
    // two counter-rotating spiral arms + a slow churn
    float s1 = sin(a * 3.0 + r * 9.0 - uTime * 2.2);
    float s2 = sin(a * 5.0 - r * 13.0 + uTime * 1.3);
    float swirl = smoothstep(0.2, 1.0, s1 * 0.6 + s2 * 0.4 + 0.25);
    float core = smoothstep(0.75, 0.0, r);
    float edge = smoothstep(0.7, 1.0, r);
    vec3 c = mix(uColor * 0.55, uColor, swirl);
    c = mix(c, uCore, core * 0.65 + swirl * core * 0.35);
    c += uColor * edge * 0.6; // brighter where it meets the stone
    gl_FragColor = vec4(c * uIntensity, 1.0);
  }
`;

const spillFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uDown; // 1 = fade downward (outer spill), 0 = fade upward (rim haze)
  varying vec2 vUv;
  void main() {
    float v = mix(vUv.y, 1.0 - vUv.y, uDown);
    float fade = pow(1.0 - v, 2.2);
    float streak = 0.65 + 0.35 * sin(vUv.x * 62.83 + uTime * (uDown > 0.5 ? 0.6 : 1.7) + vUv.y * 6.0);
    gl_FragColor = vec4(uColor * fade * streak * uOpacity, 1.0);
  }
`;

function EnergySurface() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: live.rune.color.clone() },
          uCore: { value: live.cauldron.energyCore.clone() },
          uIntensity: { value: live.cauldron.energyIntensity },
        },
        vertexShader: energyVertex,
        fragmentShader: energyFragment,
        toneMapped: false,
      }),
    [],
  );
  useFrame(({ clock }) => {
    const u = mat.uniforms;
    const t = clock.elapsedTime;
    // swirl time runs faster while the cauldron spins up
    setProp(u.uTime, "value", mood.swirlT);
    u.uColor.value.copy(mood.color);
    u.uCore.value.copy(mood.core);
    setProp(u.uIntensity, "value", live.cauldron.energyIntensity * mood.glow * (0.92 + 0.08 * Math.sin(t * 1.8)));
  });
  return (
    <mesh material={mat} position={[0, CAULDRON.energyY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[CAULDRON.rimInner + 0.06, 40]} />
    </mesh>
  );
}

function makeSpillMaterial(down: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: live.rune.color.clone() },
      uOpacity: { value: live.cauldron.spillOpacity },
      uDown: { value: down },
    },
    vertexShader: energyVertex,
    fragmentShader: spillFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
}

function Spill() {
  const haze = useMemo(() => makeSpillMaterial(0), []);
  const drip = useMemo(() => makeSpillMaterial(1), []);
  useFrame(({ clock }) => {
    for (const m of [haze, drip]) {
      const u = m.uniforms;
      setProp(u.uTime, "value", clock.elapsedTime);
      u.uColor.value.copy(mood.color);
      setProp(u.uOpacity, "value", live.cauldron.spillOpacity * mood.glow);
    }
  });
  return (
    <>
      {/* haze rising off the surface, just inside the lip */}
      <mesh material={haze} position={[0, CAULDRON.energyY + 0.45, 0]} renderOrder={3}>
        <cylinderGeometry args={[CAULDRON.rimInner + 0.02, CAULDRON.rimInner + 0.1, 0.9, 20, 1, true]} />
      </mesh>
      {/* glow spilling down the outside of the bowl */}
      <mesh material={drip} position={[0, 1.42, 0]} renderOrder={3}>
        <cylinderGeometry args={[1.82, 1.7, 0.75, 20, 1, true]} />
      </mesh>
    </>
  );
}

type Ember = { a: number; r: number; speed: number; spin: number; life: number; hot: boolean };

const EMBER_RISE = 3.2;

function stepEmbers(geo: THREE.BufferGeometry, seed: Ember[], delta: number) {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const col = geo.attributes.color as THREE.BufferAttribute;
  const color = mood.color;
  const core = mood.core;
  const intensity = live.cauldron.emberIntensity * mood.glow;
  for (let i = 0; i < seed.length; i++) {
    const s = seed[i];
    s.life += (delta * s.speed) / EMBER_RISE;
    if (s.life > 1) s.life -= 1;
    const h = s.life * EMBER_RISE;
    const a = s.a + s.spin * h;
    const r = s.r * (1 + h * 0.35);
    pos.setXYZ(i, Math.cos(a) * r, CAULDRON.energyY + 0.05 + h, Math.sin(a) * r);
    // fade in fast, fade out slow; additive, so darker == more transparent
    const f = Math.min(1, s.life * 8) * Math.pow(1 - s.life, 1.4) * intensity;
    const c = s.hot ? core : color;
    col.setXYZ(i, c.r * f, c.g * f, c.b * f);
  }
  pos.needsUpdate = true;
  col.needsUpdate = true;
}

function Embers({ count = 220 }: { count?: number }) {
  const { geo, seed } = useMemo(() => {
    const rnd = mulberry32(555);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    const s: Ember[] = Array.from({ length: count }, () => ({
      a: rnd() * Math.PI * 2,
      r: Math.sqrt(rnd()) * (CAULDRON.rimInner - 0.15),
      speed: 0.45 + rnd() * 0.9,
      spin: (rnd() - 0.5) * 1.6,
      life: rnd(),
      hot: rnd() > 0.7,
    }));
    return { geo: g, seed: s };
  }, [count]);
  const mat = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.12,
        sizeAttenuation: true,
        map: softDotTexture(),
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );
  // embers rise with the swirl (faster during a surge)
  const last = useRef(mood.swirlT);
  useFrame(() => {
    const d = Math.min(mood.swirlT - last.current, 0.15);
    last.current = mood.swirlT;
    stepEmbers(geo, seed, Math.max(d, 0));
  });
  return <points geometry={geo} material={mat} frustumCulled={false} />;
}

/** Swirling energy, spill/haze shells, rising embers and the cauldron's point light. */
export function CauldronMagic() {
  const glow = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!glow.current) return;
    glow.current.color.copy(mood.lightColor);
    glow.current.intensity =
      live.cauldron.lightIntensity * mood.lightGlow * (0.9 + 0.1 * Math.sin(t * 1.8) + 0.04 * Math.sin(t * 13));
    glow.current.distance = live.cauldron.lightDistance;
  });
  return (
    <>
      <EnergySurface />
      <Spill />
      <Embers />
      <pointLight ref={glow} position={[0, 2.4, 0]} decay={LIGHT_DECAY.cauldron} />
    </>
  );
}

/** Stone brazier with a flickering rune-coloured flame. */
export function Brazier({ position }: { position: Vec3 }) {
  const flame = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );
  const flames = useRef<THREE.Group>(null);
  const phase = position[0] * 3.1 + position[2];
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + phase;
    flame.color.copy(mood.color).multiplyScalar(live.cauldron.brazierIntensity * mood.glow);
    if (flames.current) {
      // flames leap during a surge
      flames.current.scale.y = 1 + 0.6 * mood.flash + 0.18 * Math.sin(t * 9) + 0.1 * Math.sin(t * 15.7);
      flames.current.rotation.y = t * 1.5;
    }
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.14, 0.22, 0.64, 6]} />
        <Std color={PALETTE.stone} />
      </mesh>
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.16, 0.16, 6]} />
        <Std color={PALETTE.stoneDark} />
      </mesh>
      <group ref={flames} position={[0, 0.78, 0]}>
        <mesh material={flame} position={[0, 0.2, 0]}>
          <coneGeometry args={[0.17, 0.42, 5]} />
        </mesh>
        <mesh material={flame} position={[0.05, 0.13, 0.03]} rotation={[0, 0.6, 0.2]}>
          <coneGeometry args={[0.1, 0.26, 4]} />
        </mesh>
      </group>
    </group>
  );
}

/** Pulsing emissive material for rune rings, glyphs, inlays and fragment seams. */
export function useRuneMaterial() {
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0b1a20",
        emissive: live.rune.color.clone(),
        emissiveIntensity: live.rune.emissiveBase,
        flatShading: true,
        roughness: 0.6,
      }),
    [],
  );
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    mat.emissive.copy(mood.color);
    setProp(
      mat,
      "emissiveIntensity",
      (live.rune.emissiveBase + live.rune.emissivePulse * (0.5 + 0.5 * Math.sin(t * 1.8))) * mood.glow,
    );
  });
  return mat;
}
