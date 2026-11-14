import type { SVGProps } from "react";

// Playground-only icons, drawn to match components/ui/icons.tsx: stroke icons
// on a 24px grid in currentColor, decorative by default.

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1.25em"
      height="1.25em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const FullscreenIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4.5 9V4.5H9M15 4.5h4.5V9M19.5 15v4.5H15M9 19.5H4.5V15" />
  </Icon>
);

export const ExitFullscreenIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M9 4.5V9H4.5M19.5 9H15V4.5M15 19.5V15h4.5M4.5 15H9v4.5" />
  </Icon>
);

/** Source code. */
export const CodeIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m8.5 7.5-5 4.5 5 4.5M15.5 7.5l5 4.5-5 4.5" />
  </Icon>
);
