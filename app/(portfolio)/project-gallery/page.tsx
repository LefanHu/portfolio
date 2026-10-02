import Link from "next/link";
import { acceleratorProject, projects } from "@/lib/portfolioProjects";

export default function Projects() {
  return (
    <div className="flex-1 overflow-auto no-scrollbar">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-white">Project Gallery</h1>
        <p className="mt-4 text-slate-300">Projects in hardware acceleration, AI, and systems engineering.</p>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[acceleratorProject, ...projects].map((project) => (
            <Link key={project.name} href={project.href} className="rounded-2xl border border-white/10 bg-slate-900 p-6 transition-colors hover:border-sky-300/50">
              <h2 className="text-2xl font-bold text-white">{project.name}</h2>
              <p className="mt-4 leading-7 text-slate-300">{project.description}</p>
              <span className="mt-6 inline-block font-semibold text-sky-300">View project →</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
