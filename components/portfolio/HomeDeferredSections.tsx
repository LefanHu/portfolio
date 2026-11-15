"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode } from "react";
import { CodingNotice, CodingSection } from "./lt/CodingSection";

// The LeetCode block fetches live data and pulls in a calendar library, so its
// code arrives in a file of its own, after the rest of the page.
const LeetcodeStats = dynamic(() => import("@/components/portfolio/LeetcodeStats"));

/**
 * If that file does not arrive (a dropped connection, a tab left open across
 * a deploy), only this section says so. Without a boundary of its own the
 * failure would replace the whole home page with the error screen.
 */
class CodingBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <CodingSection status="error">
        <CodingNotice>This section did not load. Reloading the page usually brings it back.</CodingNotice>
      </CodingSection>
    );
  }
}

export default function HomeDeferredSections() {
  return (
    <CodingBoundary>
      <LeetcodeStats />
    </CodingBoundary>
  );
}
