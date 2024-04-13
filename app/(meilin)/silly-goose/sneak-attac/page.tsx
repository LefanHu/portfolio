"use client";

import Image from "next/image";
import BlurredImage from "@/components/blurredImage";
import { useEffect, useState } from "react";

interface AttacImages {
  object_key: string;
  width: number;
  height: number;
  image_url: string;
}

export default function SneakAttacGallery() {
  const [images, setImages] = useState<AttacImages[]>([]);

  useEffect(() => {
    // fetch images for gallery
    const fetchImages = async () => {
      try {
        const res = await fetch("/api/s3", {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
        const results = await res.json();
        setImages(results);

        // Throw error with status code in case Fetch API req failed
        if (!res.ok) {
          throw new Error(res.status.toString());
        }
      } catch (error) {
        console.log(`failed to fetch images from next api with error: ${error}`);
      }
    };
    fetchImages();
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="grid gap-4">
        {images.map((entry) => (
          // <BlurredImage key={entry.object_key} src={entry.image_url} />
          <div>
            <Image
              className="h-auto max-w-full rounded-lg"
              key={entry.object_key}
              src={entry.image_url}
              width={entry.width}
              height={entry.height}
              alt=""
            />
          </div>
        ))}
      </div>
    </div>
  );
}
