// The class names matter beyond styling: the altar's projection outlines any
// element whose class contains "rounded" or "border" (components/altar/projection/wireTags.ts).

/** Classes for the standard card surface. Use directly when a Panel wrapper would get in the way. */
export const PANEL = "rounded-card border border-line bg-pane shadow-card";

/** A surface nested inside a panel. */
export const INSET = "rounded-control border border-line bg-pane-raise";

interface PanelProps extends React.HTMLAttributes<HTMLElement> {
  as?: "div" | "section" | "article" | "aside" | "li";
  /** `inset` for a surface inside another panel. */
  variant?: "card" | "inset";
}

/** The standard card. Don't nest cards more than one level (card > inset). */
export default function Panel({ as: Component = "div", variant = "card", className = "", ...props }: PanelProps) {
  return <Component className={`${variant === "card" ? PANEL : INSET} ${className}`} {...props} />;
}

/**
 * The altar board's corner marks, for the one or two panels on a page that
 * deserve emphasis. Place inside a `relative` panel.
 */
export function Brackets() {
  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-1.5 -top-1.5 h-4 w-4 border-l-2 border-t-2 border-rune"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-1.5 -right-1.5 h-4 w-4 border-b-2 border-r-2 border-rune"
      />
    </>
  );
}
