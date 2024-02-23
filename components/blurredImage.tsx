import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

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
  if (caption.length > 65) {
    caption = caption.slice(0, 63) + "...";
  }

  // TODO: add button to copy full prompt

  return (
    <a
      onClick={() => copyToClipboard(originalCaption)}
      href={src}
      target="_blank"
      className="group"
    >
      <div className="p-0 max-w-sm rounded-lg overflow-hidden shadow-lg border-solid border-[10px] border-white border-opacity-40 hover:outline-fuchsia-100 hover:outline-dashed transition-all ease-in-out">
        <Image
          alt=""
          src={src}
          width={500}
          height={500}
          className={cn(
            "group-hover:opacity-75 duration-300 ease-in-out rounded-lg",
            isLoading
              ? "grayscale blur-2xl scale-110"
              : "grayscale-0 blur-0 scale-100"
          )}
          onLoad={() => setLoading(false)}
        />
      </div>
      <h3 className="mt-4 text-sm text-gray-700">{caption}</h3>
    </a>
  );
}
