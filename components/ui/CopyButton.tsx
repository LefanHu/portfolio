"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { buttonClasses, type ButtonVariant } from "./ButtonLink";
import { CheckIcon, CopyIcon } from "./icons";

const CONFIRM_MS = 2000;

/**
 * Copies `value` to the clipboard and confirms for a moment with a check and
 * `copiedLabel`. If the clipboard is unavailable or refuses, it says so for the
 * same moment instead, so show the value as selectable text next to this button.
 */
export default function CopyButton({
  value,
  children,
  copiedLabel = "Copied",
  failedLabel = "Copy failed",
  variant = "quiet",
  className = "",
}: {
  /** The text to copy. */
  value: string;
  /** The button's label, e.g. "Copy address". */
  children: ReactNode;
  copiedLabel?: string;
  failedLabel?: string;
  variant?: ButtonVariant;
  className?: string;
}) {
  const [outcome, setOutcome] = useState<"copied" | "failed" | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    let next: "copied" | "failed" = "copied";
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // No clipboard here (insecure context, permission denied).
      next = "failed";
    }
    setOutcome(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOutcome(null), CONFIRM_MS);
  }

  const copied = outcome === "copied";
  const outcomeLabel = outcome === "failed" ? failedLabel : copiedLabel;

  // The states are stacked in one grid cell, so the button keeps its width
  // when the label changes and they can cross-fade.
  const shown = "opacity-100 scale-100";
  const hidden = "opacity-0 scale-75";
  const swap = "col-start-1 row-start-1 transition-[opacity,transform] duration-200 ease-swift";

  return (
    <>
      <button type="button" onClick={copy} className={buttonClasses(variant, className)}>
        <span className="inline-grid place-items-center">
          <CopyIcon className={`${swap} ${copied ? hidden : shown}`} />
          <CheckIcon className={`${swap} text-ok ${copied ? shown : hidden}`} />
        </span>
        <span className="inline-grid justify-items-start">
          {/* Stays the accessible name; the outcome is announced by the status region below. */}
          <span className={`${swap} ${outcome ? "opacity-0" : "opacity-100"}`}>{children}</span>
          <span aria-hidden="true" className={`${swap} ${outcome ? "opacity-100" : "opacity-0"}`}>
            {outcomeLabel}
          </span>
        </span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {outcome ? outcomeLabel : ""}
      </span>
    </>
  );
}
