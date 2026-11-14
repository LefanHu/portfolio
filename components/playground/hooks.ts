"use client";

import { useCallback, useEffect, useState, useSyncExternalStore, type RefObject } from "react";

/** Whether a media query matches. False on the server and until hydration. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

/** False while the tab is in the background. */
export function useDocumentVisible() {
  return useSyncExternalStore(
    subscribeVisibility,
    () => !document.hidden,
    () => true,
  );
}

/** Whether any part of the element is in the viewport. Assumes it is until told otherwise. */
export function useInView(ref: RefObject<Element | null>) {
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver((entries) => {
      setInView(entries[entries.length - 1].isIntersecting);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return inView;
}

const noSubscription = () => () => {};

/**
 * The Fullscreen API for one element. `supported` is false where the browser
 * has none (iPhone Safari) or the page is framed without permission for it
 * (the altar's view of the site), so the control can be left out.
 */
export function useFullscreen(ref: RefObject<Element | null>) {
  const supported = useSyncExternalStore(
    noSubscription,
    () => document.fullscreenEnabled === true,
    () => false,
  );
  const [active, setActive] = useState(false);

  useEffect(() => {
    const onChange = () => setActive(document.fullscreenElement !== null && document.fullscreenElement === ref.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [ref]);

  const toggle = useCallback(() => {
    // A refused request (no user gesture, a browser policy) leaves things as they are.
    const request = document.fullscreenElement ? document.exitFullscreen() : ref.current?.requestFullscreen();
    request?.catch(() => {});
  }, [ref]);

  return { supported, active, toggle };
}

/**
 * Whether a scroll container has content hidden before or after the visible
 * part, on either axis: drives the fades that say "there is more this way".
 */
export function useScrollEdges(ref: RefObject<HTMLElement | null>) {
  const [edges, setEdges] = useState({ before: false, after: false });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () => {
      const before = element.scrollLeft > 1 || element.scrollTop > 1;
      const after =
        element.scrollWidth - element.clientWidth - element.scrollLeft > 1 ||
        element.scrollHeight - element.clientHeight - element.scrollTop > 1;
      setEdges((current) => (current.before === before && current.after === after ? current : { before, after }));
    };

    // The observer also reports once when it starts, which takes the first measurement.
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", update);
    };
  }, [ref]);

  return edges;
}
