"use client";

import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { LoaderScreen } from "@/components/three/LoaderSceen";
import { detectSupport, readSupportEnv, type SupportResult } from "@/lib/altar/support";
import DesktopOnly from "./DesktopOnly";

const AltarExperience = dynamic(() => import("./AltarExperience"), {
  ssr: false,
  loading: () => <LoaderScreen />,
});

/**
 * R3F rethrows renderer/shader/Rapier failures into the React tree, and the
 * dynamic import can fail with a ChunkLoadError; either way show the fallback
 * instead of Next's generic error page.
 */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Altar scene failed", error);
  }

  render() {
    return this.state.failed ? <DesktopOnly reason="error" /> : this.props.children;
  }
}

export default function AltarEntry() {
  const [support, setSupport] = useState<SupportResult | null>(null);
  const escaped = useRef(false);

  useEffect(() => {
    // Inside a frame: the projection followed the site's link to the altar.
    // Never nest the scene (no WebGL probe, no chunk); ask the parent altar to
    // close the projection instead (its Escape), once, and stay empty.
    if (window.frameElement) {
      if (!escaped.current) window.parent.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      escaped.current = true;
      return;
    }
    // Decide after mount only, so SSR and first client render match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupport(detectSupport(readSupportEnv()));
  }, []);

  if (!support) return null;
  if (!support.ok) return <DesktopOnly reason={support.reason} />;
  return (
    <SceneBoundary>
      <AltarExperience />
    </SceneBoundary>
  );
}
