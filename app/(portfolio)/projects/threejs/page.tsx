"use client";

import TechnologyBadge from "@/components/portfolio/TechnologyBadge";
import { List } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

export default function ThreeJSProjectPage() {
  const technologies = ["Three.js", "WebGL", "React", "Math"];
  const overviewPoints = [
    "Hosted on oracle cloud",
    "Quaternion calculations for camera rotation tracking",
  ];
  const numImages = 3;

  return (
    <div className="flex-1 overflow-auto no-scrollbar bg-black">
      <div className="mx-auto grid max-w-4xl grid-cols-1 items-center py-12 gap-y-8 sm:py-16 lg:max-w-7xl px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-6xl">
            Three.js Portfolio
          </h2>
          <hr className="h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />
          {/* technologies */}
          <div className="flex flex-row flex-wrap gap-2 pt-2">
            {technologies.map((tech) => TechnologyBadge(tech))}
          </div>
          <p className="mt-4 text-gray-300 mb-5">
            An experimentation with Three.js in order to create a portfolio
            page.
          </p>

          <div className="grid grid-cols-1 gap-4 p-4 bg-gray-800 bg-opacity-90 rounded-2xl">
            <div className="rounded-xl p-5 bg-gray-700">
              <h3 className="text-2xl text-white font-bold">
                Project Overview
              </h3>
              <hr className="h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />
              <List size="md" listStyleType="disc">
                {overviewPoints.map((point) => (
                  <List.Item key={point} className="w-[95%]">
                    {point}
                  </List.Item>
                ))}
              </List>
            </div>
            <div className="rounded-xl p-5 bg-gray-700">
              <h4 className="text-xl text-white font-bold">Note</h4>
              <hr className="h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />
              <div className="flex flex-col gap-4">
                <p>
                  Unfortunately, I realized that the performance optimizations
                  of this Three.js portfolio was not good enough for the average
                  computer. Although it would run with 60fps on most, it made
                  for a suboptimal experience on mobile or old laptops without
                  modern technological advancements.
                </p>
                <p>
                  Unfortunately, there&apos;s even more caveats! Three.js has a
                  limitation on the resolution of a displayed webpage through an
                  iframe within the HTML component, resulting in a zoomed /
                  blurry page display. This can be mediated somewhat using css
                  scaling but the issue is not entirely made up for.
                </p>
              </div>
            </div>
            <div className="p-5 gap-y-2 rounded-xl bg-gray-700">
              <h3 className="text-2xl text-white font-bold">Sample Images</h3>
              <hr className="h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />
              <div className="mt-2 gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                {Array.from({ length: numImages }, (_, i) => (
                  <a key={i} href={`/images/threejsPortfolio/${i}.png`}>
                    <Image
                      src={`/images/threejsPortfolio/${i}.png`}
                      alt={`home media stack ${i}`}
                      width={1024}
                      height={720}
                      className="rounded-lg border-2 border-white object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold">Other Notes</h3>
          <hr className="h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />
          <p className="mt-4 text-gray-300 mb-5">
            Please consider visiting the project{" "}
            <Link href="/home" className="text-blue-400 hover:text-blue-500">
              here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
