import * as THREE from "three";
import type { RapierRigidBody } from "@react-three/rapier";
import { ALTAR_POS, CAULDRON } from "@/lib/altar/layout";
import {
  altarMood,
  hintColors,
  splashEnvelope,
  sputterEnvelope,
  surgeEnvelope,
  type Mood,
} from "@/lib/altar/mood";
import { getAltarOccupantBody } from "@/lib/altar/occupancy";
import type { ItemId } from "@/lib/altar/items";
import { useAltarStore, type AltarState } from "@/lib/altar/store";
import { live, themeMix } from "./liveTheme";

// Frame-updated cauldron reaction (see lib/altar/mood.ts). Like `live`, scene
// components read `mood` inside useFrame; nothing here re-renders React. Store
// changes only set targets and pending flags; stepMood() lerps everything and
// layers the one-shot envelopes (landing splash, valid-pair surge, eject sputter).

/** Current reaction. Read-only for consumers. */
export const mood = {
  /** Rune / swirl / haze / ember / brazier / light colour (theme idle colour, tinted and drained). */
  color: new THREE.Color(),
  /** Swirl core and hot-ember colour. */
  core: new THREE.Color(),
  /** Intensity multiplier on top of the theme's values (1 = idle). */
  glow: 1,
  /**
   * The cauldron's point light: part-way between the idle colour and `color`,
   * with a damped glow, so a reaction colours the cauldron, not the whole island.
   */
  lightColor: new THREE.Color(),
  lightGlow: 1,
  /** Accumulated swirl time (advances faster while spinning up). */
  swirlT: 0,
  /** Accumulated fragment-orbit time. */
  orbitT: 0,
  /** Surge envelope (0..1, theme-scaled), for extra flame flicker. */
  flash: 0,
};

export interface SplashEmit {
  /** Basin-local x / z of the landing. */
  x: number;
  z: number;
  a: THREE.Color;
  b: THREE.Color;
}

const MAX_SPLASH = 4;

/** One-shot particle requests for Burst.tsx, which consumes and clears them. */
export const emits = {
  surge: false,
  surgeColor: new THREE.Color(),
  sputter: false,
  splashN: 0,
  splashes: Array.from({ length: MAX_SPLASH }, (): SplashEmit => ({
    x: 0,
    z: 0,
    a: new THREE.Color(),
    b: new THREE.Color(),
  })),
};

/** Smoothing rates (1/s): about a second to settle, never a hard cut. */
const RATE = { color: 3, level: 2.6, spin: 1.8 } as const;
/** Period (s) of the slow alternation between the two accents of a two-recipe item. */
const ALT_PERIOD = 3.6;
/** How much of a reaction (colour and glow change) the point light passes on to the island. */
const LIGHT_RESPONSE = 0.45;
/** World y of the energy surface. */
const SURFACE_Y = ALTAR_POS[1] + CAULDRON.basinBase + CAULDRON.energyY;

const WHITE = new THREE.Color(1, 1, 1);
const _acc = new THREE.Color();
const _tmp = new THREE.Color();
const _grey = new THREE.Color();

interface Target {
  dark: Mood;
  light: Mood;
  a: THREE.Color;
  b: THREE.Color;
}

const target: Target = {
  dark: altarMood([], "idle", null, "dark"),
  light: altarMood([], "idle", null, "light"),
  a: new THREE.Color(),
  b: new THREE.Color(),
};

/** Smoothed levels. */
const cur = {
  accent: new THREE.Color(),
  tint: 0,
  intensity: 1,
  spin: 1,
  drain: 0,
};

const clock = { t: 0, surge: Infinity, splash: Infinity, sputter: Infinity };
const pending = { surge: false, sputter: false };

interface Landing {
  active: boolean;
  id: ItemId | null;
  body: RapierRigidBody | null;
  age: number;
  a: THREE.Color;
  b: THREE.Color;
}
/** Items that just entered and are still falling to the surface. */
const landings: Landing[] = Array.from({ length: MAX_SPLASH }, () => ({
  active: false,
  id: null,
  body: null,
  age: 0,
  a: new THREE.Color(),
  b: new THREE.Color(),
}));
/** Give up waiting for a landing after this long and splash anyway. */
const LANDING_TIMEOUT_S = 1.6;

const lerp = THREE.MathUtils.lerp;
const approach = (rate: number, dt: number) => 1 - Math.exp(-dt * rate);

function retarget(s: AltarState) {
  target.dark = altarMood(s.contents, s.phase, s.activeSection, "dark");
  target.light = altarMood(s.contents, s.phase, s.activeSection, "light");
  const c = target.dark.colors;
  if (c.length > 0) {
    target.a.set(c[0]);
    target.b.set(c[1] ?? c[0]);
  }
}

/** A tinted copy of an accent as the cauldron would currently show it. */
function tinted(out: THREE.Color, accent: string, tint: number) {
  return out.copy(live.rune.color).lerp(_tmp.set(accent), tint);
}

function trackLanding(id: ItemId) {
  const body = getAltarOccupantBody(id);
  const slot = landings.find((l) => !l.active) ?? landings[0];
  const colors = hintColors(id);
  // the item's own hint, whatever the cauldron as a whole is doing
  const tint = lerp(altarMood([id], "idle", null, "dark").tint, altarMood([id], "idle", null, "light").tint, themeMix());
  slot.active = true;
  slot.id = id;
  slot.body = body ?? null;
  slot.age = 0;
  tinted(slot.a, colors[0], tint);
  tinted(slot.b, colors[1] ?? colors[0], tint);
}

