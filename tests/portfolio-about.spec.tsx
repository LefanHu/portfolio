import React from "react";
import { render, screen } from "@testing-library/react";
import About, { AboutSummary, TechnicalSkills } from "@/components/portfolio/PortfolioAbout";
import { about, skillGroups } from "@/lib/portfolio/about";

// Markup of the About card as it was before it was split. The data is shared, so this
// pins the structure and classes without going stale when the copy changes.
function LegacyAbout() {
  return (
    <section aria-labelledby="about-heading" className="rounded-2xl border border-white/10 bg-slate-900/90 p-6 sm:p-8">
      <h2 id="about-heading" className="text-3xl font-bold text-white">About Me</h2>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
        I&apos;m {about.name}, {about.blurb}
      </p>
      <p className="mt-3 text-sky-200">{about.coop}</p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-xl font-bold text-white">Education</h3>
          <p className="mt-2 text-slate-200">{about.education.school}</p>
          <p className="text-slate-300">{about.education.degree}</p>
          <p className="mt-2 text-sm text-sky-200">{about.education.period}</p>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Research</h3>
          <p className="mt-2 text-slate-200">{about.research.title} · {about.research.period}</p>
          <p className="mt-2 leading-7 text-slate-300">{about.research.description}</p>
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

describe("AboutSummary", () => {
  it("renders the intro, education and research without the skills", () => {
    render(<AboutSummary />);
    expect(screen.getByRole("heading", { name: "About Me" })).toBeTruthy();
    expect(screen.getByText("University of Waterloo")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Education" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Research" })).toBeTruthy();
    expect(screen.queryByText("SystemVerilog")).toBeNull();
    expect(screen.queryByRole("heading", { name: "Technical Skills" })).toBeNull();
  });

  it("is its own card section", () => {
    const { container } = render(<AboutSummary />);
    const section = container.querySelector("section");
    expect(section?.className).toContain("rounded-2xl border border-white/10 bg-slate-900/90 p-6 sm:p-8");
  });
});

describe("TechnicalSkills", () => {
  it("renders the skills heading and grid without the intro", () => {
    render(<TechnicalSkills />);
    expect(screen.getByRole("heading", { name: "Technical Skills" })).toBeTruthy();
    expect(screen.getByText("SystemVerilog")).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "About Me" })).toBeNull();
  });

  it("is its own card section", () => {
    const { container } = render(<TechnicalSkills />);
    const section = container.querySelector("section");
    expect(section?.className).toContain("rounded-2xl border border-white/10 bg-slate-900/90 p-6 sm:p-8");
  });
});

describe("About", () => {
  it("renders the summary and the skills together", () => {
    render(<About />);
    expect(screen.getByRole("heading", { name: "About Me" })).toBeTruthy();
    expect(screen.getByText("University of Waterloo")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Technical Skills" })).toBeTruthy();
    expect(screen.getByText("SystemVerilog")).toBeTruthy();
  });

  it("keeps the markup it had before the split", () => {
    expect(render(<About />).container.innerHTML).toBe(render(<LegacyAbout />).container.innerHTML);
  });
});
