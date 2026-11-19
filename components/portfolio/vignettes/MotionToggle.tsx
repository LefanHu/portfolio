"use client";

import { useSyncExternalStore } from "react";
import { PauseIcon, PlayIcon } from "@/components/ui/icons";
import { motionPaused, setMotionPaused, subscribeMotion } from "./motion";

/**
 * Pauses or plays every experience vignette at once. Seven loops running
 * beside the text need an off switch; it is also how a visitor who asked for
 * reduced motion, and so starts with stills, can choose to play them.
 */
export default function MotionToggle({ className = "" }: { className?: string }) {
  const paused = useSyncExternalStore(subscribeMotion, motionPaused, () => false);
  const Icon = paused ? PlayIcon : PauseIcon;

  return (
    <button
      type="button"
      onClick={() => setMotionPaused(!paused)}
      className={`inline-flex min-h-9 items-center gap-1.5 rounded-control px-2 text-sm font-medium text-mute hover:bg-rune-wash hover:text-rune ${className}`}
    >
      <Icon className="h-4 w-4" />
      {paused ? "Play animations" : "Pause animations"}
    </button>
  );
}
