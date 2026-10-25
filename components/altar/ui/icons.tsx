// Small inline icons for the altar UI. Decorative: always aria-hidden.

const base = {
  width: "1em",
  height: "1em",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

export const CheckIcon = () => (
  <svg {...base} strokeWidth={2.6}>
    <path d="M5 12.5l4.2 4.2L19 7" />
  </svg>
);

export const BookIcon = () => (
  <svg {...base}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
    <path d="M4 20.5A2.5 2.5 0 0 0 6.5 21H20v-3" />
    <path d="M9 7.5h7M9 11h5" />
  </svg>
);

export const HomeIcon = () => (
  <svg {...base}>
    <path d="M4 11.5L12 4l8 7.5" />
    <path d="M6 10v10h12V10M10 20v-5h4v5" />
  </svg>
);

export const SunIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" />
  </svg>
);

export const MoonIcon = () => (
  <svg {...base}>
    <path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a6.8 6.8 0 0 0 10.7 10.7z" />
  </svg>
);

export const ArrowLeftIcon = () => (
  <svg {...base}>
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </svg>
);

export const CloseIcon = () => (
  <svg {...base}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const ChevronIcon = () => (
  <svg {...base}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export const SparkIcon = () => (
  <svg {...base} fill="currentColor" stroke="none">
    <path d="M12 2.5l1.9 6.1 6.1 1.9-6.1 1.9-1.9 6.1-1.9-6.1-6.1-1.9 6.1-1.9z" />
  </svg>
);
