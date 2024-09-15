import ContactForm from "@/components/ContactForm";
import ParticlesBackground from "@/components/particlesbackground";
import Experiences from "@/components/portfolio/PortfolioExperiences";
import Interests from "@/components/portfolio/PortfolioInterests";
import FavProjects from "@/components/portfolio/PortfolioProjects";

export default function Home() {
  return (
    <div className="flex-1 overflow-auto no-scrollbar">
      <div className="flex items-center justify-center my-5">
        <div className="w-full">
          <h1 className="pt-24 text-center text-6xl font-bold md:text-7xl flex items-center justify-center bg-gradient-to-l from-purple-500 via-violet-800 to-pink-400 bg-clip-text text-transparent">
            Lefan&apos;s Portfolio
          </h1>
          {/* <Highlights></Highlights> */}
        </div>
      </div>
      <Experiences />
      <FavProjects />
      <Interests />
      <ParticlesBackground />
      <ContactForm />
    </div>
  );
}
