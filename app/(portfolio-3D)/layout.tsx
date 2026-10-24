import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lefan's Website",
  description: "Portfolio website showcasing various projects & algorithms",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
