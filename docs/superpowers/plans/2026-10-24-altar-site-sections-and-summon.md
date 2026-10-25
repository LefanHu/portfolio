# Altar: Real Site Sections + Clickable Recipes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.


## Context

Lefan asked for two changes to the `/altar` portfolio, which is now on `main`:

1. **The projection should render the main website, not a duplicate.** The altar currently has six hand-built panels (`components/altar/projection/sections/*Panel.tsx`) plus about 500 lines of panel CSS that re-implement the site. **Decision (Lefan):** reuse the main site's own section components inside the projection, keeping the per-recipe sections and the wireframe draw-in. Any edit to the main site then shows up in both places.
2. **It isn't clear which model is which.** **Decision (Lefan):**
   - Each recipe line on the board becomes clickable. Clicking makes the cauldron **suck its two items in**: they lift off, arc over, spiral down into the basin, and the normal reveal follows.
   - Hovering a recipe line also **highlights its two items** on the desk, with an accent ring and their name tags.

**Goal:** The projection mounts the main site's components, and the recipe board can summon a recipe's items into the cauldron, with a hover highlight on those items.

**Architecture:**
- `SectionPanel` keeps its frame, header, scroller and wire lifecycle, but swaps its body for the main site's section components. It auto-tags their DOM for the wire draw-in, so the components stay untouched.
- Summoning is a store request (`summonRecipe`). The scene's `Items` orchestrator answers it by flying kinematic bodies along a pure, tested path (`lib/altar/summon.ts`). The existing occupancy → settle → `evaluate()` → reveal pipeline does the rest.

