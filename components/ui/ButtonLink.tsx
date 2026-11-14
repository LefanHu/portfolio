import Link from "next/link";
import type { ReactNode } from "react";
import { ExternalIcon } from "./icons";

const BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-control border px-4 py-2 text-sm font-bold leading-tight no-underline active:translate-y-px";

const VARIANTS = {
  /** The main action of a group. One per group. */
  primary: "border-transparent bg-rune text-rune-ink hover:bg-rune-strong",
  /** Everything else. */
  secondary: "border-line-strong bg-pane text-ink hover:border-rune hover:text-rune",
  /** Low-emphasis, for toolbars and dense rows. */
  quiet: "border-transparent text-body hover:bg-rune-wash hover:text-rune",
} as const;

export type ButtonVariant = keyof typeof VARIANTS;

export function buttonClasses(variant: ButtonVariant = "secondary", className = "") {
  return `${BASE} ${VARIANTS[variant]} ${className}`;
}

function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}

/**
 * A link that looks like a button. Links to other sites open in a new tab and
 * say so with an icon; mailto:, files and in-site paths behave normally.
 */
export default function ButtonLink({
  href,
  children,
  variant = "secondary",
  icon,
  className = "",
  newTab,
  ...rest
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  /** Leading icon. */
  icon?: ReactNode;
  className?: string;
  /** Force a new tab (for example a PDF). External links always get one. */
  newTab?: boolean;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children">) {
  const external = isExternal(href);
  const classes = buttonClasses(variant, className);
  const content = (
    <>
      {icon}
      <span>{children}</span>
      {external ? <ExternalIcon className="opacity-70" width="1em" height="1em" /> : null}
    </>
  );

  if (external || newTab || !href.startsWith("/")) {
    const blank = external || newTab;
    return (
      <a
        href={href}
        className={classes}
        {...(blank ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {content}
        {blank ? <span className="sr-only"> (opens in a new tab)</span> : null}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...rest}>
      {content}
    </Link>
  );
}
