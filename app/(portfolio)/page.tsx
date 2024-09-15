import ContactForm from "@/components/ContactForm";
import Highlights from "@/components/highlights";
import HoverTiltCard from "@/components/hoverTiltCard";
import ParticlesBackground from "@/components/particlesbackground";
import Experiences from "@/components/portfolio/PortfolioExperiences";
import Interests from "@/components/portfolio/PortfolioInterests";
import FavProjects from "@/components/portfolio/PortfolioProjects";
import SlidingCards from "@/components/SlidingCards";

export default function Home() {
  return (
    <div className="my-12 flex-1 overflow-auto no-scrollbar">
      {/* <main className="h-lvh"> */}
      <div className="flex items-center justify-center">
        <div className="w-full">
          <h1 className="pt-24 text-center text-6xl font-bold md:text-7xl flex items-center justify-center bg-gradient-to-l from-purple-500 via-violet-800 to-pink-400 bg-clip-text text-transparent">
            Lefan&apos;s Portfolio
          </h1>
          {/* <Highlights></Highlights> */}
        </div>
      </div>
      <FavProjects />
      <Interests />
      <Experiences />
      <ParticlesBackground />
      <ContactForm />
    </div>
  );
}
