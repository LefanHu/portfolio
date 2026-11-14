import type { Metadata } from "next";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";
import ButtonLink from "@/components/ui/ButtonLink";
import { CONTAINER } from "@/components/ui/layout";

export const metadata: Metadata = {
  title: "Page not found",
};

// Unmatched URLs land here (a not-found file inside a route group would not
// catch them), so this page brings its own header and footer.
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className={`${CONTAINER} flex flex-1 flex-col items-start justify-center py-24`}>
        <p className="font-display text-display font-extrabold text-rune" aria-hidden="true">
          404
        </p>
        <h1 className="mt-4 text-title font-bold">This page isn&apos;t here</h1>
        <p className="mt-3 max-w-xl text-lead text-mute">
          The address may be mistyped, or the page may have moved. The home page and the project list are
          good places to pick the trail back up.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/" variant="primary">
            Go to the home page
          </ButtonLink>
          <ButtonLink href="/project-gallery">Browse all projects</ButtonLink>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
