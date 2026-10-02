export const projects = [
  {
    name: "SDXL LoRA Adapter",
    imgSrc: "/images/swift-beach.jpg",
    description:
      "React image generator with a custom SDXL LoRA adapter fine-tuned on AWS G4DN and deployed through Hugging Face Serverless Inference",
    href: "/projects/stable-diffusion",
  },
  {
    name: "HIVE-HQ",
    imgSrc: "/images/hivehq.png",
    description: "2022 HTN submission. AI powered Covid safety planner",
    href: "https://devpost.com/software/hive-hq",
  },
  {
    name: "Drone",
    imgSrc: "/images/drone.jpg",
    description:
      "Custom FPV drone with, GPS, Compass... custom firmware in progress!",
    href: "/projects/drone",
  },
  {
    name: "Plex, Sonarr, Jackett - Stack",
    imgSrc: "/images/plex.png",
    description:
      "Home media server stack built using docker, authelia, nginx proxy",
    href: "/projects/media-stack",
  },
  {
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
    name: "Interqu",
    imgSrc: "/images/interqu.svg",
    description: "AI interview platform built using AWS SAM",
    href: "https://github.com/Interqu/interqu-sam",
  },
];

export const acceleratorProject = {
  name: "LLM Inference Accelerator",
  description: "Implemented IBERT inference on a PYNQ FPGA with pipelined SystemVerilog compute units, including systolic arrays, matrix multipliers, softmax, and layer normalization.",
  href: "/projects/llm-accelerator",
};
