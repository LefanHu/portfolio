import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";
import { matchRecipe, RECIPES, type ItemId, type SectionId } from "./recipes";

export type Phase = "idle" | "revealing" | "viewing" | "returning";
export type Theme = "light" | "dark";

/** The scene calls evaluate() after this many ms without contents changing. */
export const SETTLE_MS = 400;

export interface AltarState {
  phase: Phase;
  contents: ItemId[];
  activeSection: SectionId | null;
  unlocked: SectionId[];
  ejectNonce: number;
  resetNonce: number;
  theme: Theme;
  itemEntered(id: ItemId): void;
  itemLeft(id: ItemId): void;
  evaluate(): void;
  clearAltar(): void;
  openSection(id: SectionId): void;
  revealDone(): void;
  closeSection(): void;
  returnDone(): void;
  setTheme(t: Theme): void;
  toggleTheme(): void;
}

const SECTION_IDS = new Set<string>(RECIPES.map((r) => r.section));

/** Persisted state is untrusted (stale schema, tampering): keep only values the app understands. */
function sanitize(persisted: unknown, current: AltarState): Partial<AltarState> {
  const p = (persisted ?? {}) as { theme?: unknown; unlocked?: unknown };
  return {
    theme: p.theme === "light" || p.theme === "dark" ? p.theme : current.theme,
    unlocked: Array.isArray(p.unlocked)
      ? p.unlocked.filter((id): id is SectionId => typeof id === "string" && SECTION_IDS.has(id))
      : current.unlocked,
  };
}

const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return sessionStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      sessionStorage.setItem(name, value);
    } catch {
      // storage unavailable; progress simply isn't persisted
    }
  },
  removeItem: (name) => {
    try {
      sessionStorage.removeItem(name);
    } catch {
      // ignore
    }
  },
};

export function createAltarStore(initialTheme: Theme = "dark") {
  return createStore<AltarState>()(
    persist(
      (set, get) => ({
        phase: "idle",
        contents: [],
        activeSection: null,
        unlocked: [],
        ejectNonce: 0,
        resetNonce: 0,
        theme: initialTheme,

        itemEntered: (id) =>
          set((s) =>
            s.phase !== "idle" || s.contents.includes(id)
              ? s
              : { contents: [...s.contents, id] },
          ),
        itemLeft: (id) =>
          set((s) =>
            s.phase !== "idle" || !s.contents.includes(id)
              ? s
              : { contents: s.contents.filter((c) => c !== id) },
          ),
        evaluate: () => {
          const s = get();
          if (s.phase !== "idle") return;
          const result = matchRecipe(s.contents);
          if (result.kind === "match") s.openSection(result.recipe.section);
          else if (result.kind === "invalid") s.clearAltar();
        },
        clearAltar: () =>
          set((s) =>
            s.phase !== "idle" ? s : { contents: [], ejectNonce: s.ejectNonce + 1 },
          ),
        openSection: (id) =>
          set((s) =>
            s.phase !== "idle"
              ? s
              : {
                  phase: "revealing",
                  activeSection: id,
                  unlocked: s.unlocked.includes(id) ? s.unlocked : [...s.unlocked, id],
                },
          ),
        revealDone: () =>
          set((s) => (s.phase === "revealing" ? { phase: "viewing" } : s)),
        closeSection: () =>
          set((s) =>
            s.phase === "viewing" || s.phase === "revealing"
              ? { phase: "returning", resetNonce: s.resetNonce + 1 }
              : s,
          ),
        returnDone: () =>
          set((s) =>
            s.phase === "returning"
              ? { phase: "idle", contents: [], activeSection: null }
              : s,
          ),
        setTheme: (t) => set({ theme: t }),
        toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      }),
      {
        name: "altar",
        storage: createJSONStorage(() => safeStorage),
        partialize: (s) => ({ unlocked: s.unlocked, theme: s.theme }),
        merge: (persisted, current) => ({ ...current, ...sanitize(persisted, current) }),
      },
    ),
  );
}

const altarStore = createAltarStore();

export function useAltarStore(): AltarState;
export function useAltarStore<T>(selector: (s: AltarState) => T): T;
export function useAltarStore<T>(selector?: (s: AltarState) => T) {
  return useStore(altarStore, selector as (s: AltarState) => T);
}
useAltarStore.getState = altarStore.getState;
useAltarStore.setState = altarStore.setState;
useAltarStore.subscribe = altarStore.subscribe;
