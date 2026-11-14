import type { Metadata, Viewport } from "next";
import { Alegreya, Alegreya_Sans } from "next/font/google";
import { DEFAULT_THEME, THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

// Display and text faces, self-hosted by next/font. Both are the same designer's
// humanist family: a bookish serif for titles (it echoes the altar's recipe
// board) and its sans companion for everything else.
const heading = Alegreya({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const body = Alegreya_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lefan.ca"),
  title: {
    default: "Lefan Hu | Portfolio",
    template: "%s | Lefan Hu",
  },
  description:
    "Lefan Hu, University of Waterloo Computer Engineering student. Explore projects and experience in AI, robotics, cloud infrastructure, and FPGA acceleration.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Lefan Hu",
    title: "Lefan Hu | Portfolio",
    description:
      "Projects and experience in AI automation, robotics, cloud infrastructure, and FPGA acceleration.",
    images: [{ url: "/images/altar/island-night.webp", width: 1420, height: 1060, alt: "A low-poly floating island with a glowing cauldron: the 3D version of this portfolio" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#081230" },
    { media: "(prefers-color-scheme: light)", color: "#e8f0f8" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The inline script sets data-theme before first paint, and the altar sets
    // its own attributes on a framed copy of the site: hence suppressHydrationWarning.
    <html
      lang="en"
      data-theme={DEFAULT_THEME}
      className={`${heading.variable} ${body.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
