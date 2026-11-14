import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";
import { setTheme as setSiteTheme, type Theme } from "@/lib/theme";
import { matchRecipe, type ItemId, type SectionId } from "./recipes";
import { RELICS } from "./relics";
import { ALL_VIEWS, type ViewId } from "./views";

export type Phase = "idle" | "revealing" | "viewing" | "returning";
export type { Theme };

/** The scene calls evaluate() after this many ms without contents changing. */
export const SETTLE_MS = 400;

export interface AltarState {
  phase: Phase;
  contents: ItemId[];
  /** The open view: a section or a project. (Named "section" from before projects joined.) */
  activeSection: ViewId | null;
  unlocked: ViewId[];
  ejectNonce: number;
  resetNonce: number;
  /**
   * A mirror of the site's one theme preference (lib/theme.ts), kept here so
   * the scene and the UI can select it like any other state. It is not persisted
   * with the altar's progress: setTheme / toggleTheme change the shared
   * preference, and themeSync.ts brings changes made elsewhere back in.
   */
  theme: Theme;
  /** Recipe whose items the board is hovering; the scene lights them up. */
  highlight: SectionId | null;
  /** True while the cauldron pulls in a clicked recipe's items. */
  summoning: boolean;
  summonSection: SectionId | null;
  summonNonce: number;
  itemEntered(id: ItemId): void;
  itemLeft(id: ItemId): void;
  evaluate(): void;
  clearAltar(): void;
  openSection(id: ViewId): void;
  revealDone(): void;
  closeSection(): void;
  returnDone(): void;
  setTheme(t: Theme): void;
  toggleTheme(): void;
  setHighlight(id: SectionId | null): void;
  summonRecipe(id: SectionId): void;
  summonDone(): void;
}

const VIEW_IDS = new Set<string>(ALL_VIEWS);

/**
 * Persisted state is untrusted (stale schema, tampering): keep only values the
 * app understands. A `theme` saved by an earlier version is ignored.
 */
function sanitize(persisted: unknown, current: AltarState): Partial<AltarState> {
  const p = (persisted ?? {}) as { unlocked?: unknown };
  return {
    unlocked: Array.isArray(p.unlocked)
      ? p.unlocked.filter((id): id is ViewId => typeof id === "string" && VIEW_IDS.has(id))
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
        highlight: null,
        summoning: false,
        summonSection: null,
        summonNonce: 0,

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
          // Mid-summon the cauldron holds a wrong item plus incoming ones: judging it would eject them all.
          if (s.phase !== "idle" || s.summoning) return;
          const result = matchRecipe(s.contents);
          if (result.kind === "match") s.openSection(result.recipe.section);
          else if (result.kind === "relic") s.openSection(RELICS[result.relic].slug);
          else if (result.kind === "invalid") s.clearAltar();
        },
        clearAltar: () =>
          set((s) =>
            s.phase !== "idle"
              ? s
              : {
                  contents: [],
                  ejectNonce: s.ejectNonce + 1,
                  summoning: false,
                  summonSection: null,
                  highlight: null,
                },
          ),
        openSection: (id) =>
          set((s) =>
            s.phase !== "idle"
              ? s
              : {
                  phase: "revealing",
                  activeSection: id,
                  summoning: false,
                  summonSection: null,
                  highlight: null,
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
        setTheme: (t) => {
          // The shared preference first (it flips <html data-theme> and is
          // remembered), then the mirror.
          setSiteTheme(t);
          set((s) => (s.theme === t ? s : { theme: t }));
        },
        toggleTheme: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),
        setHighlight: (id) => set((s) => (s.phase !== "idle" ? s : { highlight: id })),
        summonRecipe: (id) =>
          set((s) =>
            s.phase !== "idle" || s.summoning
              ? s
              : {
                  summoning: true,
                  summonSection: id,
                  summonNonce: s.summonNonce + 1,
                  highlight: null,
                },
          ),
        summonDone: () => set({ summoning: false, summonSection: null }),
      }),
      {
        name: "altar",
        storage: createJSONStorage(() => safeStorage),
        partialize: (s) => ({ unlocked: s.unlocked }),
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
