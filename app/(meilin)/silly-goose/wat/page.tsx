"use client";

import ImageSlider from "@/components/imageSlider";
import {
  ArchiveBoxArrowDownIcon,
  CakeIcon,
  HeartIcon,
  InformationCircleIcon,
  MusicalNoteIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SwiftGallery() {
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      // Check if window is available since Next.js does server-side rendering
      if (typeof window !== "undefined") {
        const screenWidth: number = window.innerWidth;

        // Redirect if screen width is less than or equal to 768 pixels
        if (screenWidth <= 768) {
          router.push("/silly-goose/warn"); // Change '/another-page' to your desired redirection target
        }
      }
    };

    // check screen size immediately
    handleResize();

    window.addEventListener("resize", handleResize);

    // Cleanup function to remove event listener
    return () => window.removeEventListener("resize", handleResize);
  });

  const carouselList = [
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
  ];

  return (
    <div className="overflow-hidden py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pr-8 lg:pt-4">
            <div className="lg:max-w-lg">
              <h2 className="text-base font-semibold leading-7 text-indigo-600">
                Hey Melon...
              </h2>
              <div className="flex">
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Happy Birthday!
                </p>
                <CakeIcon className="ml-5 mt-1 w-8 text-black" />
              </div>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                It&apos;s your birthday today... I started working on this in
                Februrary, and now it&apos;s done... This is your birthday gift
                from me :)
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                <div className="relative pl-9">
                  <dt className="inline font-semibold text-gray-900">
                    <InformationCircleIcon className="absolute left-1 top-1 h-5 w-5 text-indigo-600" />
                    Taylor Swift Generator.
                  </dt>
                  <dd className="">
                    This website will generate taylor swift images for you...
                    For example on the right you can see taylor swift in a
                    bucket...swimming in sand... and even in a selfie with you
                  </dd>
                </div>
                <div className="relative pl-9">
                  <dt className="inline font-semibold text-gray-900">
                    <MusicalNoteIcon className="absolute left-1 top-1 h-5 w-5 text-indigo-600" />
                    Be persistent with the images.
                  </dt>
                  <dd className="">
                    It generates a lot of taylor swift images... if the image
                    comes out weird... just try again :D
                  </dd>
                </div>
                <div className="relative pl-9">
                  <dt className="inline font-semibold text-gray-900">
                    <ArchiveBoxArrowDownIcon className="absolute left-1 top-1 h-5 w-5 text-indigo-600" />
                    Database backups.
                  </dt>
                  <dd className="">
                    Generated images dont&apos;t disappear, they get saved in
                    the image gallery. You can access it at the top.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          <ImageSlider
            className="rounded-lg mt-14"
            imageList={carouselList}
          ></ImageSlider>
        </div>
      </div>
    </div>
  );
}
