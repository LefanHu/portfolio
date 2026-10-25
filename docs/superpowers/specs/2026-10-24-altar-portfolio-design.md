# Altar Portfolio — Design

An alternative, interactive 3D version of Lefan's portfolio, inspired by Risk of Rain 2 (ROR2) and its artifacts, in the spirit of Bruno Simon's portfolio but with a much smaller scene.

## Intent and the why

Lefan loves ROR2 and its artifacts and wants a portfolio that *is* an interactive scene, the way Bruno Simon's is — but compact. The visitor finds an altar with a desk of items beside it; dropping the right items into the altar summons a projection of a section of Lefan's site. It should be fun for people who like to play, and immediately understandable for someone who just wants to hire him.

## Goals

- A single small scene: a floating island "diorama" with a central altar and a desk of physics items.
- Visitors drag and drop physics items into the altar. A valid recipe triggers an artifact and a projection of a portfolio section.
- **Intuitive for a recruiter.** The recipe list is always visible and the altar can be cleared at any time. There is also a direct way to open any section without crafting (the logbook).
- Light and dark themes, applied to both the scene and the projections.
- Original look that feels ROR2-adjacent without copying it.

## Non-goals

- Phone support. Phones get a short "built for desktop" screen with a button to the regular portfolio.
- A large explorable world, a driveable character, or walking around (unlike Bruno Simon's).
- Hidden puzzles or code-entry. Lefan explicitly rejected the Artifact Reliquary–style code grid.
- Replacing the regular portfolio at `/`; it stays the default.

## Anti-goals

- **Ugly.** This is the one Lefan named. A scene that looks like a cheap tech demo is a failure even if every interaction works.
- A recruiter getting stuck or confused about what to do.
- Using ripped ROR2 assets, models, or artifact icons (they belong to Gearbox/Hopoo).

## The experience

### Scene

- **Floating diorama** (agreed): one small island chunk hanging in empty sky, whole thing visible at once, framed like a museum piece.
- Central altar on worn stone; Lefan's desk off to one side under a lantern — a workbench beside an ancient ruin.
- **After the look test (Lefan):** the island should be a bit bigger. The altar must be grander and "badass," not a simple altar. It works like a **cauldron**: a large basin with effects (swirling energy, embers, rising glow) that items can be thrown or tossed into, not just placed on.
- Camera mostly fixed on the diorama with a little orbit allowed; no free roaming.
- **Look (agreed direction):**
  - Chunky low-poly shapes with flat-shaded faces; no attempt at realism.
  - Strict palette: a few muted tones for stone, wood, and grass, plus one accent color per artifact. Only magic glows.
  - Lighting does the heavy lifting: strong rim light, soft ambient occlusion, gentle bloom on magic, gradient fog.
  - Constant subtle motion: gentle island bob, floating dust, pulsing altar runes, a small wobble on item hover.

### Items and recipes

- Items sit on the desk as physics objects. Visitors pick them up, drag them, and drop them into the altar. Hovering an item shows a ROR2-style item name and flavor line.
- Each item is something real from Lefan's life, written like a ROR2 item.
- **Recipes are two items each and unlock a whole section.** This is my call, from a proposal Lefan didn't object to. Items are reused across recipes.

Starting recipe set (my proposal; the builder may tune item names and flavor text):

| Recipe | Unlocks | Artifact (original take) |
|---|---|---|
| The Tool (Waterloo's wrench) + Notebook | About and education | builder's choice |
| Drive Unit (Amazon robot) + Keyboard | Experience | Evolution-like |
| FPGA Chip + Soldering Iron | Projects | Sacrifice-like |
| Server Rack + Keyboard | Skills | Metamorphosis-like |
| Chalk Bag + FPV Drone | Interests | builder's choice |
| Coffee Mug + Notebook | Resume and contact | Command-like |

That's about 8 distinct items.

- **Recipe list:** always visible beside the altar, styled like the ROR2 logbook. Each entry shows the items it needs and what it unlocks.
- **Clear control:** an obvious lever or button on the altar that ejects everything currently in it.
- **Wrong combination:** the altar spits the items back out with a small burst. This is a secondary path, not a failure state.
- **Single item:** a small reaction (glow, sound), no unlock.
- **Logbook:** a fallback on or near the desk that lists every section and opens any of them directly. It also tracks which ones the visitor has unlocked.

### The reveal (agreed)

1. A valid recipe triggers the artifact. The altar then projects a **wireframe render of that section of the website**, floating in the air like magic.
2. It builds up in stages: glowing lines draw the layout (headings, cards, image frames), then the real content fills in so it's readable by the time the camera arrives.
3. The camera transitions so the projection fills the screen ("fullscreen").
4. The projection is a real, usable page in 3D space: it scrolls, links work (project detail pages, resume download, contact links).
5. The projection is tinted with that artifact's accent color, with particles rising from the altar.
6. A clear back button (and Esc) pulls the camera back to the altar. The projection dissolves and the items return to the desk.

### Themes (agreed)

- **Dark:** the island at dusk or night. Deep blue fog, the lantern lit, altar runes and projections glowing strongly; projections read as light in the air.
- **Light:** the same island in daytime. Bright sky, pale fog, soft shadows; projections switch to dark ink lines on a translucent pane so they stay readable against the bright sky.
- Both themes share the same layout, items, and recipes. Only lighting, colors, and materials change.
- Starts from the visitor's OS preference. Toggle by clicking the lantern in the scene, and also through a plain UI button next to the logbook.
- Switching fades sky, fog, and lighting over a second or two; no hard cut.

## Content

All content comes from what the site already has. It is reused, not rewritten:

- About, education, research, and skills: `components/portfolio/PortfolioAbout.tsx` (`skillGroups`)
- Experience: `components/portfolio/PortfolioExperiences.tsx` (`experienceBranches`, 5 roles)
- Projects: `lib/portfolioProjects.ts` (`projects`, `acceleratorProject`)
- Interests: `components/portfolio/PortfolioInterests.tsx`
- Contact: `components/ContactForm.tsx` (email, GitHub, LinkedIn)
- Resume: `public/3a-external.pdf` (confirmed by Lefan).

Data that lives inside component files should be pulled into shared modules so both versions of the site read the same source, with no copy-paste.

## Constraints

- Lives inside the existing Next.js app (Next 16, React 19). Per `AGENTS.md`, read `node_modules/next/dist/docs/` before writing Next code; APIs differ from older versions.
- Uses what's already installed: `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `zustand`. A physics library (e.g. `@react-three/rapier`) will need to be added.
- **Route (Lefan's decision):** a new route `/altar`. The old `/home` 3D experiment and `/projects/threejs` (which showcases it) stay unchanged. The regular site gets a "try the 3D version" link.
- **Project links (Lefan's decision):** project links inside a projection go to the normal `/projects/*` pages in the same tab. Unlocked progress and theme persist in `sessionStorage`, so browser Back returns to the altar with progress intact. There is no in-scene project detail view.
- **Models:** built in code (stylized low-poly primitives) or taken from CC0 libraries (Kenney, Quaternius, Poly Pizza). Nothing from ROR2 itself.
- Desktop only. Detect phones and route them to the fallback screen.
- Must load reasonably fast; models stay small.

## Process requirement

**A throwaway look test comes first.** Before the full build, make the island, altar, and lighting in both themes so Lefan can judge the look first-hand. The build continues only once they're happy with it, because "ugly" is the main risk.

## Left to the builder

- The physics library and how drag-and-drop works (pick-up height, throwing vs. placing, how the altar detects items).
- How to render the projections (e.g. drei `<Html transform>` vs. render-to-texture), as long as they end up readable, scrollable, and clickable.
- Exact item names, flavor text, artifact names and designs, and the accent colors.
- Sound, if any (a mute toggle is required if sound is added).
- Loading screen design (the existing `LoaderScreen` may be reused or replaced).
- The breakpoint or heuristic for "phone".
- Tests, at a sensible level for the repo (it uses Vitest and Testing Library), e.g. covering recipe matching logic and the phone fallback.

## Revision 2 (after launch)

Lefan's requests and decisions:

- **Projections render the real site.** A projection no longer uses altar-only duplicate panels. It mounts the main site's own section components:
  - About summary and Technical Skills, split from `PortfolioAbout`
  - Experiences
  - Favorite Projects
  - Interests
  - Contact

  The wireframe draw-in stays and is applied to that DOM. Edits to the main site show up in both places.
- **The recipe board is clickable.** Clicking a recipe makes the cauldron pull that recipe's two items in; the normal reveal follows. Hovering a recipe highlights its two items on the desk (accent ring plus name tags), because the models alone don't say which item is which.

Builder's calls in this revision:

- The site content keeps the main site's dark styling in both themes. Only the projection frame, header and beam follow the light/dark theme.
- The contact projection gets a "Download résumé" header action, because the main site's contact block has none.
- External links inside a projection open in a new tab. Internal `/projects/*` links stay in the same tab.
- Summoning first ejects any wrong items in the cauldron, then flies in only the missing items.
