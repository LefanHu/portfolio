"use client";

import { useEffect } from "react";
import ButtonLink, { buttonClasses } from "@/components/ui/ButtonLink";

// The 3D pages load large models and need WebGL. If one fails, say so and
// offer the way back instead of leaving a blank screen.
export default function ThreeDError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-start justify-center px-5 sm:px-8">
      <h1 className="text-title font-bold">The 3D scene could not load</h1>
      <p className="mt-3 text-lead text-mute">
        Its models may have failed to download, or this browser may not support WebGL. Everything in it is
        also on the classic site.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/" variant="primary">
          Go to the classic site
        </ButtonLink>
        <button type="button" onClick={() => retry()} className={buttonClasses("secondary")}>
          Try again
        </button>
      </div>
    </main>
  );
}
