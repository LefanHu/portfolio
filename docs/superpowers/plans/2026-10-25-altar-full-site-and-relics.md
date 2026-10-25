# Altar: Full-Site Projection + Project Relics — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.


## Context

Lefan finds some recipe projections pointless. "Skills", for example, is just a cloud of tags.

**Decision (Lefan): a projection shows the full live site, scrolled to the right section.**
- It is an embedded same-origin frame of the real site, navbar included.
- Visitors can browse the whole site inside it.
- The wireframe draw-in is kept.

**Decision (Lefan): recipes exist only for sections that `/` actually has.**
- `/` has Projects, Experience, LeetCode stats and Contact.
- About is commented out on `/`, and Interests isn't on `/` at all.
- The About, Skills and Interests recipes are removed.

**Decision (Lefan): every project gets a physical relic.** Dropping a single relic into the cauldron projects that project:
- Projects with their own page (`/projects/*`) show that page.
- External projects show the site's project gallery, scrolled to that project's card.
- Recipes stay two-item.

**Goal:** The projections become the live site at the right place, the recipes match its real sections, and a stand of seven project relics opens each project.

**Architecture:**
- A view id (a section or a project slug) resolves to a site URL plus an anchor.
- `SitePanel` mounts a same-origin `<iframe>` in the existing drei `Html transform` frame. Once it loads, `SitePanel`:
  - scrolls the iframe's document to the anchor;
  - injects the wire CSS and tags the visible blocks;
  - intercepts external and `/altar` links, and forwards Esc to the altar.
- Relics are ordinary physics items whose homes are on a new stand of plinths. `matchRecipe` gains a single-relic result, which the existing settle → evaluate → reveal pipeline turns into a projection.

