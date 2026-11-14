import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAltarStore } from "@/lib/altar/store";
import { applyInitialTheme, followSiteTheme } from "@/lib/altar/themeSync";
import { THEME_KEY, readTheme, setTheme } from "@/lib/theme";

// The altar's theme is the site's one preference (lib/theme.ts): `data-theme`
// on <html>, saved in localStorage only when the visitor chooses. The store's
// `theme` mirrors it.

const html = document.documentElement;
const storeTheme = () => useAltarStore.getState().theme;

/** Stand in for the OS preference; returns a function that flips it and tells the listeners. */
function mockSystem(initial: "light" | "dark") {
  let dark = initial === "dark";
  const listeners = new Set<() => void>();
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        get matches() {
          return dark;
        },
        media: query,
        addEventListener: (_: string, fn: () => void) => void listeners.add(fn),
        removeEventListener: (_: string, fn: () => void) => void listeners.delete(fn),
      }) as unknown as MediaQueryList,
  );
  return (next: "light" | "dark") => {
    dark = next === "dark";
    listeners.forEach((fn) => fn());
  };
}

let stop: (() => void) | null = null;

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  html.removeAttribute("data-theme");
  useAltarStore.setState({ theme: "dark" });
});

afterEach(() => {
  stop?.();
  stop = null;
  vi.restoreAllMocks();
});

describe("the altar's starting theme", () => {
  it("is the site's current theme", () => {
    html.setAttribute("data-theme", "light");
    applyInitialTheme("");
    expect(storeTheme()).toBe("light");
    html.setAttribute("data-theme", "dark");
    applyInitialTheme("");
    expect(storeTheme()).toBe("dark");
  });

  it("is the visitor's saved choice", () => {
    mockSystem("dark");
    localStorage.setItem(THEME_KEY, "light");
    applyInitialTheme("");
    expect(storeTheme()).toBe("light");
  });

  it("follows the OS when nothing is saved", () => {
    mockSystem("light");
    applyInitialTheme("");
    expect(storeTheme()).toBe("light");
    mockSystem("dark");
    applyInitialTheme("");
    expect(storeTheme()).toBe("dark");
  });

  it("?theme= wins for this page, on <html> too, and is not saved", () => {
    localStorage.setItem(THEME_KEY, "dark");
    html.setAttribute("data-theme", "dark");
    applyInitialTheme("?theme=light");
    expect(storeTheme()).toBe("light");
    expect(html.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem(THEME_KEY)).toBe("dark");
  });

  it("?theme= does not save a choice for a visitor who has made none", () => {
    mockSystem("light");
    applyInitialTheme("?theme=dark");
    expect(storeTheme()).toBe("dark");
    expect(localStorage.getItem(THEME_KEY)).toBeNull();
  });

  it("does not cross-fade the page into a ?theme= override", () => {
    html.setAttribute("data-theme", "dark");
    applyInitialTheme("?theme=light");
    expect(html.hasAttribute("data-theme-fade")).toBe(false);
  });

  it("ignores a ?theme= it does not know", () => {
    html.setAttribute("data-theme", "light");
    applyInitialTheme("?theme=sepia");
    expect(storeTheme()).toBe("light");
    expect(html.getAttribute("data-theme")).toBe("light");
  });

  it("no longer reads a theme from the altar's own storage", () => {
    sessionStorage.setItem("altar", JSON.stringify({ state: { theme: "dark", unlocked: [] }, version: 0 }));
    html.setAttribute("data-theme", "light");
    applyInitialTheme("");
    expect(storeTheme()).toBe("light");
  });
});

describe("while the altar is open, its store follows the site's theme", () => {
  it("catches up when it starts following", () => {
    html.setAttribute("data-theme", "light");
    stop = followSiteTheme();
    expect(storeTheme()).toBe("light");
  });

  it("a switch made through the site's theme module", () => {
    stop = followSiteTheme();
    setTheme("light");
    expect(storeTheme()).toBe("light");
    setTheme("dark");
    expect(storeTheme()).toBe("dark");
  });

  it("a switch made in another tab", () => {
    html.setAttribute("data-theme", "dark");
    stop = followSiteTheme();
    localStorage.setItem(THEME_KEY, "light");
    window.dispatchEvent(new StorageEvent("storage", { key: THEME_KEY }));
    expect(storeTheme()).toBe("light");
    expect(html.getAttribute("data-theme")).toBe("light");
  });

  it("the OS changing, while the visitor has made no choice", () => {
    const setSystem = mockSystem("light");
    stop = followSiteTheme();
    expect(storeTheme()).toBe("light");
    setSystem("dark");
    expect(storeTheme()).toBe("dark");
  });

  it("not the OS once the visitor has chosen", () => {
    const setSystem = mockSystem("light");
    stop = followSiteTheme();
    useAltarStore.getState().setTheme("light");
    setSystem("dark");
    expect(storeTheme()).toBe("light");
  });

  it("stops when released", () => {
    followSiteTheme()();
    setTheme("light");
    expect(storeTheme()).toBe("dark");
  });
});

describe("the altar's own switch", () => {
  it("changes the shared preference, saves it, and the store lands on it once (no echo)", () => {
    html.setAttribute("data-theme", "dark");
    stop = followSiteTheme();
    const seen: string[] = [];
    const off = useAltarStore.subscribe((s, prev) => {
      if (s.theme !== prev.theme) seen.push(s.theme);
    });
    useAltarStore.getState().toggleTheme();
    off();
    expect(seen).toEqual(["light"]);
    expect(readTheme()).toBe("light");
    expect(html.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem(THEME_KEY)).toBe("light");
  });

  it("after a ?theme= override, saves the visitor's own switch", () => {
    localStorage.setItem(THEME_KEY, "dark");
    html.setAttribute("data-theme", "dark");
    applyInitialTheme("?theme=light");
    stop = followSiteTheme();
    useAltarStore.getState().toggleTheme();
    expect(storeTheme()).toBe("dark");
    expect(localStorage.getItem(THEME_KEY)).toBe("dark");
    useAltarStore.getState().toggleTheme();
    expect(localStorage.getItem(THEME_KEY)).toBe("light");
  });
});

describe("?theme= override", () => {
  it("is handed back when the altar is left, so the classic site shows the visitor's own theme", () => {
    mockSystem("dark");
    setTheme("dark");
    applyInitialTheme("?theme=light");
    stop = followSiteTheme();
    expect(readTheme()).toBe("light");

    stop();
    stop = null;

    expect(readTheme()).toBe("dark");
    expect(localStorage.getItem(THEME_KEY)).toBe("dark");
  });
});
