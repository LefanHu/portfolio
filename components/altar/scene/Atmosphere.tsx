"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useAltarStore } from "@/lib/altar/store";
import { SHADOWS, THEMES } from "@/lib/altar/theme";
import { mulberry32, softDotTexture } from "./geo";
import { connectMood, stepMood } from "./liveMood";
import { fadeToTheme, live, snapTheme, stepTheme } from "./liveTheme";
import { setProp } from "./Std";

/** Keeps `live` in step with the store theme: snaps on mount, cross-fades after. */
function ThemeDriver() {
  useEffect(() => {
    snapTheme(useAltarStore.getState().theme);
    return useAltarStore.subscribe((s, prev) => {
      if (s.theme !== prev.theme) fadeToTheme(s.theme);
    });
  }, []);
  useFrame((_, delta) => stepTheme(Math.min(delta, 0.1)));
  return null;
}

/** Keeps the cauldron's reaction (liveMood) in step with the store; steps right after the theme. */
function MoodDriver() {
  useEffect(() => connectMood(), []);
  useFrame((_, delta) => stepMood(delta));
  return null;
}

function Sky() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          top: { value: live.sky[0].clone() },
          horizon: { value: live.sky[1].clone() },
          bottom: { value: live.sky[2].clone() },
        },
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom;
          varying vec3 vDir;
          void main() {
            // The camera looks down ~21deg, so shift the "horizon" down to
            // land mid-frame; otherwise the whole view is below it.
            float h = vDir.y + 0.36;
            vec3 c = h > 0.0
              ? mix(horizon, top, pow(smoothstep(0.0, 0.32, h), 0.9))
              : mix(horizon, bottom, smoothstep(0.0, -0.3, h));
            gl_FragColor = vec4(c, 1.0);
          }
        `,
      }),
    [],
  );
  useFrame(() => {
    mat.uniforms.top.value.copy(live.sky[0]);
    mat.uniforms.horizon.value.copy(live.sky[1]);
    mat.uniforms.bottom.value.copy(live.sky[2]);
  });
  return (
    <mesh material={mat} renderOrder={-1}>
      <sphereGeometry args={[80, 32, 16]} />
    </mesh>
  );
}

function Lights() {
  const hemi = useRef<THREE.HemisphereLight>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const rim = useRef<THREE.DirectionalLight>(null);
  const under = useRef<THREE.DirectionalLight>(null);
  const fog = useRef<THREE.Fog>(null);

  useFrame(() => {
    if (fog.current) {
      fog.current.color.copy(live.fog);
      fog.current.near = live.fogNear;
      fog.current.far = live.fogFar;
    }
    if (hemi.current) {
      hemi.current.color.copy(live.hemisphere.sky);
      hemi.current.groundColor.copy(live.hemisphere.ground);
      hemi.current.intensity = live.hemisphere.intensity;
    }
    const dirs: [THREE.DirectionalLight | null, typeof live.sun][] = [
      [sun.current, live.sun],
      [rim.current, live.rim],
      [under.current, live.underFill],
    ];
    for (const [light, v] of dirs) {
      if (!light) continue;
      light.color.copy(v.color);
      light.intensity = v.intensity;
      light.position.copy(v.position);
    }
  });

  const e = SHADOWS.extent;
  const dark = THEMES.dark;
  return (
    <>
      <fog ref={fog} attach="fog" args={[dark.fog, dark.fogNear, dark.fogFar]} />
      <hemisphereLight ref={hemi} />
      {/* the sun (moon at night) casts every shadow in the scene */}
      <directionalLight
        ref={sun}
        castShadow
        shadow-mapSize={[SHADOWS.mapSize, SHADOWS.mapSize]}
        shadow-bias={SHADOWS.bias}
        shadow-normalBias={SHADOWS.normalBias}
        shadow-radius={SHADOWS.radius}
        shadow-camera-left={-e}
        shadow-camera-right={e}
        shadow-camera-top={e}
        shadow-camera-bottom={-e}
        shadow-camera-near={SHADOWS.near}
        shadow-camera-far={SHADOWS.far}
      />
      <directionalLight ref={rim} />
      {/* under-fill so the hanging rock reads instead of going to black */}
      <directionalLight ref={under} />
    </>
  );
}

function driftDust(geo: THREE.BufferGeometry, speeds: Float32Array, t: number, delta: number) {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const arr = pos.array as Float32Array;
  for (let i = 0; i < speeds.length; i++) {
    arr[i * 3 + 1] += speeds[i] * delta;
    arr[i * 3] += Math.sin(t * 0.3 + i) * 0.002;
    if (arr[i * 3 + 1] > 6) arr[i * 3 + 1] = -3;
  }
  pos.needsUpdate = true;
}

function Dust({ count = 260 }: { count?: number }) {
  const { geo, speeds } = useMemo(() => {
    const rnd = mulberry32(99);
    const p = new Float32Array(count * 3);
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const a = rnd() * Math.PI * 2;
      const d = Math.sqrt(rnd()) * 7;
      p[i * 3] = Math.cos(a) * d;
      p[i * 3 + 1] = -3 + rnd() * 9;
      p[i * 3 + 2] = Math.sin(a) * d;
      s[i] = 0.08 + rnd() * 0.18;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return { geo: g, speeds: s };
  }, [count]);
  const mat = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.06,
        sizeAttenuation: true,
        map: softDotTexture(),
        transparent: true,
        depthWrite: false,
      }),
    [],
  );
  useFrame(({ clock }, delta) => {
    driftDust(geo, speeds, clock.elapsedTime, Math.min(delta, 0.1));
    mat.color.copy(live.dust.color);
    setProp(mat, "opacity", live.dust.opacity);
  });
  return <points geometry={geo} material={mat} />;
}

/** Sky gradient, fog, the light rig and drifting dust; all cross-fade with the theme. */
export default function Atmosphere() {
  return (
    <>
      <ThemeDriver />
      <MoodDriver />
      <Sky />
      <Lights />
      <Dust />
    </>
  );
}
