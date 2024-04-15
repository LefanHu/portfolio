"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import Explosion from "react-canvas-confetti/dist/presets/fireworks";

export default function SillyGoose() {
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
    <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
      <div className="hidden sm:mb-8 sm:flex sm:justify-center">
        <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10">
          Here&apos;s a little something special for you...
        </div>
      </div>
      <div className="text-center">
        <div className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
          <h1 className="p-2 text-6xl font-bold tracking-tight">Happy Birthday!</h1>
        </div>
        <p className="mt-6 text-lg leading-8 text-gray-600">My silly goose is 20? Whoa... (birthday update! look around)</p>
        <Link href="/silly-goose/wat" className="z-51">
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <div className="z-11 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              Open Your Birthday Present
            </div>
          </div>
        </Link>
      </div>
      {
        <Explosion
          autorun={{ speed: 1.5, delay: 1000 }}
          decorateOptions={(options) => {
            options.gravity = 1;
            return options;
          }}
          globalOptions={{ useWorker: true }}
        />
      }
    </div>
  );
}
