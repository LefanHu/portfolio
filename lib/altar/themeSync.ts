import { readTheme, setTheme as setSiteTheme, storedTheme, subscribeTheme, systemTheme } from "@/lib/theme";
import { useAltarStore } from "./store";

// The altar has no theme of its own: it shows the site's one preference
// (lib/theme.ts, `data-theme` on <html>). The store's `theme` field is a mirror
// of it. Changes go one way only: the store's actions write the shared
// preference, and everything else reaches the store through here.

function mirror() {
  const theme = readTheme();
  if (useAltarStore.getState().theme !== theme) useAltarStore.setState({ theme });
}

/**
 * Settle the starting theme before the scene mounts, so nothing fades on first
 * paint. An explicit `?theme=light|dark` wins for this page only (handy for
 * screenshots; it must not overwrite the visitor's saved choice); otherwise the
 * altar opens in the site's theme.
 */
export function applyInitialTheme(search: string = window.location.search) {
  const q = new URLSearchParams(search).get("theme");
  overridden = q === "dark" || q === "light";
  if (q === "dark" || q === "light") setSiteTheme(q, { persist: false, fade: false });
  mirror();
}

/** Whether `?theme=` set a theme the visitor did not choose (it must not outlive the altar). */
let overridden = false;

/**
 * Keep the store on the shared theme while the altar is open: a switch made in
 * another tab or on the classic site, or by the OS when the visitor has made
 * no choice. Returns the unsubscribe.
 */
export function followSiteTheme(): () => void {
  mirror();
  const unsubscribe = subscribeTheme(mirror);
  return () => {
    unsubscribe();
    // Leaving the altar by a client-side link keeps the same document: hand it
    // back in the visitor's own theme, not the one a `?theme=` URL asked for.
    if (overridden) {
      overridden = false;
      setSiteTheme(storedTheme() ?? systemTheme(), { persist: false, fade: false });
    }
  };
}
