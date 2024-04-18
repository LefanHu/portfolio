"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function WindowSizeEnforceWrapper({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      // Check if window is available since Next.js does server-side rendering
      if (typeof window !== "undefined") {
        const screenWidth: number = window.innerWidth;

        if (screenWidth <= 768) {
          router.push("/silly-goose/warn");
        }
      }
    };

    // check screen size immediately
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

  return <>{children}</>;
}
