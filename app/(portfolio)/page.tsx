import Highlights from "@/components/highlights";
import HoverTiltCard from "@/components/hoverTiltCard";
import ParticlesBackground from "@/components/particlesbackground";
import Interests from "@/components/portfolio/PortfolioInterests";

export default function Home() {
  return (
    <div className="flex-1 overflow-auto">
      <Interests />
      {/* <main className="h-lvh"> */}
      <div className="h-full flex items-center justify-center">
        <div className="w-full">
          <h2 className="pt-10 text-center text-6xl font-bold md:text-7xl flex items-center justify-center bg-gradient-to-l from-purple-500 via-violet-800 to-pink-400 bg-clip-text text-transparent">
            Lefan&apos;s Portfolio
          </h2>
          {/* <Highlights></Highlights> */}
        </div>
      </div>
      <ParticlesBackground />
      {/* </main> */}
    </div>
  );
}
