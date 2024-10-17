import ContactForm from "@/components/ContactForm";
import ParticlesBackground from "@/components/particlesbackground";
import LeetcodeStats from "@/components/portfolio/LeetcodeStats";
import Experiences from "@/components/portfolio/PortfolioExperiences";
import Interests from "@/components/portfolio/PortfolioInterests";
import FavProjects from "@/components/portfolio/PortfolioProjects";

export default function Home() {
  return (
    <div className="flex-1 overflow-auto no-scrollbar">
      <div className="mx-auto grid max-w-4xl grid-cols-1 items-center py-12 gap-y-24 sm:py-16 lg:max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center">
          <h1 className="rounded-2xl p-4 text-6xl font-extrabold md:text-7xl text-white">
            Lefan&apos;s Portfolio
          </h1>
        </div>
        <LeetcodeStats />
        <FavProjects />
        <Experiences />
        <Interests />
        <ParticlesBackground />
        <ContactForm />
      </div>
    </div>
  );
}