**Tech Stack:** As before: Next 16, React 19, three 0.183, R3F 9, drei 10, @react-three/rapier 2.2, zustand 5, Vitest 4 + Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-24-altar-portfolio-design.md`, plus the Revision 3 section added on approval.

## Global Constraints

- Read `AGENTS.md`, and read `node_modules/next/dist/docs/` before writing Next code.
- **`/` and `/project-gallery` must not change visually.** The only allowed main-site change is adding `id` attributes and a `slug` data field.
- Desktop only. Recruiters must never get stuck: Logbook, Back/Esc and the lever keep working, including while focus is inside the iframe.
- Light and dark themes apply to the scene, the frame header and the board. Site content inside the frame is the site as it is (dark).
- Commands: `pnpm test`, `pnpm lint`, `pnpm build`.
- **Browser checks:**
  - GPU only: headless Chrome with `--use-angle=vulkan --enable-features=Vulkan --ignore-gpu-blocklist`.
  - Run everything under `nice -n 19`. Never use SwiftShader or `--virtual-time-budget`.
  - Stop the server and Chrome by PID afterwards.
- Never commit `AGENTS.md`. Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **The iframe loads after the wire stage has passed** (cold cache, slow images). The content must still appear scrolled to the right section, with no flash of the page top. It skips the wire draw-in and fades in. Pinned by a SitePanel test (Task 4).
2. **Links inside the frame:**
   - External links open in a new tab, because GitHub and Devpost refuse framing.
   - The hero's "Try the 3D version" link to `/altar` must not nest the altar; it returns to the altar instead.
   - Internal links navigate within the frame.

   Pinned by SitePanel tests (Task 4).
3. **Esc while keyboard focus is inside the iframe** returns to the altar. The parent's keydown listener never sees those keys. Pinned by a SitePanel test (Task 4).
4. **Mixing a relic** with an ingredient, or two relics, ejects; it must not open anything. Pinned by `matchRecipe` tests (Task 3).
5. **A returning visitor whose sessionStorage has `about`, `skills` or `interests` unlocked.** These are dropped on load, with no crash and no phantom ticks. Pinned by a store test (Task 3).

---

### Task 1: Site anchors and project slugs (main site, invisible)

**Files:**
- Modify: `lib/portfolioProjects.ts`
- Modify: `components/portfolio/PortfolioProjects.tsx`, `PortfolioExperiences.tsx`, `HomeDeferredSections.tsx`, `components/ContactForm.tsx`
- Modify: the project-gallery card in `app/(portfolio)/project-gallery/page.tsx` or the card component it uses.
- Test: `tests/site-anchors.spec.tsx` (new)

**Interfaces (Produces):**
- Every entry in `projects` and `acceleratorProject` gains `slug: ProjectSlug`.
  - `export type ProjectSlug = "llm-accelerator" | "stable-diffusion" | "hive-hq" | "drone" | "media-stack" | "auto-trader" | "interqu"`
  - Internal projects' slugs equal their route segment.
- `export const SITE_ANCHORS = { projects: "projects", experience: "experience", coding: "coding", contact: "contact" } as const` in `lib/portfolioProjects.ts`, or a new `lib/siteAnchors.ts`.
- `export function projectCardId(slug: ProjectSlug): string` returns `` `project-${slug}` ``.
- DOM changes:
  - The root elements of FavProjects, Experiences, the LeetCode wrapper in `HomeDeferredSections` and ContactForm carry those ids.
  - Each gallery card carries `id={projectCardId(slug)}`.

- [ ] **Step 1: Write the failing tests:**
  - Each of the 4 components renders an element with its `SITE_ANCHORS` id.
  - The slugs are unique and kebab-case.
  - Every internal `href` ends with `/${slug}`.
  - The gallery renders all 7 `project-<slug>` ids.
- [ ] **Step 2:** Run them. Expected: FAIL.
- [ ] **Step 3:** Implement, adding attributes only (no class or markup changes).
- [ ] **Step 4:** `pnpm test`. Expected: PASS.
- [ ] **Step 5:** Commit `feat(site): section anchors and project slugs`.

### Task 2: Relic stand and the seven project relics (scene)

**Files:**
- Modify: `lib/altar/items.ts`, `lib/altar/layout.ts`, `lib/altar/itemColliders.ts`, `components/altar/items/ItemModel.tsx`
- Create: `lib/altar/relics.ts`, `components/altar/scene/RelicStand.tsx`, mounted next to the desk in the scene.
- Test: `tests/altar-layout.spec.ts`, `tests/altar-relics.spec.ts` (new)

**Interfaces (Produces):**
- `ItemId` gains `accelerator | drone | mediaStack | sdxlLora | hiveHq | autoTrader | interqu`.
- `relics.ts` exports:
  - `export type RelicId`, which is exactly those 7 ids;
  - `export const RELICS: Record<RelicId, { slug: ProjectSlug; accent: string }>`;
  - `export function isRelic(id: ItemId): id is RelicId`.
- `ITEMS` entries for the relics:
  - `short` is the project's display name: "LLM Accelerator", "Drone", "Media Stack", "SDXL LoRA", "HIVE-HQ", "Auto Trader", "Interqu".
  - `name` is a ROR2-style relic name that contains `short`, with a flavor line.
- `layout.ts`:
  - `RELIC_STAND`: an arc centred on the island origin, radius 3.6, angles 10°→80° (x = r·cos θ, z = r·sin θ).
  - `RELIC_TOP_Y = GROUND_Y + 0.32`.
  - The relic `ITEM_HOME`s sit on those plinths, one per plinth, in `RELICS` order.

**Decided here:**
- **`drone` reuses the existing `FpvDrone` model.** The `fpvDrone` ingredient is removed in Task 3.
- **The six new models** are built from primitives in the existing `ItemModel` style:
  - `accelerator`: a die with a glowing tensor grid, visibly not the FPGA chip.
  - `mediaStack`: a mini media server with a film-reel face.
  - `sdxlLora`: a framed canvas with a brush.
  - `hiveHq`: a honeycomb hex cluster.
  - `autoTrader`: a coin stack with a candlestick bar.
  - `interqu`: a microphone with a speech bubble.

  Each gets a fitted cuboid collider whose `rotY` matches its model yaw.
- **`RelicStand`:** seven low stone plinths. Each has a faint rune ring in its relic's accent, so relics read as separate from the desk ingredients. Each plinth has a fixed collider.
- **The arc numbers are a starting point.** The implementer may tune the radius and angles to pass the tests and look right in the GPU check, and records the final values in the report.

- [ ] **Step 1: Write the failing tests:**
  - **`altar-layout.spec.ts`:**
    - The id count becomes 17.
    - The desk-proximity and desk/ground-y rules apply to non-relic items only.
    - New rules for relic homes:
      - `y === RELIC_TOP_Y`;
      - xz radius from the island centre ≤ `ISLAND_RADIUS - 0.45`;
      - distance from `ALTAR_POS` ≥ 2.65 (plaza edge plus 0.5);
      - ≥ 0.6 from the desk footprint;
      - ≥ 0.55 apart from each other and from the lever, the braziers, the pillars, the log and the trees (use the positions the existing scene files define);
      - the top face is visible from the home camera, using the existing visibility helper.
  - **`altar-recipes.spec.ts`:** the "every item is used by a recipe" test now covers non-relic items only.
  - **`altar-summon.spec.ts`:** the summon tests iterate every `ITEM_HOME` and must stay green with the relic homes included.
  - **`altar-relics.spec.ts`:**
    - `RELICS` covers exactly the 7 relic ids.
    - Each slug is a `ProjectSlug`, and every `ProjectSlug` has exactly one relic.
    - Accents are distinct.
    - `isRelic` is true for those 7 only.
    - Each relic's `name` contains its `short`.
- [ ] **Step 2:** Run them. Expected: FAIL. **Step 3:** Implement. **Step 4:** `pnpm test` and `pnpm lint`. Expected: PASS.
- [ ] **Step 5: GPU check** on `PORT=3112 nice -n 19 pnpm dev`:
  - The stand and relics in both themes.
  - Hover tips show.
  - A relic can be dragged and thrown, and respawns.
- [ ] **Step 6:** Commit `feat(altar): relic stand with a relic per project`.

### Task 3: Recipes match the site; views; relic matching

**Files:**
- Modify: `lib/altar/recipes.ts`, `lib/altar/items.ts`, `lib/altar/layout.ts`, `lib/altar/itemColliders.ts`, `components/altar/items/ItemModel.tsx`, `lib/altar/mood.ts`, `lib/altar/store.ts`
- Create: `lib/altar/views.ts`
- Test: `tests/altar-recipes.spec.ts`, `tests/altar-store.spec.ts`, `tests/altar-views.spec.ts` (new), plus any test referencing removed ids or sections.

**Interfaces (Produces):**
- `SectionId = "projects" | "experience" | "coding" | "contact"`. `RECIPES` holds four entries:

  | Section | Items | Title |
  |---|---|---|
  | projects | fpgaChip + solderingIron | (unchanged) |
  | experience | driveUnit + keyboard | (unchanged) |
  | coding | serverRack + keyboard | "Coding Stats" (takes over the old skills artifact and accent) |
  | contact | coffeeMug + notebook | (unchanged) |

- The `tool`, `chalkBag` and `fpvDrone` ingredients are removed from `ItemId`, `ITEMS`, `ITEM_HOME`, the colliders and `MODELS`. The `FpvDrone` model function stays, because `drone` uses it.
- `MatchResult` gains `{ kind: "relic"; relic: RelicId }`. It is returned when the contents are exactly one relic.
  - A single ingredient is still `partial`.
  - Any set of two or more items that includes a relic is `invalid`.
- `views.ts`:
  - `export type ViewId = SectionId | ProjectSlug`.
  - `viewTarget(id: ViewId): { path: string; anchor: string | null }`:
    - sections → `{ path: "/", anchor: SITE_ANCHORS[id] }`;
    - internal projects → `{ path: href, anchor: null }`;
    - external projects → `{ path: "/project-gallery", anchor: projectCardId(slug) }`.
  - `viewTitle(id)`, `viewAccent(id)`, and `viewKicker(id)` (the artifact name for sections, `"Relic"` for projects).
  - `ALL_VIEWS: ViewId[]`, with sections first.
- Store changes:
  - `activeSection: ViewId | null`, `unlocked: ViewId[]` and `openSection(id: ViewId)`. The names are kept to limit churn; a "section" is now any view.
  - `evaluate()` calls `openSection(RELICS[relic].slug)` on a `relic` result.
  - `sanitize` keeps only ids in `ALL_VIEWS`.
- `hintColors` returns the relic's accent for a lone relic.

- [ ] **Step 1: Write the failing tests:**
  - **recipes:**
    - There are 4 recipes.
    - Every non-relic item is used by some recipe.
    - No relic appears in any recipe.
    - `matchRecipe(["hiveHq"])` gives relic `hiveHq`.
    - `["hiveHq","keyboard"]` is invalid, and so is `["drone","interqu"]`.
    - `["keyboard"]` is partial.
  - **views:**
    - `viewTarget("experience")` gives `{ path: "/", anchor: "experience" }`.
    - `viewTarget("drone")` gives `{ path: "/projects/drone", anchor: null }`.
    - `viewTarget("hive-hq")` gives `{ path: "/project-gallery", anchor: "project-hive-hq" }`.
    - Section ids and project slugs never collide.
  - **store:**
    - A relic alone in the cauldron followed by `evaluate()` gives `phase: "revealing"`, `activeSection: "hive-hq"`.
    - Persisted `unlocked: ["about","skills","projects","drone"]` sanitizes to `["projects","drone"]`.
    - The persisted keys are still only `unlocked` and `theme`.
  - **layout:** the id count becomes 14.
  - **Other tests** that break because there are now 4 recipes (e.g. the board and logbook counts in `altar-ui.spec.tsx`, from 6 to 4) are updated here.
- [ ] **Step 2:** Run them. Expected: FAIL.
- [ ] **Step 3: Implement.** TypeScript will flag every exhaustive `Record` over the old ids; update each one. Keep `SectionPanel` compiling until Task 4 replaces it:
  - `coding` maps to `LeetcodeStats`.
  - A project view renders the header only.
- [ ] **Step 4:** `pnpm test` and `pnpm lint`. Expected: PASS.
- [ ] **Step 5:** Commit `feat(altar): recipes match the site's sections; relics open their project`.

