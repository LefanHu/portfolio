# Altar Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.



**Goal:** Build a desktop-only, interactive 3D "altar" version of Lefan's portfolio. Visitors drop physics items into an altar. A valid two-item recipe projects a wireframe-to-real render of one portfolio section, and the camera flies in to it.

**Architecture:** Pure TypeScript game logic (items, recipes, matching, a zustand state machine) lives in `lib/altar/` and is fully unit-tested. Portfolio content moves into shared data modules in `lib/portfolio/`, so the regular site and the altar read the same source. The R3F scene in `components/altar/` uses `@react-three/rapier` for physics, drei `CameraControls` for camera moves, drei `<Html transform>` for the projections and recipe board, and `@react-three/postprocessing` for bloom and AO. A thin client page loads the scene with `next/dynamic` and `ssr: false`.

**Tech Stack:** Next 16 App Router, React 19, three 0.183, @react-three/fiber 9, @react-three/drei 10, @react-three/postprocessing 3, @react-three/rapier 2.2 (new), zustand 5, Tailwind 4, Vitest 4 + Testing Library (jsdom).

**Spec:** `docs/superpowers/specs/2026-10-24-altar-portfolio-design.md`

## Global Constraints

- Read `node_modules/next/dist/docs/` (in particular `01-app/02-guides/lazy-loading.md`) before writing Next code. `ssr: false` is only allowed inside a Client Component.
- Desktop only. Phones get a "built for desktop" screen with a button to `/`.
- Recipes are two items each, and each recipe unlocks a whole section. There are six sections: `about`, `experience`, `projects`, `skills`, `interests`, `contact` (resume and contact).
- The recipe list is always visible. The altar clear control is always available. The logbook opens any section directly.
- Light and dark themes apply to both the scene and the projections. The initial theme comes from `prefers-color-scheme`. Toggles: clicking the lantern in the scene, and a UI button next to the logbook. Theme transitions take about 1.5s, never a hard cut.
- No ROR2 assets, models, icons, or names copied. Models are built in code or come from CC0 sources (Kenney, Quaternius, Poly Pizza) under `public/altar/`.
- Look rules: chunky flat-shaded low-poly, a strict muted palette plus one accent per artifact, only magic glows, motion everywhere (island bob, dust, rune pulse, item hover wobble).
- The regular portfolio at `/` stays the default and must not change visually.
- Commands: `pnpm test`, `pnpm lint`, `pnpm build`.

## Review Focus

1. **An item thrown off the island** should respawn on the desk, not vanish forever. Task 6 adds a `y < RESPAWN_Y` check, tested via `shouldRespawn`.
2. **An item bouncing on the altar rim** shouldn't trigger a reveal or eject when it only touched the altar. Contents are evaluated only after `SETTLE_MS` with no change. This is tested in the store (Task 3).
3. **Interacting during a reveal or while viewing a section** (drag, drop, clear, logbook click) should not corrupt state. The store ignores `itemEntered` and `clearAltar` outside `idle` (Task 3).
4. **A third item dropped in** should eject everything with the "wrong" burst, not get stuck. `matchRecipe` returns `invalid` for more than 2 items (Task 2).
5. **Browsers without WebGL** (or where WebGL fails) should show the same fallback as phones, with a link to `/`, not a blank canvas. `detectSupport` handles this (Task 5).

---

### Task 0: Look test (throwaway spike, user gate)

The spec makes this a hard gate: no further tasks start until Lefan approves the look.

**Files:**
- Create: `app/(portfolio-3D)/altar-look/page.tsx` (throwaway, deleted in Task 11)
- Create: `components/altar/lookdev/LookDev.tsx` (throwaway)

- [ ] **Step 1:** `pnpm add @react-three/rapier@2.2.0` (later tasks need it too; installing now catches peer-dependency issues early).
- [ ] **Step 2:** Build the island diorama: a floating rock chunk with grass top and hanging roots. Add the altar on worn stone with a rune ring, a desk with a lantern, and placeholder blocks for the 8 items. Add lighting (rim, ambient, sun), gradient fog, N8AO, Bloom (magic only, via emissive > 1 and `luminanceThreshold` ≈ 1), dust particles, island bob, and rune pulse. Add one floating wireframe projection panel to judge the line style. Include a light/dark toggle button.
- [ ] **Step 3:** Run `pnpm dev`, open `/altar-look`, and screenshot both themes.
- [ ] **Step 4: STOP.** Show Lefan both screenshots and the running page, then iterate until they approve. Record the approved palette (hex values per theme) and the light rig values. They become the constants in Task 4's `lib/altar/theme.ts`.
- [ ] **Step 5:** Commit the spike on the branch as `chore(altar): look test` so the approved values can be traced. It is deleted in Task 11.

