// One theme preference for the whole site: the classic pages, the 3D altar, and
// the site framed inside the altar's projections.
//
// The value lives in the `data-theme` attribute on <html> ("light" | "dark",
// always concrete). A visitor's explicit choice is kept in localStorage under
// THEME_KEY; with nothing stored the site follows the operating system.
// THEME_INIT_SCRIPT sets the attribute while the HTML is parsed, so the first
// paint is already in the right theme.
//
// This module is framework-free on purpose: components read it through
// useTheme() (lib/useTheme.ts) and need no provider.

export type Theme = "light" | "dark";

export const THEME_KEY = "theme";

/** Rendered by the server and used when nothing can be read (no DOM, no storage). */
export const DEFAULT_THEME: Theme = "dark";

/** Duration of the token cross-fade on a switch; matches `[data-theme-fade]` in globals.css. */
export const THEME_FADE_MS = 500;

const DARK_QUERY = "(prefers-color-scheme: dark)";

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

/** The visitor's explicit choice, or null when they have not made one. */
export function storedTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(THEME_KEY);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

export function systemTheme(): Theme {
  try {
    return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
  } catch {
    return DEFAULT_THEME;
  }
}

/** The theme in effect right now. */
export function readTheme(): Theme {
  if (typeof document === "undefined") return DEFAULT_THEME;
  const attr = document.documentElement.getAttribute("data-theme");
  if (isTheme(attr)) return attr;
  return storedTheme() ?? systemTheme();
}

const listeners = new Set<() => void>();
let fadeTimer: ReturnType<typeof setTimeout> | undefined;

function notify() {
  for (const listener of listeners) listener();
}

function writeAttribute(theme: Theme, fade: boolean) {
  const root = document.documentElement;
  if (root.getAttribute("data-theme") === theme) return false;
  if (fade) {
    // Colour tokens are registered with @property, so the flag lets them
    // interpolate. It is only ever present during a switch: first paint never animates.
    root.setAttribute("data-theme-fade", "");
    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => root.removeAttribute("data-theme-fade"), THEME_FADE_MS + 50);
  }
  root.setAttribute("data-theme", theme);
  return true;
}

/**
 * Switch the theme. `persist: false` applies it for this page only (used for
 * the altar's `?theme=` override, which must not overwrite the visitor's choice).
 */
export function setTheme(theme: Theme, options: { persist?: boolean; fade?: boolean } = {}) {
  if (typeof document === "undefined") return;
  const { persist = true, fade = true } = options;
  if (persist) {
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      // storage unavailable: the choice lasts for this page
    }
  }
  if (writeAttribute(theme, fade)) notify();
}

export function toggleTheme() {
  setTheme(readTheme() === "dark" ? "light" : "dark");
}

/**
 * Re-apply the attribute after React has reset <html> (Strict Mode's dev
 * remount clears attributes the inline script set). A no-op in production.
 */
export function ensureThemeAttribute() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (!isTheme(root.getAttribute("data-theme"))) {
    root.setAttribute("data-theme", storedTheme() ?? systemTheme());
    notify();
  }
}

let detachGlobal: (() => void) | undefined;

function attachGlobal() {
  // Another tab, or the altar page around a framed copy of the site, changed the choice.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== THEME_KEY) return;
    if (writeAttribute(storedTheme() ?? systemTheme(), true)) notify();
  };
  // The operating system changed and the visitor has no explicit choice.
  const onSystem = () => {
    if (storedTheme()) return;
    if (writeAttribute(systemTheme(), true)) notify();
  };
  window.addEventListener("storage", onStorage);
  let media: MediaQueryList | undefined;
  try {
    media = window.matchMedia(DARK_QUERY);
    media.addEventListener?.("change", onSystem);
  } catch {
    media = undefined;
  }
  return () => {
    window.removeEventListener("storage", onStorage);
    media?.removeEventListener?.("change", onSystem);
  };
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1 && typeof window !== "undefined") detachGlobal = attachGlobal();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      detachGlobal?.();
      detachGlobal = undefined;
    }
  };
}

/**
 * Inline <head> script: resolves the theme before first paint. Kept as a raw
 * string because it must run during HTML parsing, before any bundle loads.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var d=document.documentElement,t=null;try{t=localStorage.getItem(${JSON.stringify(
  THEME_KEY,
)})}catch(e){}if(t!=="light"&&t!=="dark"){t=window.matchMedia&&matchMedia(${JSON.stringify(
  DARK_QUERY,
)}).matches?"dark":"light"}d.setAttribute("data-theme",t)}catch(e){}})()`;
