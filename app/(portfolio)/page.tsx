import ContactForm from "@/components/ContactForm";
import ParticlesBackground from "@/components/particlesbackground";
import LeetcodeStats from "@/components/portfolio/LeetcodeStats";
import Experiences from "@/components/portfolio/PortfolioExperiences";
import Interests from "@/components/portfolio/PortfolioInterests";
import FavProjects from "@/components/portfolio/PortfolioProjects";

export default function Home() {
  return (
    <div className="flex-1 overflow-auto no-scrollbar">
      {/* <div className="flex items-center justify-center my-5">
        <h1 className="border-2 rounded-2xl p-4 text-6xl font-extrabold md:text-7xl bg-gradient-to-r from-rose-600 via-fuchsia-600 to-blue-700 bg-clip-text text-transparent">
          Lefan&apos;s Portfolio
        </h1>
      </div> */}
      <div className="mx-auto grid max-w-4xl grid-cols-1 items-center py-12 gap-y-24 sm:py-16 lg:max-w-7xl px-4 sm:px-6 lg:px-8">
        <Experiences />
        <FavProjects />
        <LeetcodeStats />
        <Interests />
        <ParticlesBackground />
        <ContactForm />
      </div>
    </div>
  );
}
