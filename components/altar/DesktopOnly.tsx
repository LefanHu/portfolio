import ButtonLink from "@/components/ui/ButtonLink";

export type DesktopOnlyReason = "phone" | "no-webgl" | "error";

const COPY: Record<DesktopOnlyReason, { heading: string; body: string }> = {
  phone: {
    heading: "This one's built for desktop",
    body: "The altar is an interactive 3D scene that needs a larger screen, a mouse, and WebGL 2.",
  },
  "no-webgl": {
    heading: "Your browser can't run the 3D scene",
    body: "The altar needs WebGL 2, which this browser doesn't offer. Another browser or device may work.",
  },
  error: {
    heading: "The 3D scene couldn't start",
    body: "Something went wrong while setting up the altar. Reloading may help, or take the regular portfolio instead.",
  },
};

/**
 * Shown in place of the altar when it cannot run (a phone, no WebGL 2, or a
 * crash). A plain page in the site's tokens, so it follows the theme like the
 * classic site it points back to.
 */
export default function DesktopOnly({ reason = "phone" }: { reason?: DesktopOnlyReason }) {
  const { heading, body } = COPY[reason];
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-sky px-5 py-10 text-center sm:px-8">
      <h1 className="font-display text-title font-bold text-ink">{heading}</h1>
      <p className="max-w-md text-body">{body}</p>
      <ButtonLink href="/" variant="primary">
        Visit the regular portfolio
      </ButtonLink>
    </main>
  );
}
