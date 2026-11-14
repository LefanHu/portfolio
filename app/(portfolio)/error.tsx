"use client";

import { useEffect } from "react";
import ButtonLink, { buttonClasses } from "@/components/ui/ButtonLink";
import { CONTAINER } from "@/components/ui/layout";

// Shown inside the site shell when a page throws while rendering, so a failure
// in one section (live data, a canvas experiment) never leaves a blank screen.
export default function PortfolioError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={`${CONTAINER} flex flex-col items-start py-24`}>
      <h1 className="text-title font-bold">This page hit a problem</h1>
      <p className="mt-3 max-w-xl text-lead text-mute">
        Something failed while the page was being put together. Trying again usually fixes it.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={() => retry()} className={buttonClasses("primary")}>
          Try again
        </button>
        <ButtonLink href="/">Go to the home page</ButtonLink>
      </div>
    </div>
  );
}
