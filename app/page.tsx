import Highlights from "./components/highlights";
import Navbar from "./components/navbar";
import ParticlesBackground from "./components/particlesbackground";

export default function Home() {
  return (
    <main className="h-lvh">
      <Navbar />
      <div className="h-full flex items-center justify-center">
        <div className="w-full">
          <h2 className="pt-10 text-center text-6xl font-bold md:text-7xl flex items-center justify-center bg-gradient-to-l from-purple-500 via-violet-800 to-pink-400 bg-clip-text text-transparent">
            Lefan&apos;s Portfolio
          </h2>
          <Highlights></Highlights>
        </div>
      </div>
      <ParticlesBackground />
    </main>
  )
}