### Task 1: Shared portfolio data modules

Move data out of component files so the regular site and the altar share one source. There is no behavior change to `/`.

**Files:**
- Create: `lib/portfolio/about.ts` exports `about` (`{ name, blurb, coop, education: {school, degree, period}, research: {title, period, description} }`) and `skillGroups` (moved from `components/portfolio/PortfolioAbout.tsx:1-5`)
- Create: `lib/portfolio/experience.ts` exports the `ExperienceRole` and `ExperienceBranch` types and `experienceBranches` (moved from `components/portfolio/PortfolioExperiences.tsx:1-118`)
- Create: `lib/portfolio/interests.ts` exports `interests` (the `features` array from `PortfolioInterests.tsx`) and `interestImages`
- Create: `lib/portfolio/contact.ts` exports `contact = { email: "l2hu@uwaterloo.ca", github: "https://github.com/LefanHu", linkedin: "https://www.linkedin.com/in/lefan-hu-579591204/", resumeHref: "/3a-external.pdf" }`
- Modify: `PortfolioAbout.tsx`, `PortfolioExperiences.tsx` (keep `export { experienceBranches }` re-export so `tests/portfolio-experiences.spec.tsx` still passes untouched), `PortfolioInterests.tsx`, `ContactForm.tsx` so they import from `lib/portfolio/*`
- Projects stay in `lib/portfolioProjects.ts` (already shared).
- Test: `tests/portfolio-data.spec.ts`

- [ ] **Step 1: Write the failing test** `tests/portfolio-data.spec.ts`:
  - `experienceBranches` has 3 branches and 5 roles total. The role titles include `"Amazon Robotics"`, `"Adentro"`, `"TELUS"`, `"Capital One"`, `"CIENA Corporation"`.
  - `skillGroups.map(g => g.title)` equals `["Programming", "Cloud and Systems", "AI, Hardware, and Web"]`.
  - `interests.length === 6`. `contact.email === "l2hu@uwaterloo.ca"`.
- [ ] **Step 2:** Run `pnpm test tests/portfolio-data.spec.ts`. Expected: FAIL (module not found).
- [ ] **Step 3:** Create the modules and repoint the components.
- [ ] **Step 4:** Run `pnpm test`. Expected: all pass, including the existing `portfolio-experiences`, `render-smoke`, and `metadata-and-home` specs.
- [ ] **Step 5:** Commit `refactor(portfolio): move section data into lib/portfolio`.

### Task 2: Items, recipes, matching

**Files:**
- Create: `lib/altar/items.ts`, `lib/altar/recipes.ts`
- Test: `tests/altar-recipes.spec.ts`

**Interfaces (Produces):**
```ts
export type ItemId = "tool" | "notebook" | "driveUnit" | "keyboard" | "fpgaChip" | "solderingIron" | "serverRack" | "chalkBag" | "fpvDrone" | "coffeeMug";
export type SectionId = "about" | "experience" | "projects" | "skills" | "interests" | "contact";
export interface Item { id: ItemId; name: string; flavor: string; }        // ROR2-style name + one-line flavor
export const ITEMS: Record<ItemId, Item>;
export interface Recipe { section: SectionId; items: [ItemId, ItemId]; artifact: { name: string; accent: string /* hex */ }; title: string; }
export const RECIPES: Recipe[];                                              // exactly 6, one per SectionId
export type MatchResult = { kind: "empty" } | { kind: "partial" } | { kind: "match"; recipe: Recipe } | { kind: "invalid" };
export function matchRecipe(contents: readonly ItemId[]): MatchResult;
```
The recipe table is the spec's (`tool+notebook→about`, `driveUnit+keyboard→experience`, `fpgaChip+solderingIron→projects`, `serverRack+keyboard→skills`, `chalkBag+fpvDrone→interests`, `coffeeMug+notebook→contact`). That makes 10 distinct items. The spec said "about 8", so 10 is fine. Artifact names and accents are the builder's choice and must be original.

