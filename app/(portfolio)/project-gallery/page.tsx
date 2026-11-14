import type { Metadata } from "next";
import ProjectCard from "@/components/projects/ProjectCard";
import { CONTAINER } from "@/components/ui/layout";
import { allProjects, extraWriteups, projectCardId } from "@/lib/portfolioProjects";

const DESCRIPTION = "Projects in hardware acceleration, AI, and systems engineering.";

export const metadata: Metadata = {
  title: "Projects",
  description: DESCRIPTION,
  alternates: { canonical: "/project-gallery" },
  // A page's openGraph replaces the root layout's, so the site name is repeated here.
  openGraph: {
    type: "website",
    siteName: "Lefan Hu",
    title: "Projects",
    description: DESCRIPTION,
    url: "/project-gallery",
  },
};

export default function ProjectGallery() {
  // The lead card has no photograph, so the first cover that is a file is the one to load eagerly.
  const firstPicture = allProjects.findIndex((project) => "imgSrc" in project);

  return (
    <div className={`${CONTAINER} pb-12 pt-10 sm:pb-16 sm:pt-16`}>
      <header className="max-w-2xl">
        <h1 className="rise text-title font-bold tracking-tight">Projects</h1>
        <p className="rise mt-4 text-lead text-mute" style={{ "--i": 1 } as React.CSSProperties}>
          {DESCRIPTION} Some have a write-up here; the others open where they live.
        </p>
      </header>
      {/* Eight cards: the lead card is two columns wide at lg, so the rows of three
          come out even; at two columns it is a normal card and the rows are even too. */}
      <ul className="mt-8 grid gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
        {allProjects.map((project, index) => (
          <li key={project.slug} className={index === 0 ? "lg:col-span-2" : ""}>
            <ProjectCard
              project={project}
              id={projectCardId(project.slug)}
              featured={index === 0}
              eager={index === firstPicture}
            />
          </li>
        ))}
        {extraWriteups.map((writeup) => (
          <li key={writeup.slug}>
            <ProjectCard project={writeup} />
          </li>
        ))}
      </ul>
    </div>
  );
}
