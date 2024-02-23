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

export default function BlurredImage({
  src = "/images/swift-beach.jpg",
  caption = "taylor swift dancing on the beach",
}: BlurredImageData) {
  const [isLoading, setLoading] = useState(true);

  if (caption.length > 65) {
    caption = caption.slice(0, 63) + "...";
  }

  // TODO: add button to copy full prompt

  return (
    <Link href={src} className="group">
      <div className="p-2 max-w-sm rounded-lg overflow-hidden shadow-lg border-solid border border-black bg-white">
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
    </Link>
  );
}
