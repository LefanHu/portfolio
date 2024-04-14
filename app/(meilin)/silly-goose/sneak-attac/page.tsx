"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface AttacImages {
  ETag: string;
  Key: string;
  LastModified: string;
  Size: number;
  StorageClass: string;
}

export default function SneakAttacGallery() {
  const [images, setImages] = useState<AttacImages[]>([]);

  useEffect(() => {
    // fetch images for gallery
    const fetchImages = async () => {
      try {
        const res = await fetch("/api/s3/buckets/sneak-attacs/files", {
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
          <div key={entry.Key}>
            <Image
              className="h-auto max-w-full rounded-lg"
              key={entry.Key}
              src={`https://sneak-attacs.s3.amazonaws.com/${entry.Key}`}
              layout='fill'
              objectFit='contain'
              alt=""
            />
            <a href={`https://sneak-attacs.s3.amazonaws.com/${entry.Key}`}>link</a>
          </div>
        ))}
      </div>
    </div>
  );
}
