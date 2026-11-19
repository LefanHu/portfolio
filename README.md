# Lefan's Portfolio

A personal portfolio site built with **Next.js** and **TypeScript** to showcase projects, technical interests, experiments, and interactive 3D work.

🌐 Live site: [https://lefan.ca](https://lefan.ca)

## About this project

This repository powers a portfolio focused on:

- Personal and professional software projects
- Interactive UI/UX and 3D web experiences
- Technical writeups and project highlights
- A "silly-goose" playground for fun side experiments

The app uses the Next.js App Router with route groups to separate different site areas (portfolio, 3D-focused pages, and experimental pages).

## Features

- **Portfolio pages** for featured projects and project gallery
- **Project detail pages** (e.g., media stack, drone, Three.js work, stable diffusion)
- **Interactive visuals** using React Three Fiber / Drei and custom components
- **Experience vignettes**: a small three.js animation on each role's card about the work done there
- **LeetCode stats API integration** via GraphQL
- **S3 bucket listing endpoint** for lightweight asset inspection

## Tech stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript + React 19
- **Styling/UI:** Tailwind CSS v4 with a small token-based design system (`app/globals.css`), Framer Motion
- **3D/Graphics:** Three.js, @react-three/fiber, @react-three/drei
- **Cloud:** AWS S3 (presigned uploads)

## Project structure

```text
app/
  (portfolio)/         Main portfolio pages
  (portfolio-3D)/      3D-focused pages
  api/                 Backend route handlers
components/
  ui/                  Shared primitives (buttons, tags, panels, section headings, icons)
  site/                Header, footer, theme toggle, page transition, sky backdrop
  portfolio/           Home page sections
    vignettes/         The animated figures on the experience cards (see below)
  projects/            Project page template, media gallery
  playground/          The /js experiment runner
  altar/               The 3D altar
lib/                   Shared data and utilities (lib/theme.ts is the theme)
models/                Local model/component definitions
public/                Static assets (images, models)
```

## Experience vignettes

Each role in `lib/portfolio/experience.ts` has a small animated figure on its card, drawn with plain three.js in `components/portfolio/vignettes/`:

- `captions.ts` lists the roles that have a figure and the line shown under each.
- `scenes/<role-id>.ts` is the scene: a function from the theme's colours to a group of objects and an `update(t)` that poses them. `update` must depend on `t` alone (see `types.ts`).
- `kit.ts` holds the shared materials, shapes and timing helpers, so the scenes read as one set.
- `engine.ts` draws all of them with a single WebGL context and copies each picture to an ordinary canvas on its card. It loads on demand, only draws figures that are on screen, follows the theme, and stops for the section's pause button (which starts paused under reduced motion).

To add a role's figure: add its caption, write its scene, and register it in `scenes/index.ts`. `tests/experience-vignettes.spec.tsx` checks every role has one and that each scene is a pure function of time.

## Design system and themes

The classic site and the 3D altar share one look and one light/dark theme.

- **Tokens:** colours, type scale, radii, shadows and motion live in `app/globals.css`
  and are used through Tailwind utilities (`bg-pane`, `text-ink`, `border-line`,
  `rounded-card`, `text-title`, ...). Components do not use raw palette classes.
- **Theme:** `data-theme="light|dark"` on `<html>`. A visitor's choice is stored in
  `localStorage["theme"]`; without one the site follows the operating system. An inline
  script in the root layout sets it before first paint. `lib/theme.ts` is the only place
  that reads or writes it; the altar's store mirrors it.
- **Primitives:** build pages from `components/ui/*` so cards, tags, buttons and headings
  stay consistent.

## Getting started

### 1) Install dependencies

Use Node.js 24 LTS. The project pins pnpm in `package.json`; enable Corepack
with `corepack enable` before installing dependencies.

```bash
pnpm install
```

### 2) Create environment file

Create a `.env.local` in the project root and set the values you need.

```bash
# LeetCode integration
LEETCODE_USERNAME=

# AWS / S3
AWS_REGION=
AWS_BUCKET_NAME=

# Optional client-side envs used by playground pages
NEXT_PUBLIC_HUGGINGFACE_TOKEN=
NEXT_PUBLIC_SNEAK_ATTAC_2=
```

> Note: AWS credentials are typically provided via your runtime environment (for example, local AWS profile, IAM role, or CI secrets).

### 3) Run locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

- `pnpm dev` — start development server
- `pnpm build` — create production build
- `pnpm start` — run production server
- `pnpm lint` — run ESLint
- `pnpm test` — run Vitest smoke tests

## Testing

The repository includes a small smoke-test suite using Vitest and Testing Library.

- `tests/module-smoke.spec.ts` imports every page module and every component module to catch broken imports and dependency graph regressions.
- `tests/render-smoke.spec.tsx` renders a stable subset of UI surfaces such as the root layout, site header and footer, contact section, and not-found page.

Run the suite with:

```bash
pnpm test
```

## API routes (high level)

- `GET /api/leetcode/profile` — fetches LeetCode profile + activity data
- `GET /api/s3/buckets/[bucket]/files` — lists bucket objects

## Deployment

This app is deployable on Vercel or any Node.js environment that supports Next.js 16.

Recommended production setup:

- Configure all required environment variables
- Provide AWS credentials with least-privilege S3 access
- Point DNS to your hosting provider (live domain currently: `lefan.ca`)

## Roadmap ideas

- Expand automated coverage for API routes and interactive 3D components
- Improve content CMS workflow for project updates
- Add analytics dashboard for portfolio interactions
- Expand project case studies with architecture diagrams

---

If you'd like to collaborate or discuss a project, feel free to reach out through the portfolio contact section.