### Task 4: SitePanel, the live site in the projection

**Files:**
- Create: `components/altar/projection/SitePanel.tsx`, `components/altar/projection/siteFrame.ts`, `components/altar/projection/wireCss.ts`
- Modify: `components/altar/projection/Projection.tsx` (mount `SitePanel` with `activeSection`), `components/altar/projection/wireTags.ts`, `components/altar/projection/projection.css`
- Delete: `SectionPanel.tsx`, the `.ap-site` and `.ap-scroll` site rules, and `panelScroll.ts` if nothing else uses it.
- Test: `tests/altar-site-panel.spec.tsx` (replaces `tests/altar-panels.spec.tsx`), `tests/altar-wire-tags.spec.ts`

**Interfaces:**
- Consumes: `viewTarget`, `viewTitle`, `viewAccent` and `viewKicker` (Task 3), and `contact.resumeHref`.
- Produces:
  - `SitePanel({ view: ViewId, stage })`. It keeps the existing frame and themed header (kicker, title, accent, and the "Download résumé" action for `contact`). The body is `<iframe title={viewTitle(view)} src={path}>` filling the frame.
  - `tagWireBlocks(root, max?, include?: (el: Element) => boolean)`: the new optional filter.
  - `WIRE_CSS: string`: the wire and fill rules, keyed off `html[data-ap-stage]`.
  - `prepareFrame(frame: HTMLIFrameElement, opts: { anchor: string | null; stage: Stage; onEscape(): void }): () => void`. It is called on every iframe `load` and returns a cleanup function. It:
    1. Scrolls `#anchor` into view (`block: "start"`), if there is an anchor.
    2. Injects `<style id="ap-wire">` with `WIRE_CSS` once.
    3. Sets `documentElement.dataset.apStage`.
    4. If the stage is still `"wire"`, tags only the blocks that intersect the frame's viewport, then applies `wireDelays`.
    5. Adds a capture `click` listener on the iframe's document:
       - cross-origin `http(s)` links → `openExternalInNewTab`, with the iframe's origin;
       - a pathname starting with `/altar` → `preventDefault()` and `onEscape()`;
       - anything else → default behaviour, i.e. navigate in the frame.
    6. Adds a `keydown` listener on the iframe's window: Escape → `onEscape()`.
