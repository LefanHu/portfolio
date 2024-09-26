"use client";

import TechnologyBadge from "@/components/portfolio/TechnologyBadge";
import { List } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

export default function TaylorGeneratorProjectPage() {
  const technologies = [
    "React",
    "NextJS",
    "TailwindCSS",
    "TypeScript",
    "Hugging Face",
    "Python",
    "AWS",
    "MongoDB",
    "Docker",
    "Scrapy",
  ];

  const overviewPoints = [
    "Generates a photo of Taylor Swift based on the prompt entered to the application",
    "Prompt is passed to Hugging Face serverless inference for image generation.",
    "Custom tuned LORA adapter trained on AWS GPU instance and using Huggingface",
    "S3 bucket for hosting images",
    "MongoDB for storing image metadata",
    "Scrapy for obtaining dataset of Taylor Swift images",
    "NextJS frontend for user interaction",
  ];

  const galleryList = [
    {
      src: "/images/swift-beach.jpg",
      alt: "taylor swift modeling on beach",
      width: 1024,
      height: 1024,
    },
    {
      src: "/images/swift-castle.jpg",
      alt: "taylor swift beach sand castle",
      width: 1024,
      height: 1024,
    },
    {
      src: "/images/taylor-sand.jpg",
      alt: "taylor swift swimming in sand",
      width: 1024,
      height: 1024,
    },
    {
      src: "/images/swift-wine.jpg",
      alt: "taylor swift drinking wine",
      width: 1024,
      height: 1024,
    },
    {
      src: "/images/bucket-swift.jpg",
      alt: "taylor swift in a bucket",
      width: 1024,
      height: 1024,
    },
    {
      src: "/images/taylor-model.jpg",
      alt: "taylor swift modeling",
      width: 1024,
      height: 1024,
    },
    {
      src: "/images/taylor-artsy.jpg",
      alt: "taylor swift artsy short hair curly",
      width: 1024,
      height: 1024,
    },
    {
      src: "/images/swift-majestic.jpeg",
      alt: "majestic taylor swift",
      width: 1024,
      height: 1024,
    },
  ];

  return (
    <div className="flex-1 overflow-auto no-scrollbar bg-black">
      <div className="mx-auto grid max-w-4xl grid-cols-1 items-center py-12 gap-y-8 sm:py-16 lg:max-w-7xl px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-6xl">
            Stable Diffusion Project
          </h2>
          <hr className="h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />
          {/* technologies */}
          <div className="flex flex-row gap-2 pt-2">
            {technologies.map((tech) => TechnologyBadge(tech))}
          </div>
          <p className="mt-4 text-gray-300 mb-5">
            Stable diffusion image generator. Originally inspired by someone who
            loves all things Taylor Swift.
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
                {galleryList.map((image) => (
                  <Image
                    key={image.src}
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    className="rounded-lg border-2 border-white"
                  />
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
            <Link
              href="/silly-goose/image-gallery"
              className="text-blue-400 hover:text-blue-500"
            >
              here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
