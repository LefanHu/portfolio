"use client";

import dynamic from "next/dynamic";

// The LeetCode block fetches live data and pulls in a calendar library, so it
// loads after the rest of the page.
const LeetcodeStats = dynamic(() => import("@/components/portfolio/LeetcodeStats"));

export default function HomeDeferredSections() {
  return <LeetcodeStats />;
}