- **Behaviour:**
  - The iframe stays at `opacity: 0` until the first `prepareFrame` has run, then follows the stage fade.
  - Stage changes after load update `data-ap-stage`.
  - `onEscape` dispatches `new KeyboardEvent("keydown", { key: "Escape" })` on the parent window, so `Overlay`'s existing handler stays the single source.
  - The frame stays `inert` until it reaches "filled", as now.

- [ ] **Step 1: Write the failing tests** (jsdom). Render `SitePanel`, write a fixture into `iframe.contentDocument` (headings, cards, `#experience`, an external link, an `/altar` link, an internal `/projects/drone` link), then fire `load`.
  - `scrollIntoView` (mocked) is called on `#experience`.
  - `#ap-wire` is injected exactly once across two loads.
  - With stage "wire", at least 3 `[data-wire]` blocks are tagged. With stage "filled" at load time, none are.
  - The iframe is not visible before load and is visible after.
  - Clicking the external link calls `window.open` (spied) with `"_blank"`, and `defaultPrevented` is true.
  - Clicking the `/altar` link is prevented, and a parent `keydown` Escape fires.
  - Clicking `/projects/drone` is not prevented.
  - Escape pressed in the iframe window fires the parent Escape.
  - The `contact` view renders "Download résumé" with `target="_blank"`. A project view renders kicker "Relic" and the project name.
  - `tagWireBlocks` with `include` tags only the included elements.
