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
- **LeetCode stats API integration** via GraphQL
- **S3 bucket listing endpoint** for lightweight asset inspection

## Tech stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript + React 19
- **Styling/UI:** Tailwind CSS, Mantine, NextUI, Framer Motion
- **3D/Graphics:** Three.js, @react-three/fiber, @react-three/drei
- **Cloud:** AWS S3 (presigned uploads)

## Project structure

```text
app/
  (portfolio)/         Main portfolio pages
  (portfolio-3D)/      3D-focused pages
  api/                 Backend route handlers
components/            Reusable UI and 3D components
lib/                   Shared utilities and Three.js helpers
models/                Local model/component definitions
public/                Static assets (images, models)
```

## Getting started

### 1) Install dependencies

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
- `tests/render-smoke.spec.tsx` renders a stable subset of UI surfaces such as the root layout, navbar, contact form, and not-found page.

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
