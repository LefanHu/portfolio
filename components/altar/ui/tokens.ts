import type { CSSProperties } from "react";
import type { Theme } from "@/lib/altar/store";
import { THEMES } from "@/lib/altar/theme";

// Colour tokens for the recipe board and the overlay, derived from the
// projection palette so all of the altar's UI reads as one magic system.
// Every token is a concrete colour per theme (no var-of-var), registered with
// @property in ui.css, so a theme change cross-fades instead of cutting.

const mix = (a: string, pct: number, b: string) => `color-mix(in srgb, ${a} ${pct}%, ${b})`;

export function uiVars(theme: Theme): CSSProperties {
  const p = THEMES[theme].projection;
  const dark = theme === "dark";
  return {
    "--au-line": p.line,
    "--au-text": p.text,
    "--au-strong": dark ? mix(p.text, 62, "#ffffff") : mix(p.text, 70, "#000000"),
    "--au-soft": dark ? mix(p.text, 74, "transparent") : mix(p.text, 86, "transparent"),
    "--au-edge": mix(p.line, dark ? 42 : 26, "transparent"),
    "--au-pane": mix(p.fill, dark ? 80 : 86, "transparent"),
    "--au-raise": mix(p.line, dark ? 7 : 5, "transparent"),
    "--au-shadow": dark ? mix(p.line, 22, "transparent") : "rgba(27, 40, 54, 0.18)",
    "--au-scrim": dark ? "rgba(3, 7, 22, 0.42)" : "rgba(27, 40, 54, 0.16)",
  } as CSSProperties;
}

/** An artifact accent made legible on the theme's pane (inked down in light). */
export function accentInk(accent: string, theme: Theme): string {
  return theme === "dark" ? accent : `color-mix(in oklab, ${accent} 52%, #1b2836)`;
}

export function accentVars(accent: string, theme: Theme): CSSProperties {
  return { "--au-acc": accentInk(accent, theme), "--au-acc-raw": accent } as CSSProperties;
}