- [ ] **Step 2:** Run them. Expected: FAIL. **Step 3:** Implement. **Step 4:** `pnpm test` and `pnpm lint`. Expected: PASS.
- [ ] **Step 5: GPU check** on the dev server, at 1280×720 and 1600×900 in both themes:
  - Each section opens scrolled to its section, with the navbar visible above.
  - The wire stage shows outlines.
  - The wheel scrolls the site and does not zoom the camera.
  - A project link navigates inside the frame.
  - GitHub opens a new tab.
  - Esc after clicking into the frame returns to the altar.
- [ ] **Step 6:** Commit `feat(altar): projection shows the live site at the right section`.

### Task 5: Board and Logbook for four recipes and seven relics

**Files:**
- Modify: `components/altar/ui/RecipeBoard.tsx`, `components/altar/ui/LogbookDrawer.tsx`, `components/altar/ui/Overlay.tsx` (hint copy), `components/altar/ui/ui.css`
- Test: `tests/altar-ui.spec.tsx`

**Behaviour:**
- **Board:**
  - Lists the 4 recipes, with clicking to summon and hovering to highlight as now.
  - Adds a footer line "Drop a relic in alone to view its project."
  - The counter reads "N of 4 unlocked" (recipes only).
- **Logbook:** two groups.
  - **"Recipes":** 4 entries, as now.
  - **"Relics":** 7 entries, each showing the relic `short`, its accent pip and a tick when viewed. Clicking one opens it directly via `openSection(slug)`.
  - The footer counts all views: "N of 11".
- **Hint copy:** "Drag two items into the cauldron, drop a relic in alone, click a recipe, or open the Logbook."

- [ ] **Step 1: Write the failing tests:**
  - The board has 4 summon buttons and the relic footer line.
  - The Logbook has 4 recipe entries and 7 relic entries.
  - Clicking "HIVE-HQ" gives `activeSection: "hive-hq"`.
  - A viewed relic shows its tick.
  - The footer reads "of 11".
  - The hint regex matches `/relic/i`.
- [ ] **Step 2:** Run them. Expected: FAIL. **Step 3:** Implement. **Step 4:** `pnpm test`. Expected: PASS.
- [ ] **Step 5:** Commit `feat(altar): board and logbook list recipes and relics`.

### Task 6: Full verification

- [ ] `pnpm test`, `pnpm lint` and `pnpm build` are all clean.
- [ ] **SSR of `/` and `/project-gallery`, from `main` and from the branch** (built in a scratch worktree). After normalising build hashes, the **only** differences are the added `id` attributes.
- [ ] **GPU browser pass, both themes:**
  - Every recipe, by hand drag and by board summon.
  - Every relic dropped alone, plus each one opened from the Logbook.
  - A relic with an ingredient, and two relics: both eject.
  - The lever, Esc and Back, including with focus inside the frame.
  - Navigate inside the frame, then Back.
  - Phone and no-WebGL fallbacks.
  - An old sessionStorage holding `about` unlocked.

## Decisions made by me (check while reading)

- **Recipe pairs.** The Coding recipe reuses the old Skills pair (server rack + keyboard) and its artifact and accent.
- **Removed items.** The wrench and chalk bag are removed.
- **Drone relic.** The FPV drone model becomes the Drone relic.
- **Relic stand.** The relics sit on their own stand of seven glowing plinths in an arc between the cauldron and the camera, not on the desk. The desk is full, and a separate stand tells relics apart from ingredients at a glance.
- **Projects without a page.** External projects (HIVE-HQ, Auto Trader, Interqu) project the gallery at their card. GitHub and Devpost can't be framed.
- **Links inside a projection.**
  - The site's own `/altar` link returns to the altar instead of nesting it.
  - External links open in a new tab.
  - Everything else browses inside the frame.
- **Logbook.** It lists relics too and opens them directly. The board stays recipes-only, with a one-line hint about relics.
- **Left in place.** The Revision 2 `AboutSummary`/`TechnicalSkills` split stays on main, unused, along with the `Interests` component; reverting them isn't needed.

## Execution

Subagent-driven, as before. The tasks chain through shared interfaces (slugs → relics → views → panel → UI), and the iframe panel and relic models are where an independent reviewer pays off.