**Tech Stack:** As before: Next 16, React 19, three 0.183, R3F 9, drei 10, @react-three/rapier 2.2, zustand 5, Vitest 4 + Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-24-altar-portfolio-design.md` (plus the Revision 2 section added on approval).

## Global Constraints

- Read `AGENTS.md`. This Next version differs from training data, so read `node_modules/next/dist/docs/` before writing Next code.
- `/` must not change visually. Main-site components may be refactored but must render identically there.
- Main-site section components stay unmodified, except for the About split in Task 1. All altar-specific behaviour (wire tagging, link targets, backdrop) lives in `components/altar/projection/`.
- Desktop only. Recruiters must never get stuck. Logbook, Back/Esc and the clear lever keep working unchanged.
- Light and dark themes still apply to the scene, frame, beam, header and board.
  - **My call:** the site content keeps the main site's dark styling in both themes, on a dark backdrop inside the pane. The main site is dark-only, and restyling it would change `/`.
- Theme cross-fades stay at about 1.5 s; no hard cuts in scene or frame.
- Commands: `pnpm test`, `pnpm lint`, `pnpm build`.
- Never commit `AGENTS.md`. Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **A recipe clicked while other items sit in the cauldron.** The extras are ejected and the recipe still completes; they must not trigger an "invalid" eject of everything. Pinned by the `summonPlan` tests (Task 3) and the "evaluate is a no-op while summoning" store test (Task 4).
2. **The phase leaving idle mid-summon** (logbook opens a section, or Esc). Flights cancel, no item is left kinematic, and items return home with the section. Pinned by the store test "openSection clears summoning and highlight" (Task 4) and the cancel path in Task 6's manual check.
3. **A second recipe, or the same one again, clicked mid-summon.** It is ignored. Pinned by a store test (Task 4) and a board test where buttons are disabled while summoning (Task 5).
4. **External links in the projection** (GitHub, LinkedIn) would otherwise navigate away from the altar in the same tab, because the main site's links have no `target`. They open in a new tab; internal `/projects/*` links stay same-tab. Pinned by a SectionPanel test (Task 2).
5. **Main-site components inside a narrower pane at 1280×720.** They use viewport media queries, so check for no horizontal overflow and that the pane scrolls. Pinned by Task 2's screenshot step.

---

### Task 1: Split the About component (main site)

**Files:**
- Modify: `components/portfolio/PortfolioAbout.tsx`
- Test: `tests/portfolio-about.spec.tsx` (new)

**Interfaces (Produces):**
- `export function AboutSummary(): JSX.Element` renders the intro, coop line, Education and Research.
- `export function TechnicalSkills(): JSX.Element` renders the "Technical Skills" heading and the `skillGroups` grid.
- `export default function About()`: same outer `<section>` with the same classes, rendering `AboutSummary` content then `TechnicalSkills` content, so the DOM is identical to today.

- [ ] **Step 1: Write the failing tests:**
  - `AboutSummary` renders heading "About Me" and text "University of Waterloo", and has no "SystemVerilog".
  - `TechnicalSkills` renders heading "Technical Skills" and "SystemVerilog".
  - `About` renders all of the above.
  - Snapshot equality: `render(<About />).container.innerHTML` equals the pre-change markup. Capture it with `git show HEAD:components/portfolio/PortfolioAbout.tsx` into a fixture string in the test, or assert the identical class list on the root `section` plus child order.
- [ ] **Step 2:** `pnpm test tests/portfolio-about.spec.tsx`. Expected: FAIL (no named exports).
- [ ] **Step 3:** Implement the split. The standalone `AboutSummary` and `TechnicalSkills` each render inside their own `section`, with the same border, background and padding classes as `About`, so they look like site cards on their own. `About` composes the inner fragments so its markup is unchanged.
- [ ] **Step 4:** `pnpm test`. Expected: all pass.
- [ ] **Step 5:** Commit `refactor(portfolio): split About into summary and skills`.

### Task 2: Projection renders the main site's sections

**Files:**
- Modify: `components/altar/projection/SectionPanel.tsx`, `components/altar/projection/projection.css`
- Create: `components/altar/projection/wireTags.ts`
- Delete: `components/altar/projection/sections/` (all 7 files)
- Modify tests: `tests/altar-panels.spec.tsx` (rewrite the content cases)
- Test: `tests/altar-wire-tags.spec.ts` (new)

**Interfaces:**
- Consumes: `AboutSummary` and `TechnicalSkills` (Task 1); default exports of `PortfolioExperiences`, `PortfolioProjects` (FavProjects), `PortfolioInterests` and `components/ContactForm`.
- Produces: `PANELS: Record<SectionId, ComponentType>` with this mapping:

  | Section | Component |
  |---|---|
  | `about` | `AboutSummary` |
  | `skills` | `TechnicalSkills` |
  | `experience` | Experiences |
  | `projects` | FavProjects |
  | `interests` | Interests |
  | `contact` | ContactForm |

- Produces: `export const MAX_WIRE_BLOCKS = 80`.
- Produces: `export function tagWireBlocks(root: HTMLElement, max = MAX_WIRE_BLOCKS): number`, which sets `data-wire` and returns the count. It walks `root` in document order:
  1. `h1–h4, p, dt, dd` get `"text"`.
  2. `article, section, a, li`, plus any element whose `className` contains `rounded` or `border`, get `"box"`.
  3. The parent of an `img` gets `"img"` when that parent has exactly one element child. An `img` can't take pseudo-elements, which is why the parent is tagged.
  4. Skip any element inside an element already tagged `"text"`, and anything that already has `data-wire`.
  5. Stop after `max`. Untagged content simply fades in at `filled`.
- Produces: `export function openExternalInNewTab(e: MouseEvent | React.MouseEvent, origin = location.origin): void`. If the click target's closest `a[href]` is `http(s)` and on a different origin, it calls `preventDefault()` and `window.open(href, "_blank", "noopener,noreferrer")`. Internal links and `mailto:` are untouched. Attach it as `onClickCapture` on the panel root.

- [ ] **Step 1: Write the failing tests:**
  - **`altar-wire-tags.spec.ts`:**
    - On a fixture DOM, `h2` → text, `p` → text, `div.rounded-2xl` → box, `a` → box, and an img wrapper → img.
    - A `p` inside a tagged `h2` is not tagged.
    - The count is capped at `max`.
    - Calling it twice does not re-tag (idempotent).
  - **`altar-panels.spec.tsx`, rewritten content cases** (each through `<SectionPanel section stage="filled" />`):
    - experience shows all 5 role titles.
    - projects shows "Favorite Projects", and the "LLM Inference Accelerator" link has `href = acceleratorProject.href`.
    - skills shows "Technical Skills" and "SystemVerilog", and does **not** show "Research".
    - about shows "About Me" and "University of Waterloo".
    - interests shows "Rock Climbing".
    - contact shows a `mailto:l2hu@uwaterloo.ca` link, the GitHub and LinkedIn links, and a header link "Download résumé" with `href = contact.resumeHref` and `target="_blank"`.
    - After render, the root contains at least 3 `[data-wire]` blocks for every section.
    - Clicking the GitHub link calls `window.open` (spied) with `contact.github`, `"_blank"` and `"noopener,noreferrer"`, and `defaultPrevented` is true.
    - Clicking the accelerator link (internal `/projects/...`) does not call `window.open`.
    - Keep the existing `data-stage`, recipe-title and accent cases.
- [ ] **Step 2:** `pnpm test tests/altar-panels.spec.tsx tests/altar-wire-tags.spec.ts`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - **SectionPanel:**
    - Remap `PANELS`.
    - Wrap the body in `<div className="ap-site">` inside `.ap-scroll`.
    - In the existing `useLayoutEffect` on `section`, call `tagWireBlocks(scrollEl)` before querying `[data-wire]` for `wireDelays`.
    - Add `onClickCapture={openExternalInNewTab}`.
    - For `contact`, render the header action `<a className="ap-head__action" href={contact.resumeHref} target="_blank" rel="noopener noreferrer">Download résumé</a>`. **My call:** the main site's contact block has no résumé link, and the recipe is "Resume & Contact".
  - **projection.css:**
    - Delete the panel-only rules: `.ap-card` … `.ap-linkrow`, i.e. `.ap-label` through `.ap-linkrow .ap-meta` and the `.ap-feature__art` pulses.
    - Keep root, head, scroll, wire/dissolve rules and keyframes.
    - Add `.ap-site`: dark site backdrop in both themes (`background: #0b1120`, `color-scheme: dark`, `padding: 2rem`, `font-size: 16px` so the main site's rem sizing is unaffected by the pane's `em` base). The `.ap-head` stays theme-styled.
    - The wire-stage rules that blank text and draw `::before` outlines already key off `[data-wire]`, so they apply unchanged. Check that `.ap-root[data-stage="wire"] :is(.ap-head, .ap-scroll) *` still hides `img`/`svg` until `filled`.
    - Add `.ap-head__action`, styled like the header eyebrow in the accent.
  - **Delete** `sections/`, and remove any now-unused exports (`linkTarget`, `WireImage`) and their tests.
- [ ] **Step 4:** `pnpm test`. Expected: all pass. `pnpm lint`: clean.
- [ ] **Step 5: Visual check (Review Focus 5).**
  - Build and serve: `pnpm build && PORT=3110 pnpm start`.
  - Open each section via the logbook in headless Chrome over CDP, at 1280×720 and 1600×900, in both themes. Use Rapier-free paths: `?theme=` plus logbook clicks.
  - Screenshot the wire stage and the filled stage.
  - Pass criteria:
    - The content reads like the main site.
    - No horizontal scrollbar or clipped cards. SlidingCards and the Carousel switch at viewport 1100 px; if a variant overflows the pane, add an `.ap-site` CSS override that hides the overflowing variant, without touching the component.
    - Wheel-scroll reaches the end of the section.
    - The wire stage shows outlines, not a blank pane.
- [ ] **Step 6:** Commit `feat(altar): projection renders the main site's sections`.

### Task 3: Summon math

**Files:**
- Create: `lib/altar/summon.ts`
- Test: `tests/altar-summon.spec.ts`

**Interfaces (Produces):**
```ts
export const SUMMON_FLIGHT_MS = 1100;        // one item's flight
export const SUMMON_STAGGER_MS = 280;        // second item starts this much later
export const SUMMON_EJECT_WAIT_MS = 600;     // wait for ejected extras to clear before flights
export const SUMMON_RELEASE_SPEED = 2;       // downward speed (u/s) when the body turns dynamic
export const SUMMON_DROP_POINT: Vec3;        // [ALTAR_POS.x, RIM_TOP_Y + 0.45, ALTAR_POS.z]
export function summonPlan(pair: readonly [ItemId, ItemId], occupants: readonly ItemId[]): { extras: ItemId[]; fly: ItemId[] };
export function summonPath(from: Vec3, t: number): Vec3; // t in [0,1], clamped
```

`summonPath` is decided here:
- **Ease:** apply smoothstep to `t` → `u`.
- **Phase A, u ∈ [0, 0.6]:** an arc. Lerp xz from `from` toward a point on a circle of radius `CAULDRON_DROP_RADIUS` around the cauldron axis, on `from`'s side. y follows a parabola peaking at `CAULDRON_WALL_TOP + 1.2`.
- **Phase B, u ∈ [0.6, 1]:** a spiral. The angle around the axis advances 1.5 turns; the radius shrinks linearly from `CAULDRON_DROP_RADIUS` to 0; y lerps from the arc's end height down to `SUMMON_DROP_POINT[1]`.
- `u = 1` returns exactly `SUMMON_DROP_POINT`.

- [ ] **Step 1: Write the failing tests:**
  - `summonPath(from, 0)` equals `from`. `summonPath(from, 1)` equals `SUMMON_DROP_POINT`. Out-of-range `t` is clamped.
  - For desk, ground and far-side starts, sample t = 0..1 in steps of 0.01:
    - The max y is at least `CAULDRON_WALL_TOP + 1.0`.
    - Every sample with xz distance to the axis ≥ `CAULDRON.rimInner` has y > `CAULDRON_WALL_TOP` (it never clips the wall).
    - From u ≥ 0.6, the xz radius is ≤ `CAULDRON_DROP_RADIUS` and never increases.
  - `summonPlan(["keyboard","driveUnit"], [])` gives `{extras:[], fly:["keyboard","driveUnit"]}`.
  - `summonPlan(pair, ["keyboard"])` gives `fly:["driveUnit"]`.
  - `summonPlan(pair, ["notebook","keyboard"])` gives `extras:["notebook"], fly:["driveUnit"]`.
- [ ] **Step 2:** Run it. Expected: FAIL. **Step 3:** Implement. **Step 4:** Run it. Expected: PASS.
- [ ] **Step 5:** Commit `feat(altar): summon flight math`.

### Task 4: Store: summon and highlight

**Files:**
- Modify: `lib/altar/store.ts`, `lib/altar/settle.ts`
- Test: `tests/altar-store.spec.ts`, `tests/altar-settle.spec.ts`

**Interfaces (Produces, added to `AltarState`; none of these are persisted):**
```ts
highlight: SectionId | null;
summoning: boolean;
summonSection: SectionId | null;
summonNonce: number;
setHighlight(id: SectionId | null): void;   // ignored (stays null) unless idle
summonRecipe(id: SectionId): void;          // only when idle && !summoning → summoning:true, summonSection:id, summonNonce+1, highlight:null
summonDone(): void;                         // summoning:false, summonSection:null
```
Changes:
- `evaluate()` is a no-op while `summoning`.
- `openSection` and `clearAltar` (when they apply) also set `summoning:false, summonSection:null, highlight:null`.
- `createSettleScheduler` also re-arms when `summoning` flips true → false while idle with contents.

- [ ] **Step 1: Write the failing tests:**
  - `summonRecipe("projects")` in idle gives `summoning:true`, `summonSection:"projects"`, `summonNonce:1`.
  - A second `summonRecipe` while summoning is ignored (nonce stays 1).
  - `summonRecipe` while `phase:"viewing"` is ignored.
  - With `contents:["notebook","keyboard"]`, `summoning:true`, `evaluate()` leaves the phase idle and `ejectNonce` unchanged.
  - `openSection` while summoning clears `summoning`, `summonSection` and `highlight`.
  - `setHighlight("skills")` in idle sets it. In viewing it stays null.
  - Persisted keys are still only `unlocked` and `theme`.
  - **settle spec:** contents unchanged and `summoning` flipping false triggers `evaluate` after `SETTLE_MS` (fake timers).
- [ ] **Step 2:** Run it. Expected: FAIL. **Step 3:** Implement. **Step 4:** `pnpm test`. Expected: PASS.
- [ ] **Step 5:** Commit `feat(altar): summon and highlight state`.

### Task 5: Clickable recipe board

**Files:**
- Modify: `components/altar/ui/RecipeBoard.tsx`, `components/altar/ui/RecipeBoardInScene.tsx`, `components/altar/ui/ui.css`, `components/altar/ui/Overlay.tsx` (hint copy)
- Test: `tests/altar-ui.spec.tsx`

**Behaviour:**
- Each `li.au-recipe` wraps its content in a `<button type="button" className="au-recipe__btn">` with accessible name `` `Summon ${ITEMS[a].short} and ${ITEMS[b].short}` ``.
  - `onClick` → `summonRecipe(section)`.
  - `onPointerEnter` and `onFocus` → `setHighlight(section)`; `onPointerLeave` and `onBlur` → `setHighlight(null)`.
  - `disabled` unless `phase === "idle" && !summoning`.
- The entry for the in-flight `summonSection` gets `data-summoning="true"` (an accent pulse via CSS).
- `RecipeBoardInScene`: the Html gets `pointerEvents="auto"`, and the board's CSS `pointer-events` goes from `none` to `auto` on the list only. The header and footer stay pass-through.
- Update the board docblock, which currently says the board is purely informational.
- Hint copy: "Drag two items from the desk into the cauldron, click a recipe, or open the Logbook."

- [ ] **Step 1: Write the failing tests:**
  - Clicking the "Summon Drive Unit and Keyboard" button gives the store `summoning:true`, `summonSection:"experience"`.
  - Hovering the projects entry sets `highlight:"projects"`; leaving sets null.
  - With `summoning:true`, all six buttons are disabled.
  - With `phase:"viewing"`, all six are disabled.
  - Update the hint test regex to `/click a recipe/i`. Keep the existing board tests green.
- [ ] **Step 2:** Run it. Expected: FAIL. **Step 3:** Implement. **Step 4:** `pnpm test`. Expected: PASS.
- [ ] **Step 5:** Commit `feat(altar): clickable recipe board`.

### Task 6: Scene: item highlight and summon flights

**Files:**
- Modify: `components/altar/items/DraggableItem.tsx`, `components/altar/items/Items.tsx`
- Create: `components/altar/items/ItemHighlight.tsx`

**Interfaces:**
- Consumes: Task 3 (`summonPlan`, `summonPath`, the constants) and Task 4 (`highlight`, `summonNonce`, `summonSection`, `summonDone`).
- Produces: `ItemHandle.summon(delayMs: number): Promise<void>`. It resolves when the body is released into the cauldron, or early if cancelled. `endDrag` and `sendHome` cancel an active flight and resolve its promise.

**Behaviour:**
- **Highlight:**
  - When the store's `highlight` recipe includes this item, show the `HoverTip` name tag (`showTip ||= highlighted`), run the hover wobble, and render `ItemHighlight`.
  - `ItemHighlight` is a flat additive ring, radius `reach + 0.08`, at the item's base, following the body per frame like the tip group. Colour is the recipe accent with emissive intensity > 1 (bloom picks it up), and it fades in and out over 0.15 s.
  - Pointer hover on the item itself still works as before.
- **Summon flight** (in `DraggableItem`'s `useFrame`):
  - At start, after the delay: record `from`, switch to `KinematicPositionBased` with `DRAGGED_GROUPS`, and disable CCD (same as a pick-up).
  - Each frame: `setNextKinematicTranslation(summonPath(from, elapsed / SUMMON_FLIGHT_MS))`, plus a slow spin about y.
  - At t ≥ 1: switch to Dynamic, restore `ITEM_GROUPS`, enable CCD, set linvel `(0, -SUMMON_RELEASE_SPEED, 0)`, and resolve.
  - While flying, the item is not draggable (pointer down ignored) and the respawn check is skipped.
- **Orchestration** (`Items.tsx`, on a `summonNonce` change):
  1. Get the recipe pair for `summonSection`, then `summonPlan(pair, getAltarOccupants())`.
  2. Eject only the `extras`. Refactor the existing eject loop into `ejectOccupants(ids: ItemId[])`, used by both `ejectNonce` and summon.
  3. Wait `SUMMON_EJECT_WAIT_MS` if there were extras.
  4. Call `handles.get(id).summon(i * SUMMON_STAGGER_MS)` for each `fly` item.
  5. `Promise.all`, then `summonDone()`.
  - Cancellation: the existing "phase leaves idle → endDrag all" already cancels flights. Also call `summonDone()` if any flight resolved cancelled, so the store never stays `summoning`.

- [ ] **Step 1:** `pnpm test` and `pnpm lint` stay green. This is scene code with no jsdom coverage; the logic lives in Tasks 3–4.
- [ ] **Step 2: Manual check** on `pnpm build && PORT=3110 pnpm start` with headless Chrome + CDP. Expose a temporary store hook if needed and remove it before committing. Screenshots in both themes.
  - Hover each recipe: both items show rings and name tags.
  - Click each of the 6 recipes from a clean desk: both items fly in and the section reveals.
  - Put a wrong item in, then click a recipe: the wrong item is ejected and the recipe completes (Review Focus 1).
  - Put one recipe item in, then click: only the other flies.
  - Click a recipe, then immediately open a section from the logbook: no item is left hanging kinematic, and Back returns everything home (Review Focus 2).
  - Double-click a recipe: only one summon runs (Review Focus 3).
- [ ] **Step 3:** Commit `feat(altar): summon recipes into the cauldron, highlight items`.

### Task 7: Full verification

- [ ] `pnpm test`, `pnpm lint` and `pnpm build` are all clean.
- [ ] `/` renders identically to `main`: SSR HTML diff of `/`, built from `main` and from this branch; only identical output is acceptable.
- [ ] Re-run Task 11's checklist from the first plan (logbook path, wrong pair, clear lever, throw off island, theme via lantern and button, Esc/Back, phone and no-WebGL fallbacks), plus the Task 6 summon checks.

## Verification (whole plan)

- **Unit tests:** About split, wire tagging, external-link handling, panel content, summon math, and summon/highlight store and settle behaviour.
- **Manual browser pass:** projection content and overflow at two sizes in both themes, every summon scenario from Review Focus 1–3, and an unchanged `/`.

## Decisions made by me (check while reading)

- Content keeps the main site's dark styling in both themes, on a dark backdrop; the frame, header and beam follow the theme.
- `about` → the About summary card and `skills` → the Technical Skills card, from a split of `PortfolioAbout` (`/` is unchanged; About is currently commented out there anyway).
- A "Download résumé" header action on the contact projection, because the main site's contact block has none.
- External links in the projection open in a new tab, so visitors don't lose the altar.
- Summoning ejects wrong items already in the cauldron first, and only flies in the missing items.
- The hint copy mentions clicking a recipe.

## Execution

Subagent-driven again, as before. The tasks depend on each other's interfaces (summon math → store → board → scene), and the scene work is the part where an independent reviewer pays off.
