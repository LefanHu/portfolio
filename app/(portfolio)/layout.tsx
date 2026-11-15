import SiteFooter from "@/components/site/SiteFooter";
import PageTransition from "@/components/site/PageTransition";
import SiteHeader from "@/components/site/SiteHeader";
import SkipLink from "@/components/site/SkipLink";

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter />
    </div>
  );
}
