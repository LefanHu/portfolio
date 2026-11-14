import Link from "next/link";
import { ViewTransition } from "react";
import { Brackets, PANEL } from "@/components/ui/Panel";
import SectionHeading from "@/components/ui/SectionHeading";
import Tag, { TagList } from "@/components/ui/Tag";
import { ArrowRightIcon } from "@/components/ui/icons";
import {
  SITE_ANCHORS,
  acceleratorProject,
  projectTitleTransition,
  projects,
  type PortfolioProject,
} from "@/lib/portfolioProjects";
import ProjectShowcase from "./ProjectShowcase";

// The featured project has no cover image; everything else it shows is optional data.
const featured: Omit<PortfolioProject, "imgSrc"> = acceleratorProject;

/** The featured project as one emphasised card, then the rest in the showcase. */
export default function PortfolioProjects() {
  const meta = [featured.period, featured.location].filter(Boolean).join(" · ");

  return (
    <section id={SITE_ANCHORS.projects} aria-labelledby="projects-title">
      <SectionHeading
        section="projects"
        title="Projects"
        id="projects-title"
        action={
          <Link href="/project-gallery" className="link inline-flex min-h-11 items-center gap-1.5">
            All projects
            <ArrowRightIcon width="1em" height="1em" />
          </Link>
        }
      >
        Selected work in FPGA acceleration, generative AI and systems engineering, along with a few personal builds.
      </SectionHeading>

      {/* The whole card is the link; its name is the project's name plus the call to action. */}
      <Link
        href={featured.href}
        aria-labelledby="featured-project-name featured-project-action"
        className={`${PANEL} group relative mt-8 grid gap-x-10 gap-y-5 p-5 no-underline hover:-translate-y-0.5 hover:border-rune hover:shadow-lift sm:mt-10 sm:p-8 lg:grid-cols-[minmax(0,1fr)_17rem]`}
      >
        <Brackets />
        <div>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-mute">
            <Tag tone="accent">Featured</Tag>
            {meta}
          </p>
          <ViewTransition name={projectTitleTransition(featured.slug)}>
            <h3 id="featured-project-name" className="mt-3 text-heading font-bold text-ink">
              {featured.name}
            </h3>
          </ViewTransition>
          <p className="mt-3 max-w-2xl text-body">{featured.description}</p>
        </div>
        <div className="flex flex-col items-start justify-between gap-5 lg:border-l lg:border-line lg:pl-10">
          {featured.technologies?.length ? (
            <TagList label={`${featured.name} technologies`} tags={featured.technologies} />
          ) : null}
          <span
            id="featured-project-action"
            className="inline-flex items-center gap-2 text-sm font-bold text-rune group-hover:text-rune-strong"
          >
            Read the write-up
            <ArrowRightIcon className="transition-transform duration-200 ease-swift group-hover:translate-x-1" />
          </span>
        </div>
      </Link>

      <div className="mt-5">
        <ProjectShowcase projects={projects} />
      </div>
    </section>
  );
}
