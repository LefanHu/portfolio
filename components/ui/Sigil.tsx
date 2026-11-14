import type { SITE_ANCHORS } from "@/lib/portfolioProjects";

/** The four home sections; each matches a recipe on the 3D altar. */
export type SectionKey = keyof typeof SITE_ANCHORS;

// Static class names so Tailwind can see them.
export const SIGIL_TEXT: Record<SectionKey, string> = {
  projects: "text-sig-projects",
  experience: "text-sig-experience",
  coding: "text-sig-coding",
  contact: "text-sig-contact",
};

/**
 * The altar's artifact mark: a small diamond in the section's colour, hollow
 * until `filled`. On the altar it fills when a recipe is unlocked; on this site
 * it fills for the section being read.
 */
export default function Sigil({
  section,
  filled = false,
  className = "",
}: {
  section: SectionKey;
  filled?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="0.7em"
      height="0.7em"
      aria-hidden="true"
      focusable="false"
      className={`shrink-0 ${SIGIL_TEXT[section]} ${className}`}
    >
      <path
        d="M8 1.6 14.4 8 8 14.4 1.6 8Z"
        fill="currentColor"
        fillOpacity={filled ? 1 : 0}
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinejoin="round"
        style={{ transition: "fill-opacity 250ms var(--ease-swift)" }}
      />
    </svg>
  );
}
