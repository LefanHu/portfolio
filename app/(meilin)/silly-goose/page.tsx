"use client";

import RunawayButton from "@/components/runawayButton";
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
    <div>
      <div className="text-black">easter egg! hehe</div>
      <RunawayButton href="/silly-goose/happy-birthday" />
    </div>
  );
}
