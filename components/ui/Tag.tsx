import type { ReactNode } from "react";

/**
 * The one chip on the site: technologies, skills, dates, small facts.
 * Render lists of them inside a wrapping <ul> (see TagList).
 */
export default function Tag({
  children,
  tone = "plain",
  as: Component = "span",
}: {
  children: ReactNode;
  /** `accent` for the one fact in a group worth picking out (a status, a count). */
  tone?: "plain" | "accent";
  as?: "span" | "li";
}) {
  const tones =
    tone === "accent"
      ? "border-line-strong bg-rune-wash text-rune"
      : "border-line bg-pane-raise text-body";
  return (
    <Component
      className={`inline-flex items-center gap-1.5 rounded-chip border px-2.5 py-0.5 text-xs font-medium ${tones}`}
    >
      {children}
    </Component>
  );
}

export function TagList({ label, tags }: { label: string; tags: readonly string[] }) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <Tag as="li" key={tag}>
          {tag}
        </Tag>
      ))}
    </ul>
  );
}
