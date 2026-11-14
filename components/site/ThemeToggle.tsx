"use client";

import { useLayoutEffect } from "react";
import { ensureThemeAttribute, toggleTheme } from "@/lib/theme";
import { useTheme } from "@/lib/useTheme";
import { MoonIcon, SunIcon } from "@/components/ui/icons";

/**
 * Switches the whole site (and the 3D altar) between night and day.
 * Both icons are always in the markup and CSS picks one from `data-theme`, so
 * the button is right before hydration. `data-theme-toggle` lets the altar hide
 * this copy inside its framed view of the site, where its own switch is in reach.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useTheme();

  useLayoutEffect(() => {
    ensureThemeAttribute();
  }, []);

  return (
    <button
      type="button"
      data-theme-toggle
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className={`relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-control border border-line-strong bg-pane text-ink hover:border-rune hover:text-rune ${className}`}
    >
      <SunIcon className="absolute rotate-90 scale-50 opacity-0 transition-[opacity,rotate,scale] duration-300 ease-swift dark:rotate-0 dark:scale-100 dark:opacity-100" />
      <MoonIcon className="absolute transition-[opacity,rotate,scale] duration-300 ease-swift dark:-rotate-90 dark:scale-50 dark:opacity-0" />
    </button>
  );
}
