"use client";

import {
  ExclamationCircleIcon,
  HeartIcon,
  InformationCircleIcon,
  MusicalNoteIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Snow from "react-canvas-confetti/dist/presets/snow";

type InferenceInput = {
  inputs: string;
  options: {
    use_cache: boolean;
    wait_for_model: boolean;
  };
};

interface TaylorImageData {
  _id: string;
  prompt: string;
  date_created: string;
  image_url: string;
  tags?: string;
}

const NEGATIVE_PROMPTS = "";
const POSITIVE_PROMPTS = "";

const createImageDbEntry = async (taylorImageData: TaylorImageData) => {
  try {
    const res = await fetch("/api/ts-images", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taylorImageData),
    });

    // Throw error with status code in case Fetch API req failed
    if (!res.ok) {
      throw new Error(res.status.toString());
    }
  } catch (error) {
    console.log(`failed to create taylor image with error: ${error}`);
  }
};

const uploadImageS3 = async (image: Blob, filename: string) => {
  // create fileobject
  const file = new File([image], filename);

  try {
    const res = await fetch("/api/ts-images/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename: `${filename}.jpeg`,
        contentType: "image/jpeg",
      }),
    });

    if (!res.ok) {
      // throw some error
    }

    const { url, fields } = await res.json();

    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    formData.append("file", file);

    const uploadResponse = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      console.log("S3 Upload Error:", uploadResponse);
      alert("Something went wrong trying upload this image.");
    }
  } catch (error) {
    console.log(`Error while posting image to lefan's server: ${error}`);
    alert("Error saving image");
  }
};

export default function SwiftGenerator() {
  const [imageUrl, setImageUrl] = useState("/images/chickenbutt.webp");
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputs, setInputs] = useState<InferenceInput>({
    inputs: "",
    options: {
      use_cache: false,
      wait_for_model: true,
    },
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      // Check if window is available since Next.js does server-side rendering
      if (typeof window !== "undefined") {
        const screenWidth: number = window.innerWidth;

        if (screenWidth <= 768) {
          router.push("/silly-goose/warn");
        }
      }
    };

    // check screen size immediately
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    // if is already waiting, don't submit again
    if (isGenerating) return;
    setIsGenerating(true);

    // api fetch
    inputs["inputs"] = inputs["inputs"].concat(
      POSITIVE_PROMPTS,
      NEGATIVE_PROMPTS
    );
    const response = await fetch(
      "https://api-inference.huggingface.co/models/leaf-me-alone/sdxl-ts-lora-dream",
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_HUGGINGFACE_TOKEN}`,
        },
        method: "POST",
        body: JSON.stringify(inputs),
      }
    );
    const result = await response.blob();
    const url = URL.createObjectURL(result);
    // console.log(url);
    setImageUrl(url);
    setIsGenerating(false);

    // upload to s3
    const creationDate: string = Date.now().toString();
    await uploadImageS3(result, creationDate);

    // store data in database
    const taylorImage: TaylorImageData = {
      _id: creationDate,
      prompt: inputs.inputs,
      date_created: creationDate,
      image_url: url,
    };
    await createImageDbEntry(taylorImage);
  };
  return (
    <div className="overflow-hidden py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pr-8 lg:pt-4">
            <div className="lg:max-w-lg">
              <h2 className="text-base font-semibold leading-7 text-indigo-600">
                Welcome...
              </h2>
              <div className="flex">
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Taylor Swift Generator
                </p>
              </div>
              <form className="flex items-center m-2" onSubmit={handleSubmit}>
                <div className="relative w-full">
                  <input
                    type="text"
                    name="inputs"
                    id="inputs"
                    className="rounded-lg border border-gray-300 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full pl-2 p-2.5"
                    placeholder="a photo of taylor swift weight lifting..."
                    required={true}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="flex absolute inset-y-0 right-0 items-center pr-3"
                  ></button>
                </div>
                <button
                  type="submit"
                  className="rounded-lg inline-flex items-center py-2.5 px-3 ml-2 text-sm font-medium text-white bg-blue-700 border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300"
                >
                  {isGenerating && (
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  Generate
                </button>
                {isGenerating && (
                  <Snow
                    autorun={{ speed: 10, delay: 1000 }}
                    decorateOptions={(options) => {
                      options.gravity = 1;
                      options.shapes = ["circle", "square", "star"];
                      options.colors = ["FFFFA6"];
                      return options;
                    }}
                    globalOptions={{ useWorker: true }}
                  />
                )}
              </form>
              <div className="flex">
                <p className="mt-2 text-xl font-bold tracking-tight text-gray-900">
                  Some generation tips
                </p>
              </div>
              <dl className="mt-5 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                <div className="relative pl-9">
                  <dt className="inline font-semibold text-gray-900">
                    <InformationCircleIcon className="absolute left-1 top-1 h-5 w-5 text-indigo-600" />
                    Taylor Swift Generator.
                  </dt>
                  <dd className="">
                    Your <b>first</b> image can take up to <b>2 minutes</b>,
                    please have patience silly goose... Subsequent images should
                    only take <b>15 seconds</b>...
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
          <Image
            src={imageUrl}
            width={1024}
            height={1024}
            alt="a generated image of taylor swift"
            className="rounded-lg mt-14"
            priority={true}
          />
        </div>
      </div>
    </div>
  );
}
