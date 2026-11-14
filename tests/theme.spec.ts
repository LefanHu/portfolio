import {
  THEME_INIT_SCRIPT,
  THEME_KEY,
  readTheme,
  setTheme,
  storedTheme,
  subscribeTheme,
  toggleTheme,
} from "@/lib/theme";

// Under test the system preference reads as light: tests/setup.ts mocks
// matchMedia so that no query matches.

const root = document.documentElement;

describe("site theme", () => {
  beforeEach(() => {
    window.localStorage.clear();
    root.removeAttribute("data-theme");
    root.removeAttribute("data-theme-fade");
  });

  it("follows the system until the visitor chooses, then remembers the choice", () => {
    expect(storedTheme()).toBeNull();
    expect(readTheme()).toBe("light");

    setTheme("dark");

    expect(root).toHaveAttribute("data-theme", "dark");
    expect(window.localStorage.getItem(THEME_KEY)).toBe("dark");
    expect(readTheme()).toBe("dark");
  });

  it("ignores a stored value that is not a theme", () => {
    window.localStorage.setItem(THEME_KEY, "purple");
    expect(storedTheme()).toBeNull();
    expect(readTheme()).toBe("light");
  });

  it("can apply a theme for this page only", () => {
    setTheme("dark", { persist: false });

    expect(root).toHaveAttribute("data-theme", "dark");
    expect(window.localStorage.getItem(THEME_KEY)).toBeNull();
  });

  it("toggles between the two themes", () => {
    setTheme("light");
    toggleTheme();
    expect(root).toHaveAttribute("data-theme", "dark");
    toggleTheme();
    expect(root).toHaveAttribute("data-theme", "light");
  });

  it("cross-fades on a switch, and not when asked not to", () => {
    setTheme("dark");
    expect(root).toHaveAttribute("data-theme-fade");

    root.removeAttribute("data-theme-fade");
    setTheme("light", { fade: false });
    expect(root).not.toHaveAttribute("data-theme-fade");
  });

  it("tells subscribers about real changes only, until they unsubscribe", () => {
    setTheme("light");
    const listener = vi.fn();
    const unsubscribe = subscribeTheme(listener);

    setTheme("light");
    expect(listener).not.toHaveBeenCalled();

    setTheme("dark");
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    setTheme("light");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("follows a choice made in another tab or frame", () => {
    setTheme("light");
    const listener = vi.fn();
    const unsubscribe = subscribeTheme(listener);

    window.localStorage.setItem(THEME_KEY, "dark");
    window.dispatchEvent(new StorageEvent("storage", { key: THEME_KEY, newValue: "dark" }));

    expect(root).toHaveAttribute("data-theme", "dark");
    expect(listener).toHaveBeenCalledTimes(1);

    // An unrelated key is not a theme change.
    window.dispatchEvent(new StorageEvent("storage", { key: "altar", newValue: "{}" }));
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("keeps working when storage is unavailable", () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });

    expect(storedTheme()).toBeNull();
    expect(() => setTheme("dark")).not.toThrow();
    expect(root).toHaveAttribute("data-theme", "dark");

    getItem.mockRestore();
    setItem.mockRestore();
  });
});

describe("no-flash script", () => {
  const run = () => new Function(THEME_INIT_SCRIPT)();

  beforeEach(() => {
    window.localStorage.clear();
    root.removeAttribute("data-theme");
  });

  it("applies the stored choice before anything renders", () => {
    window.localStorage.setItem(THEME_KEY, "dark");
    run();
    expect(root).toHaveAttribute("data-theme", "dark");
  });

  it("falls back to the system preference", () => {
    run();
    expect(root).toHaveAttribute("data-theme", "light");
  });

  it("does not throw when storage is unavailable", () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(run).not.toThrow();
    expect(root).toHaveAttribute("data-theme", "light");
    getItem.mockRestore();
  });
});
