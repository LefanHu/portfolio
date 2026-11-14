import type { SVGProps } from "react";

// Stroke icons on a 24px grid, drawn in currentColor. Decorative by default:
// the control around an icon carries the accessible name.

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

export const SunIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
  </Icon>
);

export const MoonIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5Z" />
  </Icon>
);

export const MenuIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);

export const CloseIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const MailIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path d="m4 7.5 8 6 8-6" />
  </Icon>
);

export const DocumentIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20V3.5Z" />
    <path d="M14 3.5v4h4M10 12.5h5M10 16h5" />
  </Icon>
);

export const CopyIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="8.5" y="8.5" width="11" height="11" rx="2" />
    <path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" />
  </Icon>
);

export const CheckIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
);

export const ArrowLeftIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Icon>
);

export const ArrowRightIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);

/** Marks a link that leaves the site. */
export const ExternalIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M14 5h5v5M19 5l-8 8M11 6.5H6.5A1.5 1.5 0 0 0 5 8v9.5A1.5 1.5 0 0 0 6.5 19H16a1.5 1.5 0 0 0 1.5-1.5V13" />
  </Icon>
);

export const CubeIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
    <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
  </Icon>
);

export const PlayIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M8 5.5v13l10.5-6.5L8 5.5Z" />
  </Icon>
);

export const PauseIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M8 5.5v13M16 5.5v13" />
  </Icon>
);

export const RestartIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5" />
    <path d="M4.5 4.5v4h4" />
  </Icon>
);

// Brand marks, filled.
export const GitHubIcon = (props: IconProps) => (
  <Icon fill="currentColor" stroke="none" {...props}>
    <path d="M12 2.2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2.2Z" />
  </Icon>
);

export const LinkedInIcon = (props: IconProps) => (
  <Icon fill="currentColor" stroke="none" {...props}>
    <path d="M5.4 3.5a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8ZM3.8 9h3.2v11.5H3.8V9Zm5.4 0h3.07v1.57h.04c.43-.81 1.47-1.67 3.03-1.67 3.24 0 3.84 2.13 3.84 4.9v6.7h-3.2v-5.94c0-1.42-.03-3.24-1.97-3.24-1.98 0-2.28 1.54-2.28 3.14v6.04H9.2V9Z" />
  </Icon>
);

export const InstagramIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="3.8" />
    <circle cx="17" cy="7" r="0.6" fill="currentColor" />
  </Icon>
);
