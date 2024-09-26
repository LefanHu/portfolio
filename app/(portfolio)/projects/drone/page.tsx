"use client";

import { LinkIcon } from "@heroicons/react/24/outline";
import { Badge, List } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

const technologyBadge = (tech: string) => {
  return (
    <Badge
      size="md"
      variant="gradient"
      gradient={{
        from: "rgba(186, 186, 186, 1)",
        to: "rgba(145, 145, 145, 1)",
        deg: 123,
      }}
      key={tech}
    >
      {tech}
    </Badge>
  );
};

export default function FPVDroneProjectPage() {
  const technologies = [
    "betaflight",
    "fpv",
    "microcontrollers",
    "autonomous flight",
    "c",
  ];

  const overviewPoints = [
    "custom firmware in progrses for autonomous flight",
    "SpeedyBeef405 Flight Controller",
  ];

  const numImages = 8;

  return (
    <div className="flex-1 overflow-auto no-scrollbar bg-black">
      <div className="mx-auto grid max-w-4xl grid-cols-1 items-center py-12 gap-y-8 sm:py-16 lg:max-w-7xl px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-6xl">
            FPV Drone / Autonomous Flight Project
          </h2>
          <hr className="h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />
          {/* technologies */}
          <div className="flex flex-row gap-2 pt-2">
            {technologies.map((tech) => technologyBadge(tech))}
          </div>
          <p className="mt-4 text-gray-300 mb-5">
            An interesting drone project.
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
            <div className="p-5 gap-y-2 rounded-xl bg-gray-700">
              <h3 className="text-2xl text-white font-bold">Example Images</h3>
              <hr className="h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />
              <div className="mt-2 gap-4 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4">
                {Array.from({ length: numImages }, (_, i) => (
                  <Image
                    key={i + 1}
                    src={`/images/fpvdrone/${i + 1}.jpg`}
                    alt={`drone image ${i + 1}`}
                    width={1024}
                    height={1024}
                    className="rounded-lg border-2 border-white object-cover aspect-square"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* <div>
          <h3 className="text-2xl font-bold">Other Notes</h3>
          <hr className="h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />
          <p className="mt-4 text-gray-300 mb-5">
            Please consider visiting the project{" "}
            <Link
              href=""
              className="text-blue-400 hover:text-blue-500"
            >
              here
            </Link>
          </p>
        </div> */}
      </div>
    </div>
  );
}
