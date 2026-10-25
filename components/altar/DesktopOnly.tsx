import Link from "next/link";

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

export default function DesktopOnly({ reason = "phone" }: { reason?: DesktopOnlyReason }) {
  const { heading, body } = COPY[reason];
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-black px-6 text-center text-white">
      <h1 className="text-3xl font-bold">{heading}</h1>
      <p className="max-w-md text-neutral-300">{body}</p>
      <Link href="/" className="text-sky-300 underline underline-offset-4 hover:text-sky-200">
        Visit the regular portfolio
      </Link>
    </div>
  );
}
