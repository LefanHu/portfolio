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
  href: string;
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
      "React image generator with a custom SDXL LoRA adapter fine-tuned on AWS G4DN and deployed through Hugging Face Serverless Inference",
    href: "/projects/stable-diffusion",
  },
  {
    slug: "hive-hq",
    name: "HIVE-HQ",
    imgSrc: "/images/hivehq.png",
    description: "2022 HTN submission. AI powered Covid safety planner",
    href: "https://devpost.com/software/hive-hq",
  },
  {
    slug: "drone",
    name: "Drone",
    imgSrc: "/images/drone.jpg",
    description:
      "Custom FPV drone with, GPS, Compass... custom firmware in progress!",
    href: "/projects/drone",
  },
  {
    slug: "media-stack",
    name: "Plex, Sonarr, Jackett - Stack",
    imgSrc: "/images/plex.png",
    description:
      "Home media server stack built using docker, authelia, nginx proxy",
    href: "/projects/media-stack",
  },
  {
    slug: "auto-trader",
    name: "Auto Trader - Arbitrage",
    imgSrc: "/images/stonks.jpg",
    description: "Arbitration bot for the Oanda API",
    href: "https://github.com/LefanHu/OARB",
  },
  // {
  //   name: "Drawbot",
  //   imgSrc: "/images/drawbot-logo.png",
  //   description: "2023 HTN submission. AI powered drawing robot",
  //   href: "/projects/stable-diffusion",
  // },
  {
    slug: "interqu",
    name: "Interqu",
    imgSrc: "/images/interqu.svg",
    description: "AI interview platform built using AWS SAM",
    href: "https://github.com/Interqu/interqu-sam",
  },
];

export const acceleratorProject = {
  slug: "llm-accelerator" as const,
  name: "LLM Inference Accelerator",
  description: "Implemented IBERT inference on a PYNQ FPGA with pipelined SystemVerilog compute units, including systolic arrays, matrix multipliers, softmax, and layer normalization.",
  href: "/projects/llm-accelerator",
};
