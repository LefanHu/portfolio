import type { ReactNode } from "react";
import Sigil, { type SectionKey } from "./Sigil";

/**
 * Heading for a home-page section: the section's sigil, its title, an optional
 * one-line lead, and an optional action on the right (a link, a status pill).
 */
export default function SectionHeading({
  section,
  title,
  children,
  action,
  id,
}: {
  section: SectionKey;
  title: string;
  /** One supporting sentence. */
  children?: ReactNode;
  action?: ReactNode;
  /** id for the <h2>, so the section can point at it with aria-labelledby. */
  id?: string;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
      <div className="max-w-2xl">
        <h2 id={id} className="flex items-baseline gap-3 text-title font-bold tracking-tight">
          <Sigil section={section} filled className="translate-y-[-0.06em]" />
          {title}
        </h2>
        {children ? <p className="mt-3 text-lead text-mute">{children}</p> : null}
      </div>
      {action ? <div className="pb-1">{action}</div> : null}
    </header>
  );
}
