import type { Metadata } from "next";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "@mantine/core/styles.css";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lefan's Website",
  description:
    "Portfolio website showcasing various projects, experiences, and interests.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
