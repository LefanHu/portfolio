import { matchRecipe, RECIPES, type ItemId, type SectionId } from "./recipes";
import type { Phase, Theme } from "./store";

// How the cauldron reacts to what is in it. Pure: the scene (components/altar/
// scene/liveMood.ts) lerps toward these targets every frame and layers the
// one-shot envelopes below on top, so nothing ever hard-cuts.

export type MoodKind = "idle" | "hint" | "surge" | "hold" | "unstable";

export interface Mood {
  kind: MoodKind;
  /**
   * Accent colours to tint toward. Empty: the theme's idle rune colour. Two (an
   * item that belongs to two recipes): the scene slowly alternates between them,
   * since a blend of e.g. the keyboard's red and green is a muddy olive.
   */
  colors: string[];
  /** How far to tint from the idle colour toward the accent, 0..1. */
  tint: number;
  /** Glow multiplier for runes, swirl, haze, braziers and the light (1 = idle). */
  intensity: number;
  /** Swirl / ember speed multiplier (1 = idle). */
  spin: number;
  /** Desaturation toward grey, 0..1. */
  drain: number;
}

type Levels = Omit<Mood, "kind" | "colors">;

/** Night-time levels per kind. Daylight scales the deviation from idle down (see restrain). */
const LEVELS: Record<MoodKind, Levels> = {
  idle: { tint: 0, intensity: 1, spin: 1, drain: 0 },
  hint: { tint: 0.85, intensity: 1.3, spin: 1.3, drain: 0 },
  surge: { tint: 1, intensity: 1.7, spin: 2, drain: 0 },
  hold: { tint: 1, intensity: 1.3, spin: 1.5, drain: 0 },
  unstable: { tint: 0, intensity: 0.75, spin: 0.8, drain: 0.6 },
};

/** Daylight keeps half of each glow boost and 80% of the tint, so it stays restrained. */
const DAY = { intensity: 0.5, tint: 0.8 } as const;

function restrain(l: Levels, theme: Theme): Levels {
  if (theme === "dark") return l;
  return { ...l, tint: l.tint * DAY.tint, intensity: 1 + (l.intensity - 1) * DAY.intensity };
}

const accentOf = (section: SectionId) => RECIPES.find((r) => r.section === section)?.artifact.accent;

/** Accents of every recipe the item belongs to, in RECIPES order. */
export function hintColors(id: ItemId): string[] {
  return RECIPES.filter((r) => r.items.includes(id)).map((r) => r.artifact.accent);
}

function mood(kind: MoodKind, colors: string[], theme: Theme): Mood {
  return { kind, colors, ...restrain(LEVELS[kind], theme) };
}

/**
 * The cauldron's target state.
 * - idle, empty: idle cyan.
 * - idle, one item: hint in that item's recipe accent(s).
 * - idle, a valid pair (the settle window before evaluate): surge, so the surge
 *   is already rising when `revealing` arrives.
 * - idle, an invalid pair or more: unstable (drained), until the eject.
 * - revealing: surge in the active section's accent; viewing: a calmer hold, so
 *   the surface matches the beam; returning: back to idle with the dissolve.
 */
export function altarMood(
  contents: readonly ItemId[],
  phase: Phase,
  activeSection: SectionId | null,
  theme: Theme,
): Mood {
  if (phase === "revealing" || phase === "viewing") {
    const a = activeSection && accentOf(activeSection);
    if (!a) return mood("idle", [], theme);
    return mood(phase === "revealing" ? "surge" : "hold", [a], theme);
  }
  if (phase !== "idle") return mood("idle", [], theme);
  const m = matchRecipe(contents);
  switch (m.kind) {
    case "empty":
      return mood("idle", [], theme);
    case "partial":
      return mood("hint", hintColors(contents[0]), theme);
    case "match":
      return mood("surge", [m.recipe.artifact.accent], theme);
    case "invalid":
      return mood("unstable", [], theme);
  }
}

/* ------------------------------------------------------------------ one-shot envelopes (t in s since the event) */

function smooth(k: number) {
  return k * k * (3 - 2 * k);
}

function envelope(t: number, attack: number, hold: number, end: number, power: number) {
  if (!(t >= 0) || t >= end) return 0;
  if (t < attack) return smooth(t / attack);
  if (t < hold) return 1;
  return Math.pow(1 - (t - hold) / (end - hold), power);
}

/** Valid-pair surge: a fast flash that is mostly gone by the time the beam is up. */
export function surgeEnvelope(t: number): number {
  return envelope(t, 0.08, 0.08, 1.5, 2.2);
}

/** A single item landing: a soft, short glow bump. */
export function splashEnvelope(t: number): number {
  return envelope(t, 0.06, 0.1, 0.7, 2);
}

/** Invalid pair / lever eject: drained and flickering, then the cyan returns. */
export function sputterEnvelope(t: number): number {
  return envelope(t, 0.06, 0.3, 1.35, 1.6);
}

/** The clear lever only pulls when clearAltar() would actually empty something. */
export function leverResponse(phase: Phase, occupants: number): "pull" | "locked" {
  return phase === "idle" && occupants > 0 ? "pull" : "locked";
}
