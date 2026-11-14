"use client";

import { useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent } from "react";
import { experimentHref } from "./experiments";

// Which experiment is showing lives in the URL's `?script=` and nowhere else.
// It is read straight from the address bar rather than through
// `useSearchParams`: Next delivers a URL change inside a transition, and under
// the site layout's <ViewTransition> such an update waits for a snapshot of
// the page and then cross-fades in. Stepping through experiments should answer
// the click at once, and a `useSyncExternalStore` read updates in the same
// tick. It also keeps the page prerenderable without a Suspense boundary.

const CHANGE_EVENT = "playground:experiment";

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("popstate", onChange);
  };
}

/**
 * The raw `?script=` value: null when the URL has none, and `undefined` while
 * the URL cannot be known (on the server and during hydration).
 */
export function useScriptParam(): string | null | undefined {
  return useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(window.location.search).get("script"),
    () => undefined,
  );
}

/**
 * Shows an experiment by putting it in the URL; `null` clears the choice, which
 * shows the default one. `replaceState` (which Next's router follows) rather
 * than a navigation: the page is already here, and flicking through eighteen
 * pieces should leave one history entry, so Back still leaves the playground
 * in one step.
 */
export function showExperiment(id: string | null) {
  window.history.replaceState(null, "", id === null ? window.location.pathname : experimentHref(id));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * A real link to an experiment, so it can be copied or opened in a new tab.
 * A plain click switches in place.
 */
export default function ExperimentLink({
  id,
  onClick,
  ...props
}: { id: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (event.defaultPrevented || event.button !== 0 || modified) return;
    event.preventDefault();
    showExperiment(id);
  };

  return <a href={experimentHref(id)} onClick={handleClick} {...props} />;
}