- [ ] **Step 1: Write the failing tests:**
  - `matchRecipe([])` gives `{kind:"empty"}`. `matchRecipe(["keyboard"])` gives `{kind:"partial"}`.
  - `matchRecipe(["keyboard","driveUnit"])` and the reversed order both give `match` with `recipe.section === "experience"`.
  - `matchRecipe(["keyboard","notebook"])` gives `invalid`. `matchRecipe(["tool","notebook","keyboard"])` gives `invalid` (Review Focus 4).
  - `RECIPES` covers every `SectionId` exactly once. Every recipe item exists in `ITEMS`. Every `ItemId` is used by at least one recipe. Accents are unique 7-character hex values.
- [ ] **Step 2:** Run `pnpm test tests/altar-recipes.spec.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement it. Match by sorted pair comparison.
- [ ] **Step 4:** Run the test. Expected: PASS.
- [ ] **Step 5:** Commit `feat(altar): items and recipe matching`.

### Task 3: Altar state machine (zustand)

**Files:**
- Create: `lib/altar/store.ts`
- Test: `tests/altar-store.spec.ts`

**Interfaces:**
- Consumes: `ItemId`, `SectionId`, `matchRecipe` (Task 2)
- Produces:
```ts
export type Phase = "idle" | "revealing" | "viewing" | "returning";
export type Theme = "light" | "dark";
export const SETTLE_MS = 400;
export interface AltarState {
  phase: Phase;
  contents: ItemId[];              // items currently inside the altar sensor
  activeSection: SectionId | null;
  unlocked: SectionId[];           // for logbook "found" marks
  ejectNonce: number;              // increments whenever the scene must eject altar contents
  resetNonce: number;              // increments whenever items must return to the desk
  theme: Theme;
  itemEntered(id: ItemId): void;   // ignored unless phase === "idle"
  itemLeft(id: ItemId): void;
  evaluate(): void;                // called by the scene after SETTLE_MS of no change; match → reveal, invalid → eject
  clearAltar(): void;              // ignored unless idle; contents → [], ejectNonce++
  openSection(id: SectionId): void; // from logbook or recipe; phase → "revealing", unlock
  revealDone(): void;              // camera arrived; "revealing" → "viewing"
  closeSection(): void;            // "viewing"|"revealing" → "returning", resetNonce++
  returnDone(): void;              // "returning" → "idle", contents → []
  setTheme(t: Theme): void; toggleTheme(): void;
}
export const useAltarStore: UseBoundStore<StoreApi<AltarState>>;
export function createAltarStore(initialTheme?: Theme): ...; // factory so each test gets a fresh store
```

- [ ] **Step 1: Write the failing tests** using `createAltarStore()`:
  - `itemEntered` of `keyboard` then `driveUnit`, then `evaluate()`, gives `phase:"revealing"`, `activeSection:"experience"`, and `unlocked` contains `"experience"`.
  - `itemEntered` of `keyboard` then `notebook`, then `evaluate()`, gives `phase:"idle"`, `contents:[]`, and `ejectNonce` incremented by 1.
  - A single item followed by `evaluate()` leaves state unchanged.
  - `itemEntered` then `itemLeft` of the same id, then `evaluate()`, leaves `contents:[]` and `ejectNonce` unchanged (Review Focus 2).
  - `itemEntered("tool")` while `phase:"viewing"` is ignored. `clearAltar()` while `revealing` is ignored (Review Focus 3).
  - `clearAltar()` in idle with contents gives `contents:[]` and `ejectNonce + 1`.
  - `openSection("skills")` from idle, then `revealDone()`, `closeSection()`, `returnDone()`, walks through `revealing → viewing → returning → idle` with `activeSection` back to `null`.
  - Duplicate `itemEntered("tool")` twice keeps `contents` length 1.
  - `toggleTheme()` flips `dark ↔ light`.
  - Persistence: `unlocked` and `theme` (only these) persist to `sessionStorage` under key `"altar"` via zustand `persist` with a storage wrapper whose get/set are wrapped in try/catch. A store created after `unlocked:["projects"]` was saved rehydrates `unlocked:["projects"]` with `phase:"idle"`. A throwing `sessionStorage` must not crash store creation. This exists because project links leave the scene for `/projects/*` (Lefan's decision), and pressing browser Back should return to the altar with progress intact.
- [ ] **Step 2:** Run `pnpm test tests/altar-store.spec.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement it. The settle timer lives in the scene, not the store. The store stays synchronous and deterministic. A persisted `theme` takes precedence over `initialTheme()` on reload.
- [ ] **Step 4:** Run it. Expected: PASS.
- [ ] **Step 5:** Commit `feat(altar): altar state machine`.

### Task 4: Theme tokens

**Files:**
- Create: `lib/altar/theme.ts`, `lib/altar/useInitialTheme.ts`
- Test: `tests/altar-theme.spec.ts`

**Interfaces (Produces):**
```ts
export interface SceneTheme { sky: [string, string]; fog: string; fogNear: number; fogFar: number; ambient: number; sun: { color: string; intensity: number }; rim: { color: string; intensity: number }; lanternOn: boolean; stone: string; wood: string; grass: string; projection: { line: string; fill: string; text: string; blend: "additive" | "normal" }; }
export const THEMES: Record<Theme, SceneTheme>;   // values from Task 0's approved look
export const THEME_TRANSITION_S = 1.5;
export function initialTheme(matchMedia?: (q: string) => { matches: boolean }): Theme; // "(prefers-color-scheme: dark)" → dark, else light; no matchMedia → dark
```

- [ ] **Step 1: Write the failing test:** `initialTheme(() => ({matches:true}))` returns `"dark"`, `({matches:false})` returns `"light"`, and `initialTheme(undefined)` returns `"dark"`. `THEMES.dark.lanternOn === true`, `THEMES.light.lanternOn === false`, `THEMES.dark.projection.blend === "additive"`, and `THEMES.light.projection.blend === "normal"`.
- [ ] **Step 2:** Run it. Expected: FAIL. **Step 3:** Implement it with Task 0's values. **Step 4:** Run it. Expected: PASS.
- [ ] **Step 5:** Commit `feat(altar): theme tokens`.

### Task 5: Route, device gate, fallback screen

Lefan decided: the altar lives at a **new route `/altar`**. The old `/home` scene, `components/PortfolioScene.tsx`, and `/projects/threejs` stay untouched.

**Files:**
- Create: `app/(portfolio-3D)/altar/page.tsx`, a Server Component that renders `<AltarEntry />`, with metadata `title: "Lefan's Altar"`. It inherits `app/(portfolio-3D)/layout.tsx`, so there's no navbar.
- Create: `components/altar/AltarEntry.tsx` (`"use client"`). It runs `detectSupport(readSupportEnv())` after mount. If unsupported it renders `<DesktopOnly />`; otherwise it renders `dynamic(() => import("./AltarExperience"), { ssr: false })` with the existing `components/three/LoaderSceen.tsx` `LoaderScreen` as loading UI.
- Create: `components/altar/DesktopOnly.tsx` with the copy: heading "This one's built for desktop", a body line, and a link "Visit the regular portfolio" → `/`.
- Create: `lib/altar/support.ts`
- Modify: `app/(portfolio)/page.tsx` adds a "Try the 3D version →" link to `/altar` under the h1.
- Modify (only if the import fails under jsdom): `tests/module-smoke.spec.ts` gets `app/(portfolio-3D)/altar/page.tsx` added to `pageSmokeExclusions`. `components/altar/**` must also be excluded from the component smoke run, the same way `components/three` already is.
- Test: `tests/altar-support.spec.ts`, `tests/altar-entry.spec.tsx`

**Interfaces (Produces):**
```ts
export type SupportResult = { ok: true } | { ok: false; reason: "phone" | "no-webgl" };
export function detectSupport(env: { coarsePointer: boolean; minScreenSide: number; hasWebGL2: boolean }): SupportResult; // phone when coarsePointer && minScreenSide < 768
export function readSupportEnv(): { coarsePointer: boolean; minScreenSide: number; hasWebGL2: boolean };
```

- [ ] **Step 1: Write the failing tests:**
  - `detectSupport({coarsePointer:true,minScreenSide:390,hasWebGL2:true})` gives `{ok:false,reason:"phone"}`.
  - A tablet (`coarsePointer:true, minScreenSide:820`) gives `ok:true`.
  - Desktop with `hasWebGL2:false` gives `{ok:false,reason:"no-webgl"}` (Review Focus 5).
  - `render(<DesktopOnly />)` has a link with name /regular portfolio/ and `href="/"`.
- [ ] **Step 2:** Run it. Expected: FAIL. **Step 3:** Implement it. **Step 4:** Run `pnpm test`. Expected: PASS, with the smoke tests updated.
- [ ] **Step 5:** Commit `feat(altar): route, device gate, desktop-only fallback`.

### Task 6: Scene shell, island, altar, desk, theme application

Promote Task 0's approved look-dev into real components.

**Files:**
- Create: `components/altar/AltarExperience.tsx` (Canvas, `<Physics>`, CameraControls, postprocessing, DOM overlay mount)
- Create: `components/altar/scene/Island.tsx`, `Altar.tsx` (the grand **cauldron** altar from Task 0's approved look — large basin, swirling energy, embers, rune ring — with a basin-sized `CuboidCollider sensor` so thrown items land inside; reporting `itemEntered/itemLeft` via `userData.itemId`, plus the clear lever), `Desk.tsx` (with clickable `Lantern` calling `toggleTheme`), `Atmosphere.tsx` (sky gradient, fog, lights, dust; lerps current values toward `THEMES[theme]` over `THEME_TRANSITION_S`), `Effects.tsx` (N8AO, Bloom, SMAA)
- Create: `lib/altar/layout.ts` exports `ALTAR_POS`, `DESK_POS`, `ITEM_HOME: Record<ItemId,[x,y,z]>`, `RESPAWN_Y = -10`, `CAMERA_HOME: {position, target}`, `ORBIT_LIMITS: {azimuth: [min,max], polar: [min,max], distance: [min,max]}`, and `shouldRespawn(y: number): boolean`
- Test: `tests/altar-layout.spec.ts`

- [ ] **Step 1: Write the failing test:** `shouldRespawn(-10.01)` is true and `shouldRespawn(0)` is false. Every `ItemId` has an `ITEM_HOME`. All homes lie within 2 units of `DESK_POS` on x/z.
- [ ] **Step 2:** Run it. Expected: FAIL. **Step 3:** Implement layout and the scene components. The camera is constrained by `ORBIT_LIMITS`, with no pan.
- [ ] **Step 4:** Run `pnpm test`. Expected: PASS. Run `pnpm dev`, open `/altar`: the island renders in both themes and matches Task 0's approved screenshots. The lantern click and the theme cross-fade both work.
- [ ] **Step 5:** Commit `feat(altar): scene shell and theming`.

### Task 7: Physics items and drag-and-drop

**Files:**
- Create: `components/altar/items/ItemModel.tsx` (one low-poly model per `ItemId`, built in code or CC0 `.glb` under `public/altar/`)
- Create: `components/altar/items/DraggableItem.tsx` (RigidBody + collider, `userData.itemId`, hover wobble plus a drei `<Html>` tooltip with `ITEMS[id].name`/`flavor`)
- Create: `lib/altar/drag.ts` exports `dragTarget(ray: {origin, direction}, planeY: number): [x,y,z] | null` (ray to horizontal plane intersection; null if parallel or behind) and `LIFT_HEIGHT = 0.6`
- Test: `tests/altar-drag.spec.ts`

Behavior: on pointer down, the body switches to `kinematicPosition` and follows `dragTarget` on the plane at `LIFT_HEIGHT` above the desk/altar top. Orbit is disabled during a drag. On release, it switches back to `dynamic` with velocity from the last frames (light throwing). Items with `shouldRespawn(y)` true teleport to `ITEM_HOME`. A `resetNonce` change returns all items home. An `ejectNonce` change applies an up-and-outward impulse to the bodies inside the altar and spawns a small burst. Drag is disabled unless `phase === "idle"`. In the scene, a debounce calls `evaluate()` `SETTLE_MS` after the last `contents` change.

- [ ] **Step 1: Write the failing tests:** a ray from `[0,5,0]` with direction `[0,-1,0]` to `planeY 1` gives `[0,1,0]`. A ray parallel to the plane gives `null`. A ray pointing away gives `null`.
- [ ] **Step 2:** Run it. Expected: FAIL. **Step 3:** Implement. **Step 4:** Run `pnpm test`. Expected: PASS. Manual check: drag each item into the altar. A right pair triggers `revealing` (visible via a temporary log). A wrong pair ejects. A thrown-off item respawns.
- [ ] **Step 5:** Commit `feat(altar): draggable physics items`.

### Task 8: Section projections (wireframe to real content)

**Files:**
- Create: `components/altar/projection/sections/{About,Experience,Projects,Skills,Interests,Contact}Panel.tsx`. These are plain React DOM panels reading `lib/portfolio/*` and `lib/portfolioProjects.ts`, styled via CSS variables `--proj-line/--proj-fill/--proj-text/--proj-accent`. Each block carries `data-wire` so the build-up CSS can show outline-only boxes first.
- Create: `components/altar/projection/SectionPanel.tsx` exports `SectionPanel({ section, stage }: { section: SectionId; stage: "wire" | "filled" })`, which picks the panel and sets `data-stage` on the root.
- Create: `components/altar/projection/projection.css`: in `data-stage="wire"`, text is transparent, borders draw with a `stroke-dashoffset`/`clip-path` animation in `--proj-line`; `filled` fades content in over 600ms.
- Create: `components/altar/projection/Projection.tsx` (scene side). It renders `<Html transform>` above the altar at a fixed world size, tinted with `recipe.artifact.accent`, plus rising particles. It moves `stage` from wire to filled after the draw animation, then calls `CameraControls.fitToBox` on the panel bounds. On camera rest it calls `revealDone()`. On `closeSection` it dissolves, moves the camera to `CAMERA_HOME`, and calls `returnDone()`.
- Test: `tests/altar-panels.spec.tsx`

- [ ] **Step 1: Write the failing tests** rendering `<SectionPanel stage="filled" section=…/>`:
  - `experience` shows all 5 role titles.
  - `projects` shows every `projects[i].name` plus `"LLM Inference Accelerator"`, and links have the correct `href`.
  - `skills` shows `"SystemVerilog"`.
  - `contact` shows a mailto link to `l2hu@uwaterloo.ca`, the GitHub and LinkedIn links, and a resume link with `contact.resumeHref`.
  - `about` shows `"University of Waterloo"`.
  - `interests` shows `"Rock Climbing"`.
  - `stage="wire"` sets `data-stage="wire"` on the root.
- [ ] **Step 2:** Run it. Expected: FAIL. **Step 3:** Implement. External links open in a new tab. Internal project links (`/projects/...`) navigate in the same tab to the normal page (Lefan's decision). There is no in-scene project projection. Browser Back returns to `/altar` in idle, with `unlocked` and `theme` restored from Task 3's persistence.
- [ ] **Step 4:** Run `pnpm test`. Expected: PASS. Manual check: each recipe shows its projection drawing in, the camera fills the screen with it, the text is readable at 1280×720 and 2560×1440, and the panel scrolls and its links work in both themes.
- [ ] **Step 5:** Commit `feat(altar): section projections`.

### Task 9: Overlay UI (recipe board, logbook, back, theme button)

**Files:**
- Create: `components/altar/ui/RecipeBoard.tsx` (DOM, so it can render inside a scene `<Html>` beside the altar). It lists `RECIPES` as "Item A + Item B → title", marking unlocked ones.
- Create: `components/altar/ui/Overlay.tsx` (DOM over the canvas): a Logbook button and a drawer listing all 6 sections (clicking one calls `openSection` and closes the drawer, disabled unless idle), a theme toggle button with an accessible label, and a Back button visible while `viewing|revealing` that calls `closeSection`. An Esc keydown listener calls `closeSection` when viewing.
- Test: `tests/altar-ui.spec.tsx` (uses `createAltarStore` through a `StoreProvider` or by resetting `useAltarStore.setState` before each test)

- [ ] **Step 1: Write the failing tests:**
  - `RecipeBoard` renders 6 entries, including the text "Drive Unit" and "Keyboard" in the experience entry.
  - Clicking Logbook, then "Projects", sets store `phase:"revealing"` and `activeSection:"projects"`.
  - With phase `viewing`, the Back button is visible, and pressing Escape gives phase `"returning"`.
  - The theme button flips `theme`.
  - With phase `idle`, the Back button is not in the document.
- [ ] **Step 2:** Run it. Expected: FAIL. **Step 3:** Implement. Mount `RecipeBoard` in the scene via `<Html transform>` beside the altar, and `Overlay` in `AltarExperience`.
- [ ] **Step 4:** Run `pnpm test`. Expected: PASS.
- [ ] **Step 5:** Commit `feat(altar): recipe board, logbook, and controls`.

### Task 10: Polish (single-item reactions, eject burst, sound off by default)

**Files:** modify `components/altar/scene/Altar.tsx` and `components/altar/items/DraggableItem.tsx`. Optionally create `components/altar/scene/Burst.tsx`.

- [ ] **Step 1:** With 1 item in the altar, the runes brighten in that item's recipe accent (or neutral), plus a soft glow. An eject gives a particle burst in a neutral color. The clear lever animates. No sound is added in this plan (the spec says sound is optional; skipping it avoids the mute-toggle requirement).
- [ ] **Step 2:** Manual check in both themes. Run `pnpm test && pnpm lint`. Expected: clean.
- [ ] **Step 3:** Commit `feat(altar): altar reactions and eject burst`.

### Task 11: Cleanup and full verification

- [ ] **Step 1:** Delete `app/(portfolio-3D)/altar-look/` and `components/altar/lookdev/`.
- [ ] **Step 2:** Run `pnpm test`. Expected: all pass. Run `pnpm lint`. Expected: no errors. Run `pnpm build`. Expected: success, with `/altar` and `/home` both built.
- [ ] **Step 3:** End-to-end manual pass on `pnpm start`:
  - Desktop: complete all 6 recipes and check each projection.
  - Use the logbook path for each section.
  - Do a wrong pair, a 3-item drop, and clear mid-way.
  - Throw an item off the island.
  - Toggle the theme from both the lantern and the button.
  - Use Esc and Back.
  - Emulate a phone in devtools (fallback appears).
  - Disable WebGL (fallback appears).
  - Check that `/` is unchanged apart from the new link.
- [ ] **Step 4:** Commit `chore(altar): remove look test`.

## Verification (whole plan)

- `pnpm test`: unit tests for recipes, store, theme, support, layout, drag math, panels, and UI.
- `pnpm lint` and `pnpm build` both clean.
- Task 11's manual end-to-end checklist in a real browser in both themes, plus Lefan's sign-off on the look at Task 0.

## Before Task 0 (on approval)

- Copy this plan to `docs/superpowers/plans/2026-10-24-altar-portfolio.md`.
- Update the spec with Lefan's answers:
  - The route is the new `/altar`, and the old `/home` and `/projects/threejs` stay unchanged. This replaces the "replaces `/home`" constraint.
  - Project links go to the normal `/projects/*` pages, with unlocked progress and theme kept in `sessionStorage`.
  - The resume is `public/3a-external.pdf`.
  - Fix the spec's "he/himself" pronouns for Lefan to "they".
- Commit the spec and plan together: `docs: altar portfolio design and plan`.

## Execution

I recommend **subagent-driven** execution. There are 12 tasks with tight interface dependencies (store → scene → projection → UI), and a mistake shipped in the scene is costly to untangle, so a per-task reviewer pays off. Task 0 still stops for Lefan's look sign-off whichever method is used.

## Decisions made by me (check while reading)

- 10 items, not "about 8". The six spec recipes need 10 distinct items.
- Logbook, theme button, and Back button are a DOM overlay. The recipe board is DOM-in-scene (drei `<Html transform>`).
- No sound in this plan.
- "Phone" means a coarse pointer and a shortest screen side under 768px, so tablets are allowed.
- No WebGL2 shows the same desktop-only fallback screen.
- Item drop is debounced 400ms (`SETTLE_MS`) before the altar evaluates.
