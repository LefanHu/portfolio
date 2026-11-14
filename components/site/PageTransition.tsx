"use client";

import { ViewTransition } from "react";
import { usePathname } from "next/navigation";

/**
 * Cross-fades the page when the PATH changes. Keying on the pathname makes a
 * route change an exit/enter pair; `default="none"` keeps everything else (a
 * hash link, a `?query` update, a re-render) from animating the whole page.
 * A project's title still morphs from its card to its page: that pair is named
 * separately (projectTitleTransition).
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <ViewTransition key={pathname} enter="auto" exit="auto" default="none">
      {children}
    </ViewTransition>
  );
}
