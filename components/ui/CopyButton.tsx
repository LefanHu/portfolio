"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { buttonClasses, type ButtonVariant } from "./ButtonLink";
import { CheckIcon, CopyIcon } from "./icons";

const CONFIRM_MS = 2000;

/**
 * Copies `value` to the clipboard and confirms for a moment with a check and
 * `copiedLabel`. If the clipboard is unavailable or refuses, nothing happens,
 * so show the value as selectable text next to this button.
 */
export default function CopyButton({
  value,
  children,
  copiedLabel = "Copied",
  variant = "quiet",
  className = "",
}: {
  /** The text to copy. */
  value: string;
  /** The button's label, e.g. "Copy address". */
  children: ReactNode;
  copiedLabel?: string;
  variant?: ButtonVariant;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // No clipboard here (insecure context, permission denied): fail quietly.
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), CONFIRM_MS);
  }

  // Both states are stacked in one grid cell, so the button keeps its width
  // when the label changes and the two can cross-fade.
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
          {/* Stays the accessible name; the confirmation is announced by the status region below. */}
          <span className={`${swap} ${copied ? "opacity-0" : "opacity-100"}`}>{children}</span>
          <span aria-hidden="true" className={`${swap} ${copied ? "opacity-100" : "opacity-0"}`}>
            {copiedLabel}
          </span>
        </span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </>
  );
}
