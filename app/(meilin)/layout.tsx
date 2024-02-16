import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Link from "next/link";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lefan's Website",
  description: "Portfolio website showcasing various projects & algorithms",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clipPathStyle: React.CSSProperties = {
    clipPath:
      "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="bg-white h-screen overflow-clip">
          <header className="absolute inset-x-0 top-0 z-50">
            <nav
              className="flex items-center justify-between p-6 lg:px-8"
              aria-label="Global"
            >
              <div className="flex lg:flex-1"></div>
              <div className="hidden md:flex md:gap-x-10 lg:flex lg:gap-x-12">
                <Link
                  href="/silly-goose/happy-birthday"
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  Happy Birthday
                </Link>
                <Link
                  href="/silly-goose/wat"
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  Wat is this?
                </Link>
                <Link
                  href="/silly-goose/image-gallery"
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  Image Gallery
                </Link>
                <Link
                  href="/silly-goose/swift-generator"
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  Swift Generator
                </Link>
                <Link
                  href="/silly-goose/simp"
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  How did I make this?
                </Link>
              </div>
              <div className="hidden lg:flex lg:flex-1 lg:justify-end"></div>
            </nav>
          </header>
          <div className="relative isolate px-6 pt-14 lg:px-8">
            <div
              className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
              aria-hidden="true"
            >
              <div
                className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                style={clipPathStyle}
              ></div>
            </div>
            <div className="flex flex-col h-screen box-border">{children}</div>
            <div
              className="absolute -z-10 inset-x-0 top-[calc(100%-13rem)] transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
              aria-hidden="true"
            >
              <div
                className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
                style={clipPathStyle}
              ></div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
