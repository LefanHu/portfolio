"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ExclamationCircleIcon,
  HeartIcon,
  InformationCircleIcon,
  MusicalNoteIcon,
} from "@heroicons/react/24/outline";
import { resourceLimits } from "worker_threads";

interface TaylorImageDocument {
  _id: string;
  prompt: string;
  date_created: string;
  image_url: string;
  tags?: string;
}

export default function ImageEditPage({ params }: { params: { id: string } }) {
  const [imageData, setImageData] = useState<TaylorImageDocument>({
    _id: "<placeholder id>",
    prompt: "chicken butt?",
    date_created: "way back when",
    image_url: "/images/chickenbutt.webp",
  });
  useEffect(() => {
    const fetchDBImage = async () => {
      try {
        const res = await fetch(`/api/ts-images/${params.id}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
        const result = await res.json();
        setImageData(result);
        console.log(result);

        // Throw error with status code in case Fetch API req failed
        if (!res.ok) {
          throw new Error(res.status.toString());
        }
      } catch (error) {
        console.log(`failed to fetch image data: ${error}`);
      }
    };
    fetchDBImage();
  }, [params.id]);
  return (
    <div className="overflow-hidden py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <Image
            src={imageData?.image_url!}
            width={1024}
            height={1024}
            alt="a generated image of taylor swift"
            className="rounded-lg mt-14"
            priority={true}
          />
          <div className="lg:pr-8 lg:pt-4">
            <div className="lg:max-w-lg">
              <div className="flex">
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Image Options
                </p>
              </div>
              <div className="border border-black rounded-lg p-1 m-2">
                <dl className="mt-5 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                  <div className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <InformationCircleIcon className="absolute left-1 top-1 h-5 w-5 text-indigo-600" />
                      Taylor Swift Generator.
                    </dt>
                    <dd className="">
                      Your <b>first</b> image can take up to <b>2 minutes</b>,
                      please have patience silly goose... Subsequent images
                      should only take <b>15 seconds</b>...
                    </dd>
                  </div>
                  <div className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <MusicalNoteIcon className="absolute left-1 top-1 h-5 w-5 text-indigo-600" />
                      Be persistent with the images.
                    </dt>
                    <dd className="">
                      If the image doesn&apos;t contain what you specified, try
                      again or change up the wording!
                    </dd>
                  </div>
                  <div className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <ExclamationCircleIcon className="absolute left-1 top-1 h-5 w-5 text-indigo-600" />
                      Tags!
                    </dt>
                    <dd className="">
                      Use tags in your prompt like 8k, photorealistic, natural
                      lighting, etc. Look at the gallery for some examples.
                    </dd>
                  </div>
                  <div className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <HeartIcon className="absolute left-1 top-1 h-5 w-5 text-indigo-600" />
                      Enjoy!
                    </dt>
                    <dd className="">Play around with it and have fun :)</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
