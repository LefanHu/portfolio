import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import Experiences from "@/components/portfolio/PortfolioExperiences";
import HomeDeferredSections from "@/components/portfolio/HomeDeferredSections";
import About from "@/components/portfolio/PortfolioAbout";
import FavProjects from "@/components/portfolio/PortfolioProjects";

export default function Home() {
  return (
    <div className="flex-1 overflow-auto no-scrollbar">
      <div className="mx-auto grid max-w-4xl grid-cols-1 items-center py-12 gap-y-24 sm:py-16 lg:max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-2">
          <h1 className="rounded-2xl p-4 text-6xl font-extrabold md:text-7xl text-white">
            Lefan&apos;s Portfolio
          </h1>
          <Link href="/altar" className="text-sm text-sky-300 hover:text-sky-200">
            Try the 3D version →
          </Link>
        </div>
        {/* <About /> */}
        <FavProjects />
        <Experiences />
        <HomeDeferredSections />
        <ContactForm />
      </div>
    </div>
  );
}
