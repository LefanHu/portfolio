"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_THEME, readTheme, subscribeTheme, type Theme } from "./theme";

const serverTheme = (): Theme => DEFAULT_THEME;

/**
 * The current theme, for the few components that must branch in JS (canvases,
 * third-party widgets). Prefer CSS on `[data-theme]` wherever styling is enough:
 * the server always renders DEFAULT_THEME, so markup must not depend on this.
 */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribeTheme, readTheme, serverTheme);
}
