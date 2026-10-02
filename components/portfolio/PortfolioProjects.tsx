"use client";

import SlidingCards from "../SlidingCards";
import Carousel from "../Carousel";

import { projects, acceleratorProject } from "@/lib/portfolioProjects";
import Link from "next/link";

export default function FavProjects() {
  return (
    <div className="flex flex-col gap-4 p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-200 sm:text-4xl">
          Favorite Projects
        </h2>
        <p className="mt-4 text-gray-300 mb-5">
          Selected work in FPGA acceleration, generative AI, and systems engineering,
          alongside some of my favorite personal projects.
        </p>
        <hr className="h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />
      </div>
      <Link href={acceleratorProject.href} className="rounded-2xl border border-cyan-300/25 bg-slate-900 p-6 text-slate-200 hover:border-cyan-300/60">
        <p className="text-sm text-cyan-200">Jan. 2025 - Apr. 2025 · Waterloo, ON</p>
        <h3 className="mt-2 text-2xl font-bold text-white">{acceleratorProject.name}</h3>
        <p className="mt-3 leading-7">{acceleratorProject.description}</p>
        <p className="mt-3 text-sm text-cyan-200">SystemVerilog · FPGA · Vivado · RTL Design</p>
        <span className="mt-4 inline-block font-semibold">View project →</span>
      </Link>
      <Link href="/project-gallery" className="text-sky-300 underline">View all projects</Link>
      <div className="min-[1100px]:hidden">
        <Carousel
          imageList={projects.map((project) => ({
            src: project.imgSrc,
            alt: project.name,
            label: project.name,
            href: project.href,
            description: project.description,
            width: 1024,
            height: 1024,
          }))}
        />
      </div>
      <div className="hidden min-[1100px]:block">
        <SlidingCards cards={projects} />
      </div>
      <hr className="h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />
    </div>
  );
}
