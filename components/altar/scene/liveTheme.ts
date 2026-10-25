import * as THREE from "three";
import { THEMES, THEME_TRANSITION_S, type SceneTheme } from "@/lib/altar/theme";
import type { Theme } from "@/lib/altar/store";

// Frame-updated theme state. Scene components read `live` inside useFrame, so a
// theme switch cross-fades every value over THEME_TRANSITION_S without React
// re-renders. Driven by SceneTheme (values in lib/altar/theme.ts).

/** The SceneTheme values that cross-fade. */
const FADED = [
  "sky",
  "fog",
  "fogNear",
  "fogFar",
  "hemisphere",
  "sun",
  "rim",
  "underFill",
  "lantern",
  "rune",
  "cauldron",
  "dust",
  "clouds",
  "moon",
  "bloomIntensity",
  "ao",
] as const satisfies readonly (keyof SceneTheme)[];

type Faded = Pick<SceneTheme, (typeof FADED)[number]>;

/** Hex strings become Colors, xyz tuples become Vectors, numbers stay numbers. */
type Lerped<T> = T extends string
  ? THREE.Color
  : T extends number
    ? number
    : T extends [number, number, number]
      ? THREE.Vector3
      : T extends readonly string[]
        ? THREE.Color[]
        : { [K in keyof T]: Lerped<T[K]> };

export type LiveTheme = Lerped<Faded>;

function pick(t: SceneTheme): Faded {
  return Object.fromEntries(FADED.map((k) => [k, t[k]])) as Faded;
}

function isVec3(v: unknown): v is [number, number, number] {
  return Array.isArray(v) && v.length === 3 && v.every((n) => typeof n === "number");
}

/** Build a mutable Lerped copy of a theme value. */
function build(v: unknown): unknown {
  if (typeof v === "string") return new THREE.Color(v);
  if (typeof v === "number") return v;
  if (isVec3(v)) return new THREE.Vector3(...v);
  if (Array.isArray(v)) return v.map(build);
  return Object.fromEntries(
    Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, build(x)]),
  );
}

const DARK = build(pick(THEMES.dark)) as LiveTheme;
const LIGHT = build(pick(THEMES.light)) as LiveTheme;

/** Write lerp(a, b, t) into `out`; returns the (possibly new) value for numbers. */
function lerpInto(out: unknown, a: unknown, b: unknown, t: number): unknown {
  if (typeof a === "number") return THREE.MathUtils.lerp(a, b as number, t);
  if (out instanceof THREE.Color) return out.copy(a as THREE.Color).lerp(b as THREE.Color, t);
  if (out instanceof THREE.Vector3)
    return out.copy(a as THREE.Vector3).lerp(b as THREE.Vector3, t);
  const o = out as Record<string, unknown>;
  const ar = a as Record<string, unknown>;
  const br = b as Record<string, unknown>;
  for (const k of Object.keys(o)) o[k] = lerpInto(o[k], ar[k], br[k], t);
  return out;
}

/** 0 = dark, 1 = light. */
const mix = { value: 0, target: 0 };

/** Current cross-faded theme values. Read-only for consumers. */
export const live = build(pick(THEMES.dark)) as LiveTheme;

function smooth(t: number) {
  return t * t * (3 - 2 * t);
}

function apply() {
  lerpInto(live, DARK, LIGHT, smooth(mix.value));
}

const toMix = (t: Theme) => (t === "light" ? 1 : 0);

/** Jump straight to a theme (first frame, no fade). */
export function snapTheme(theme: Theme) {
  mix.value = mix.target = toMix(theme);
  apply();
}

/** Start cross-fading toward a theme. */
export function fadeToTheme(theme: Theme) {
  mix.target = toMix(theme);
}

/** Advance the cross-fade; call once per frame. */
export function stepTheme(delta: number) {
  if (mix.value === mix.target) return;
  const dir = Math.sign(mix.target - mix.value);
  mix.value = THREE.MathUtils.clamp(mix.value + (dir * delta) / THEME_TRANSITION_S, 0, 1);
  if ((dir > 0 && mix.value > mix.target) || (dir < 0 && mix.value < mix.target)) {
    mix.value = mix.target;
  }
  apply();
}

/** Current eased cross-fade position: 0 = dark, 1 = light. */
export function themeMix(): number {
  return smooth(mix.value);
}
