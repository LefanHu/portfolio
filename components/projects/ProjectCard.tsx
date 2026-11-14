import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { ArrowRightIcon, ExternalIcon } from "@/components/ui/icons";
import Tag from "@/components/ui/Tag";
import {
  LOGO_BACKING,
  LOGO_COVERS,
  isExternalHref,
  projectLinkLabel,
  projectTitleTransition,
  type ProjectEntry,
} from "@/lib/portfolioProjects";
import SystolicTile from "./SystolicTile";
import styles from "./ProjectCard.module.css";

const CHIPS = 3;

// One column on phones, two from sm, three from lg (a third of the 72rem container).
// The lead card's cover is half of a double-width card, which comes to the same size.
const COVER_SIZES = "(min-width: 1024px) 352px, (min-width: 640px) 46vw, 92vw";

/**
 * A project in the gallery. The whole card is one link, and its last line says
 * where that link goes: a write-up on this site, or another site in a new tab.
 */
export default function ProjectCard({
  project,
  id,
  featured = false,
  eager = false,
}: {
  project: ProjectEntry;
  /** Element id, for the projects the altar deep-links to. */
  id?: string;
  /** The lead card: twice as wide on large screens, cover beside the text. */
  featured?: boolean;
  /** Load the cover straight away (the first picture on the page). */
  eager?: boolean;
}) {
  const external = isExternalHref(project.href);
  const titleId = `card-${project.slug}-title`;
  const destinationId = `card-${project.slug}-destination`;
  const descriptionId = `card-${project.slug}-description`;
  const logo = project.imgSrc !== undefined && LOGO_COVERS.has(project.imgSrc);
  // The lead card has the room to say everything; the others keep to the same height.
  const chips = (featured ? project.technologies : project.technologies?.slice(0, CHIPS)) ?? [];

  const content = (
    <>
      <div
        className={`relative aspect-[16/10] shrink-0 overflow-hidden border-b border-line ${
          logo ? LOGO_BACKING : "bg-pane-raise"
        } ${featured ? "lg:aspect-auto lg:w-1/2 lg:border-b-0 lg:border-r" : ""}`}
      >
        {project.imgSrc ? (
          <Image
            src={project.imgSrc}
            alt=""
            fill
            sizes={COVER_SIZES}
            loading={eager ? "eager" : "lazy"}
            className={`transition-transform duration-300 ease-swift group-hover:scale-[1.04] group-focus-visible:scale-[1.04] ${
              logo ? "object-contain p-6" : "object-cover"
            }`}
          />
        ) : (
          <SystolicTile className="absolute inset-0 h-full w-full transition-transform duration-300 ease-swift group-hover:scale-[1.04] group-focus-visible:scale-[1.04]" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h2 id={titleId} className="text-heading font-bold">
          <ViewTransition name={projectTitleTransition(project.slug)}>
            <span className="inline-block">{project.name}</span>
          </ViewTransition>
        </h2>
        <p
          id={descriptionId}
          className={`mt-2 line-clamp-5 text-sm text-body ${featured ? "lg:line-clamp-none lg:text-base" : ""}`}
        >
          {project.description}
        </p>
        {chips.length > 0 ? (
          <ul aria-label="Technologies" className="mt-4 flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <Tag as="li" key={chip}>
                {chip}
              </Tag>
            ))}
          </ul>
        ) : null}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-1 pt-5">
          <p id={destinationId} className="flex items-center gap-1.5 text-sm font-bold text-rune">
            {projectLinkLabel(project.href)}
            {external ? (
              <>
                <ExternalIcon width="1.1em" height="1.1em" />
                <span className="sr-only"> (opens in a new tab)</span>
              </>
            ) : (
              <ArrowRightIcon
                width="1.1em"
                height="1.1em"
                className="transition-transform duration-200 ease-swift group-hover:translate-x-1 group-focus-visible:translate-x-1"
              />
            )}
          </p>
          {project.period ? <p className="text-xs text-mute">{project.period}</p> : null}
        </div>
      </div>
    </>
  );

  const shared = {
    id,
    href: project.href,
    "aria-labelledby": `${titleId} ${destinationId}`,
    "aria-describedby": descriptionId,
    className: `${styles.card} group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-pane no-underline shadow-card hover:-translate-y-0.5 hover:border-rune hover:shadow-lift focus-visible:-translate-y-0.5 focus-visible:border-rune focus-visible:shadow-lift ${
      featured ? "lg:flex-row" : ""
    }`,
  };

  return external ? (
    <a {...shared} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  ) : (
    <Link {...shared}>{content}</Link>
  );
}
