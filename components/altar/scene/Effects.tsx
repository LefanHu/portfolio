"use client";

import { useRef, type ComponentRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, N8AO, SMAA, ToneMapping } from "@react-three/postprocessing";
import { AO, BLOOM, RENDERER, THEMES, TONE_MAPPING_MODE } from "@/lib/altar/theme";
import { live } from "./liveTheme";

// Constant initial props: @react-three/postprocessing rebuilds an effect when its
// props change, so theme-dependent values are written through refs every frame.
const INITIAL = THEMES.dark;

/**
 * N8AO, Bloom, SMAA, then ACES tone mapping. ToneMapping must be last because
 * EffectComposer disables the renderer's own tone mapping. Bloom intensity and
 * N8AO intensity/color cross-fade with the theme via `live`.
 */
export default function Effects() {
  const bloom = useRef<ComponentRef<typeof Bloom>>(null);
  const ao = useRef<ComponentRef<typeof N8AO>>(null);
  useFrame(() => {
    if (bloom.current) bloom.current.intensity = live.bloomIntensity;
    const cfg = ao.current?.configuration;
    if (cfg) {
      cfg.intensity = live.ao.intensity;
      cfg.color.copy(live.ao.color);
    }
  });
  return (
    <EffectComposer multisampling={RENDERER.multisampling}>
      <N8AO
        ref={ao}
        aoRadius={AO.aoRadius}
        distanceFalloff={AO.distanceFalloff}
        quality={AO.quality}
        intensity={INITIAL.ao.intensity}
        color={INITIAL.ao.color}
      />
      <Bloom
        ref={bloom}
        luminanceThreshold={BLOOM.luminanceThreshold}
        luminanceSmoothing={BLOOM.luminanceSmoothing}
        mipmapBlur={BLOOM.mipmapBlur}
        radius={BLOOM.radius}
        intensity={INITIAL.bloomIntensity}
      />
      <SMAA />
      <ToneMapping mode={TONE_MAPPING_MODE} />
    </EffectComposer>
  );
}
