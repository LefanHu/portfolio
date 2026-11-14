export type ProjectSlug =
  | "llm-accelerator"
  | "stable-diffusion"
  | "hive-hq"
  | "drone"
  | "media-stack"
  | "auto-trader"
  | "interqu";

export interface PortfolioProject {
  slug: ProjectSlug;
  name: string;
  imgSrc: string;
  description: string;
  /** A page on this site (`/projects/<slug>`) or, for projects without one, where it lives. */
  href: string;
  /** When the work happened, e.g. "Jan. 2025 – Apr. 2025". */
  period?: string;
  location?: string;
  /** Shown as chips on cards and on the project page. The first three are the ones a card shows. */
  technologies?: string[];
  /** Where the project stands when that is worth saying, e.g. "Archived". */
  status?: string;
}

/**
 * A write-up that lives under `/projects/` without being one of the seven
 * portfolio projects (the altar keeps one relic per `ProjectSlug`, so the
 * slug union must not grow for these).
 */
export interface ProjectWriteup extends Omit<PortfolioProject, "slug"> {
  slug: string;
}

/** True when a project's link leaves this site (it then opens in a new tab). */
export function isExternalHref(href: string): boolean {
  return /^https?:\/\//.test(href);
}

const KNOWN_HOSTS: Record<string, string> = {
  "github.com": "GitHub",
  "devpost.com": "Devpost",
};

/** Link text that says where a project's link goes: its page here, or the site it lives on. */
export function projectLinkLabel(href: string): string {
  if (!isExternalHref(href)) return "Read the write-up";
  const host = new URL(href).hostname.replace(/^www\./, "");
  return `View on ${KNOWN_HOSTS[host] ?? host}`;
}

/**
 * Cover images that are logos, not pictures. Cropping one to fill a card cuts
 * the mark apart, and a mark drawn for a dark ground is lost on a light card,
 * so cards show them whole on LOGO_BACKING in both themes.
 */
export const LOGO_COVERS: ReadonlySet<string> = new Set([
  "/images/hivehq.png",
  "/images/plex.png",
  "/images/interqu.svg",
]);

/** Fixed night-navy behind logo covers and under photo scrims (a deliberate non-token colour). */
export const LOGO_BACKING = "bg-[#070d1f]";

/**
 * view-transition-name shared by a project's card title and its page title, so
 * the name carries over when a card is opened.
 */
export function projectTitleTransition(slug: string): string {
  return `project-title-${slug}`;
}

// Element ids on `/` that the altar's projections scroll the site to.
export const SITE_ANCHORS = {
  projects: "projects",
  experience: "experience",
  coding: "coding",
  contact: "contact",
} as const;

export function projectCardId(slug: ProjectSlug): string {
  return `project-${slug}`;
}

export const projects: PortfolioProject[] = [
  {
    slug: "stable-diffusion",
    name: "SDXL LoRA Adapter",
    imgSrc: "/images/swift-beach.jpg",
    description:
      "React image generator with a custom SDXL LoRA adapter, fine-tuned on AWS G4DN and deployed through Hugging Face Serverless Inference.",
    href: "/projects/stable-diffusion",
    period: "Jan. 2024 – Apr. 2024",
    location: "Ottawa, ON",
    technologies: [
      "Stable Diffusion XL",
      "LoRA",
      "Hugging Face Accelerate",
      "Python",
      "AWS",
      "Docker",
      "Scrapy",
      "React",
      "Next.js",
      "Tailwind CSS",
      "TypeScript",
    ],
    status: "Archived",
  },
  {
    slug: "hive-hq",
    name: "HIVE-HQ",
    imgSrc: "/images/hivehq.png",
    description: "Hack the North 2022 submission: an AI-powered COVID safety planner.",
    href: "https://devpost.com/software/hive-hq",
    period: "2022",
  },
  {
    slug: "drone",
    name: "FPV Drone",
    imgSrc: "/images/fpvdrone/2.jpg",
    description:
      "Custom FPV drone with GPS and a compass. Custom firmware for autonomous flight is in progress.",
    href: "/projects/drone",
    technologies: ["Betaflight", "C", "Microcontrollers", "Autonomous flight"],
  },
  {
    slug: "media-stack",
    name: "Home Media Stack",
    imgSrc: "/images/plex.png",
    description: "Home media server stack built with Docker, Authelia and an Nginx reverse proxy.",
    href: "/projects/media-stack",
    technologies: [
      "Docker",
      "Nginx reverse proxy",
      "Authelia",
      "Cloudflare",
      "Oracle Cloud",
      "WireGuard",
      "Pi-hole",
      "Plex",
      "Sonarr",
      "Jackett",
      "Transmission",
      "Docker networks",
    ],
  },
  {
    slug: "auto-trader",
    name: "Auto Trader",
    imgSrc: "/images/stonks.jpg",
    description: "Arbitrage bot for the OANDA API.",
    href: "https://github.com/LefanHu/OARB",
    technologies: ["OANDA API"],
  },
  {
    slug: "interqu",
    name: "Interqu",
    imgSrc: "/images/interqu.svg",
    description: "AI interview platform built with AWS SAM.",
    href: "https://github.com/Interqu/interqu-sam",
    technologies: ["AWS SAM"],
  },
];

// No imgSrc: there is no picture of this project yet (the gallery draws a tile for it).
export const acceleratorProject = {
  slug: "llm-accelerator" as const,
  name: "LLM Inference Accelerator",
  description:
    "Implemented I-BERT inference on a PYNQ FPGA with pipelined SystemVerilog compute units, including systolic arrays, matrix multipliers, softmax, and layer normalization.",
  href: "/projects/llm-accelerator",
  period: "Jan. 2025 – Apr. 2025",
  location: "Waterloo, ON",
  technologies: ["SystemVerilog", "FPGA", "Vivado", "RTL Design"],
} satisfies Omit<PortfolioProject, "imgSrc">;

/** The featured project first, then the rest, in display order. */
export const allProjects = [acceleratorProject, ...projects];

/** Write-ups listed in the gallery after the projects. They have a page but no relic on the altar. */
export const extraWriteups: ProjectWriteup[] = [
  {
    slug: "threejs",
    name: "Three.js Portfolio",
    imgSrc: "/images/threejsPortfolio/0.png",
    description: "An experiment in building a portfolio as a 3D scene with Three.js.",
    href: "/projects/threejs",
    technologies: ["Three.js", "WebGL", "React"],
  },
];

/** Anything the gallery lists or a project page describes: a project or a write-up, with or without a picture. */
export type ProjectEntry = Omit<ProjectWriteup, "imgSrc"> & { imgSrc?: string };

/** Every entry with a page on this site, in gallery order: the previous/next sequence. */
export const projectPages: ProjectEntry[] = [...allProjects, ...extraWriteups].filter(
  (entry) => !isExternalHref(entry.href),
);

/** The entry whose page is `/projects/<slug>`. Throws on a slug without a page, so a typo fails loudly. */
export function projectPage(slug: string): ProjectEntry {
  const entry = projectPages.find((candidate) => candidate.slug === slug);
  if (!entry) throw new Error(`No project page for "${slug}"`);
  return entry;
}
