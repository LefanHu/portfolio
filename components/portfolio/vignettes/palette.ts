import * as THREE from "three";
import type { Palette } from "./types";

/** The CSS custom property behind each palette colour (app/globals.css). */
const TOKENS: Record<keyof Palette, string> = {
  ink: "--ink",
  body: "--body",
  mute: "--mute",
  line: "--line",
  lineStrong: "--line-strong",
  rune: "--rune",
  ember: "--ember",
  accent: "--sig-experience",
  ok: "--ok",
  bad: "--bad",
  // The figure's stage is an inset surface.
  pane: "--pane-raise",
};

export type Rgba = [red: number, green: number, blue: number, alpha: number];

/**
 * Reads a computed colour: hex as authored, or the `rgb()` / `color(srgb …)`
 * forms a browser reports for a registered property (and mid cross-fade).
 * Channels come back in 0..1; null when the value is not a colour we know.
 */
export function parseCssColor(value: string): Rgba | null {
  const text = value.trim().toLowerCase();

  if (text.startsWith("#")) {
    const hex = text.slice(1);
    if (!/^[0-9a-f]+$/.test(hex)) return null;
    const wide = hex.length === 3 || hex.length === 4 ? [...hex].map((digit) => digit + digit).join("") : hex;
    if (wide.length !== 6 && wide.length !== 8) return null;
    const channel = (index: number) => parseInt(wide.slice(index * 2, index * 2 + 2), 16) / 255;
    return [channel(0), channel(1), channel(2), wide.length === 8 ? channel(3) : 1];
  }

  const call = text.match(/^(rgba?|color)\((.*)\)$/);
  if (!call) return null;
  const unit = call[1] === "color" ? 1 : 255;
  const numbers = call[2].match(/-?[\d.]+(?:e-?\d+)?%?/g);
  if (!numbers || numbers.length < 3) return null;
  const read = (token: string, scale: number) =>
    token.endsWith("%") ? parseFloat(token) / 100 : parseFloat(token) / scale;
  const [red, green, blue] = numbers.slice(0, 3).map((token) => read(token, unit));
  const alpha = numbers.length > 3 ? read(numbers[3], 1) : 1;
  return [red, green, blue, alpha].every(Number.isFinite) ? [red, green, blue, alpha] : null;
}

export function createPalette(): Palette {
  const palette = {} as Palette;
  for (const name of Object.keys(TOKENS) as (keyof Palette)[]) palette[name] = new THREE.Color();
  return palette;
}

/**
 * Fills `palette` from the page's current tokens. Translucent tokens (the
 * hairlines) are flattened onto the surface, since a three.js colour has no alpha.
 */
export function readPalette(palette: Palette, element: Element = document.documentElement) {
  const style = getComputedStyle(element);
  const read = (name: keyof Palette) => parseCssColor(style.getPropertyValue(TOKENS[name]));

  const pane = read("pane") ?? [0, 0, 0, 1];
  for (const name of Object.keys(TOKENS) as (keyof Palette)[]) {
    const [red, green, blue, alpha] = read(name) ?? pane;
    const over = (top: number, under: number) => under + (top - under) * alpha;
    palette[name].setRGB(over(red, pane[0]), over(green, pane[1]), over(blue, pane[2]), THREE.SRGBColorSpace);
  }
}
