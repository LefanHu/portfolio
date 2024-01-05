import Highlights from "./components/highlights";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 via-cyan-400 to-pink-400">
      <h2 className="text-center text-6xl font-bold md:text-7xl flex items-center justify-center bg-gradient-to-l from-purple-500 via-violet-800 to-pink-400 bg-clip-text text-transparent">
        Lefan's Portfolio
      </h2>

      <Highlights></Highlights>
    </div>
  )
}