function onStore(s: AltarState, prev: AltarState) {
  if (s.contents !== prev.contents || s.phase !== prev.phase || s.activeSection !== prev.activeSection) {
    const was = target.dark.kind;
    retarget(s);
    if (target.dark.kind === "surge" && was !== "surge") {
      pending.surge = true;
      tinted(emits.surgeColor, target.dark.colors[0], lerp(target.dark.tint, target.light.tint, themeMix()));
    }
    if (s.phase === "idle" && s.contents.length > prev.contents.length) {
      for (const id of s.contents) if (!prev.contents.includes(id)) trackLanding(id);
    }
  }
  if (s.ejectNonce !== prev.ejectNonce) pending.sputter = true;
}

function snap() {
  const m = themeMix();
  cur.tint = lerp(target.dark.tint, target.light.tint, m);
  cur.intensity = lerp(target.dark.intensity, target.light.intensity, m);
  cur.spin = lerp(target.dark.spin, target.light.spin, m);
  cur.drain = lerp(target.dark.drain, target.light.drain, m);
  cur.accent.copy(target.dark.colors.length ? target.a : live.rune.color);
  clock.surge = clock.splash = clock.sputter = Infinity;
  pending.surge = pending.sputter = false;
  for (const l of landings) l.active = false;
  emits.surge = emits.sputter = false;
  emits.splashN = 0;
}

/** Start following the store (snaps to its current state, no lerp from idle); returns an unsubscribe. */
export function connectMood(): () => void {
  retarget(useAltarStore.getState());
  snap();
  stepMood(0);
  return useAltarStore.subscribe(onStore);
}

function stepLandings(dt: number) {
  for (const l of landings) {
    if (!l.active) continue;
    l.age += dt;
    const body = l.body;
    if (!body || !l.id || getAltarOccupantBody(l.id) !== body) {
      l.active = false; // taken back out before it landed
      continue;
    }
    const p = body.translation();
    const vy = body.linvel().y;
    const landed = (vy > -0.6 && p.y < SURFACE_Y + 1.2) || l.age > LANDING_TIMEOUT_S;
    if (!landed) continue;
    l.active = false;
    clock.splash = 0;
    if (emits.splashN < MAX_SPLASH) {
      const e = emits.splashes[emits.splashN++];
      e.x = p.x - ALTAR_POS[0];
      e.z = p.z - ALTAR_POS[2];
      e.a.copy(l.a);
      e.b.copy(l.b);
    }
  }
}

/** Advance the reaction; call once per frame, after stepTheme. */
export function stepMood(delta: number) {
  const dt = Math.min(delta, 0.1);
  clock.t += dt;
  if (pending.surge) {
    pending.surge = false;
    clock.surge = 0;
    emits.surge = true;
  }
  if (pending.sputter) {
    pending.sputter = false;
    clock.sputter = 0;
    emits.sputter = true;
  }
  stepLandings(dt);
  clock.surge += dt;
  clock.splash += dt;
  clock.sputter += dt;

  const m = themeMix();
  const d = target.dark;
  const l = target.light;
  const kl = approach(RATE.level, dt);
  cur.tint += (lerp(d.tint, l.tint, m) - cur.tint) * kl;
  cur.intensity += (lerp(d.intensity, l.intensity, m) - cur.intensity) * kl;
  cur.drain += (lerp(d.drain, l.drain, m) - cur.drain) * kl;
  cur.spin += (lerp(d.spin, l.spin, m) - cur.spin) * approach(RATE.spin, dt);

  // accent: a fresh hint from idle starts at its own colour; after that it lerps
  if (d.colors.length > 0) {
    _acc.copy(target.a);
    if (d.colors.length > 1) {
      // dwell on each accent, cross-fade quickly through hue (an RGB blend of red and green is olive mud)
      const w = THREE.MathUtils.smoothstep(0.5 - 0.5 * Math.cos((clock.t * Math.PI * 2) / ALT_PERIOD), 0.3, 0.7);
      _acc.lerpHSL(target.b, w);
    }
    if (cur.tint < 0.04) cur.accent.copy(_acc);
    else cur.accent.lerp(_acc, approach(RATE.color, dt));
  }

  const surge = surgeEnvelope(clock.surge) * lerp(1, 0.5, m);
  const splash = splashEnvelope(clock.splash) * lerp(0.5, 0.25, m);
  const sputter = sputterEnvelope(clock.sputter);
  const flicker = 0.5 + 0.5 * Math.sin(clock.t * 31) * Math.sin(clock.t * 17.3);

  mood.flash = surge;
  mood.glow = cur.intensity * (1 + 1.1 * surge + splash) * (1 - 0.7 * sputter * (0.55 + 0.45 * flicker));
  mood.lightGlow = 1 + (mood.glow - 1) * LIGHT_RESPONSE;
  const spin = cur.spin * (1 + 1.2 * surge) * (1 - 0.5 * sputter);
  mood.swirlT += dt * spin;
  mood.orbitT += dt * (1 + (spin - 1) * 0.4);

  const drain = Math.max(cur.drain, sputter * 0.85);
  mood.color.copy(live.rune.color).lerp(cur.accent, cur.tint);
  const lum = mood.color.r * 0.3 + mood.color.g * 0.55 + mood.color.b * 0.15;
  _grey.setRGB(lum * 0.7, lum * 0.72, lum * 0.76);
  mood.color.lerp(_grey, drain);
  mood.lightColor.copy(live.rune.color).lerp(mood.color, LIGHT_RESPONSE);

  _tmp.copy(cur.accent).lerp(WHITE, 0.6);
  mood.core.copy(live.cauldron.energyCore).lerp(_tmp, cur.tint * 0.7);
  const cl = mood.core.r * 0.3 + mood.core.g * 0.55 + mood.core.b * 0.15;
  mood.core.lerp(_grey.setRGB(cl, cl, cl), drain * 0.8);
}
