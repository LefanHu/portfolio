import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ClipboardDocumentIcon,
  ClipboardIcon,
} from "@heroicons/react/24/outline";

interface BlurredImageData {
  src?: string;
  caption?: string;
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const copyToClipboard = async (text: string) => {
  try {
    navigator.clipboard.writeText(text);
  } catch (err) {
    console.error(err);
  }
};

export default function BlurredImage({
  src = "/images/swift-beach.jpg",
  caption = "taylor swift dancing on the beach",
}: BlurredImageData) {
  const [isLoading, setLoading] = useState(true);

  const originalCaption: string = caption;
  if (caption.length > 85) {
    caption = caption.slice(0, 83) + "...";
  }

  // TODO: add button to copy full prompt

  return (
    <div className="group h-full">
      <div className="backdrop-blur-md p-2 max-w-sm rounded-lg overflow-hidden shadow-lg hover:outline-fuchsia-100 hover:outline-dashed transition-all ease-in-out h-full">
        <a href={src} target="_blank">
          <Image
            alt=""
            src={src}
            width={500}
            height={500}
            className={cn(
              "group-hover:opacity-75 duration-300 ease-in-out rounded-lg",
              isLoading
                ? "grayscale blur-lg scale-105"
                : "grayscale-0 blur-0 scale-100"
            )}
            onLoad={() => setLoading(false)}
            onClick={() => copyToClipboard(originalCaption)}
          />
        </a>
        <div className="flex items-center justify-between space-x-2 z-50 flex-grow">
          <span className="text-sm text-gray-700">{caption}</span>
          <button
            onClick={() => {
              copyToClipboard(originalCaption);
              alert("prompt copied to clipboard");
            }}
            className="m-3 aspect-square h-12 max-h-[36px] w-12 max-w-[36px] rounded-lg bg-pink-500 font-sans text-sm font-bold uppercase text-white shadow-md shadow-pink-500/20 transition-all hover:shadow-lg hover:shadow-pink-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
          >
            <ClipboardDocumentIcon className="p-1 text-2xl leading-none" />
          </button>
        </div>
      </div>
    </div>
  );
}
