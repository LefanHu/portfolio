"use client";

import BlurredImage from "@/components/blurredImage";
import Image from "next/image";
import { useEffect, useState } from "react";

interface AttacImages {
  ETag: string;
  Key: string;
  LastModified: string;
  Size: number;
  StorageClass: string;
}

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    chunks.push(chunk);
  }
  return chunks;
}

export default function SneakAttacGallery() {
  const [images, setImages] = useState<AttacImages[][]>([]);

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
        setImages(chunkArray(results, 4));

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
    <div className="grid grid-cols-3 md:grid-cols-5 gap-3 overflow-y-scroll no-scrollbar">
      {images.map((col) =>
        col.map((entry) => (
          <div key={entry.Key} className="grid gap-2">
            <div>
              <BlurredImage
                // className="h-auto max-w-full rounded-lg"
                // key={entry.Key}
                src={`https://sneak-attacs.s3.amazonaws.com/${entry.Key}`}
                // width={500}
                // height={500}
                // layout='fill'
                // objectFit='contain'
                // alt=""
              />
              {/* <a className="text-black" href={`https://sneak-attacs.s3.amazonaws.com/${entry.Key}`}> */}
              {/*   link */}
              {/* </a> */}
            </div>
          </div>
        )),
      )}
    </div>
  );
}
