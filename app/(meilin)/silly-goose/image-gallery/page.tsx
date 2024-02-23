"use client";

import BlurredImage from "@/components/blurredImage";
import TaylorGeneratorImageCard from "@/components/tsGeneratorCard";
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
  return (
    // <div className="grid gap-2 p-2 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
    //   {/* <TaylorGeneratorImageCard /> */}
    //   <BlurredImage />
    //   <BlurredImage />
    // </div>
    <div className="h-full max-w-2xl mx-auto py-6 px-4 sm:py-8 sm:px-6 lg:max-w-7xl lg:px-8 overflow-y-scroll no-scrollbar">
      <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
        <BlurredImage />
        <BlurredImage />
        <BlurredImage />
        <BlurredImage />
        <BlurredImage />
        <BlurredImage />
        <BlurredImage />
        <BlurredImage />
        <BlurredImage />
        <BlurredImage />
        <BlurredImage />
        <BlurredImage />
        {/* <TaylorGeneratorImageCard />
        <TaylorGeneratorImageCard /> */}
      </div>
    </div>
  );
}
