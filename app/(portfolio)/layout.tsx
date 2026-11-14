import SiteFooter from "@/components/site/SiteFooter";
import PageTransition from "@/components/site/PageTransition";
import SiteHeader from "@/components/site/SiteHeader";

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-control focus:bg-rune focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-rune-ink"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter />
    </div>
  );
}
