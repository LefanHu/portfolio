"use client";

import BlurredImage from "@/components/blurredImage";
import { useEffect, useState } from "react";

interface TaylorImageDocument {
  _id: string;
  prompt: string;
  date_created: string;
  image_url: string;
  tags?: string;
}

export default function SwiftGallery() {
  const [images, setImages] = useState<TaylorImageDocument[]>([]);

  useEffect(() => {
    // fetch images for gallery
    const fetchDBImages = async () => {
      try {
        const res = await fetch("/api/ts-images", {
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
    fetchDBImages();
  }, []);

  return (
    <div className="h-full max-w-2xl mx-auto py-6 px-4 sm:py-8 sm:px-6 lg:max-w-7xl lg:px-8 overflow-y-scroll no-scrollbar">
      <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
        {images.reverse().map((entry) => (
          <BlurredImage key={entry._id} src={entry.image_url} caption={entry.prompt} />
        ))}
      </div>
    </div>
  );
}
