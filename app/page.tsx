import Highlights from "./components/highlights";
import Navbar from "./components/navbar";
import ParticlesBackground from "./components/particlesbackground";

export default function Home() {
  return (
    // <div className="min-h-screen bg-gradient-to-r from-purple-500 via-cyan-400 to-pink-400">
    <div id="particles">
      <Navbar/>
      <h2 className="pt-10 text-center text-6xl font-bold md:text-7xl flex items-center justify-center bg-gradient-to-l from-purple-500 via-violet-800 to-pink-400 bg-clip-text text-transparent">
        Lefan's Portfolio
      </h2>
      <ParticlesBackground/>

      <Highlights></Highlights>
    </div>
  )
}