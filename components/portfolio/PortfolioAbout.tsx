const skillGroups = [
  { title: "Programming", skills: ["C", "C++", "Kotlin", "Go", "Rust", "SystemVerilog", "Python", "Java", "TypeScript", "Terraform", "Bash", "Arduino", "HAL"] },
  { title: "Cloud and Systems", skills: ["Git", "CI/CD", "AWS", "GCP", "Docker", "Linux", "Operating Systems", "Bazel", "Computer Networks", "Networking", "SQL"] },
  { title: "AI, Hardware, and Web", skills: ["PyTorch", "RLlib", "Computer Vision", "React", "AI", "Graph Neural Networks", "LLM Accelerators", "Vivado", "FPGA"] },
];

export default function About() {
  return (
    <section aria-labelledby="about-heading" className="rounded-2xl border border-white/10 bg-slate-900/90 p-6 sm:p-8">
      <h2 id="about-heading" className="text-3xl font-bold text-white">About Me</h2>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
        I&apos;m Lefan Hu, a Computer Engineering student at the University of Waterloo.
        My work spans AI automation, robotics, cloud infrastructure, and FPGA acceleration.
      </p>
      <p className="mt-3 text-sky-200">Interested in 4- or 8-month co-op opportunities.</p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-xl font-bold text-white">Education</h3>
          <p className="mt-2 text-slate-200">University of Waterloo</p>
          <p className="text-slate-300">Bachelor of Applied Science in Computer Engineering</p>
          <p className="mt-2 text-sm text-sky-200">Sept. 2022 - Present · Expected graduation: April 2028</p>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Research</h3>
          <p className="mt-2 text-slate-200">Research Assistant · 2024 - 2025</p>
          <p className="mt-2 leading-7 text-slate-300">Vehicle Linux OS security testing through power analysis in C++.</p>
        </div>
      </div>
      <h3 className="mt-8 text-xl font-bold text-white">Technical Skills</h3>
      <div className="mt-4 grid gap-6 lg:grid-cols-3">
        {skillGroups.map((group) => (
          <div key={group.title}>
            <h4 className="font-semibold text-sky-200">{group.title}</h4>
            <ul className="mt-3 flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <li key={skill} className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-sm text-slate-200">{skill}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
