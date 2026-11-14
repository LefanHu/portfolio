"use client";

import Image from "next/image";
import { useState, ViewTransition } from "react";
import ButtonLink from "@/components/ui/ButtonLink";
import { TagList } from "@/components/ui/Tag";
import {
  LOGO_BACKING,
  LOGO_COVERS,
  isExternalHref,
  projectLinkLabel,
  projectTitleTransition,
  type PortfolioProject,
} from "@/lib/portfolioProjects";

/*
 * Every card is a cover image under a dark scrim, so the cards stay dark with
 * light text in both themes: a parchment card with a photo washed out behind
 * its text would not read. That is why this file uses fixed colours (night
 * navy, white) instead of theme tokens for the stage, the scrims and the text
 * that sits on them. Chips and buttons are opaque token surfaces as usual.
 */
const STAGE = LOGO_BACKING;
const CAPTION_SCRIM = "bg-linear-to-t from-[#070d1f] via-[#070d1f]/90 via-75% to-transparent";
const CLOSED_SCRIM = "bg-linear-to-t from-[#070d1f]/90 via-[#070d1f]/65 to-[#070d1f]/35";

// Below lg a card is 82% (phones) or 46% (tablets) of the row. From lg the open
// card grows 6 to the collapsed cards' 1 (the `grow-[6]` and the caption width
// below both encode that 6), which is at most ~560px in the page container.
const COVER_SIZES = "(min-width: 1024px) 560px, (min-width: 640px) 46vw, 82vw";

// A cover card is a teaser: it names the first few technologies and counts the
// rest, which the project's page and the gallery list in full.
const MAX_TAGS = 5;

function teaserTags(technologies: readonly string[]): string[] {
  if (technologies.length <= MAX_TAGS + 1) return [...technologies];
  return [...technologies.slice(0, MAX_TAGS), `+${technologies.length - MAX_TAGS} more`];
}

/**
 * The projects after the featured one, as one list with two layouts.
 *
 * From lg it is an accordion: one card is open (the first, on load) and takes
 * most of the row; the others are spines carrying the project's name. A card
 * opens on hover, on keyboard focus inside it, and on click or tap.
 *
 * Below lg there is no accordion: every card is shown in full in a native
 * scroll-snapping row, with the next card peeking in to show there is more.
 *
 * Both layouts share one DOM so each project name exists once on the page
 * (it is the shared element of the route transition to the project's page).
 * Collapsed cards only hide their caption visually: it stays in the
 * accessibility tree and in the tab order, and focusing its link opens the card.
 */
export default function ProjectShowcase({ projects }: { projects: readonly PortfolioProject[] }) {
  const [active, setActive] = useState(0);

  return (
    <ul
      aria-label="More projects"
      // The caption's width at lg is derived from the row's width and the number of cards.
      style={{ "--cards": projects.length } as React.CSSProperties}
      // The negative margins let the scrolling row run to the screen edges;
      // they mirror the page gutter in components/ui/layout.ts (px-5 / sm:px-8).
      className="@container -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-3 [scrollbar-width:thin] sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:mx-0 lg:snap-none lg:overflow-visible lg:px-0 lg:pb-0"
    >
      {projects.map((project, index) => {
        const open = index === active;
        const logo = LOGO_COVERS.has(project.imgSrc);
        const meta = [project.period, project.location].filter(Boolean).join(" · ");

        return (
          <li
            key={project.slug}
            data-open={open ? "" : undefined}
            // A touch has no hover: the tap's click opens the card, and only a
            // second tap can reach the link (see pointer-events on the caption).
            // overflow-clip, not hidden: focusing a link in a collapsed card
            // must not scroll the card's content sideways to reveal it.
            onPointerEnter={(event) => {
              if (event.pointerType !== "touch") setActive(index);
            }}
            onFocus={() => setActive(index)}
            onClick={() => setActive(index)}
            className={`group/card relative flex min-h-[27rem] shrink-0 basis-[82%] snap-start flex-col overflow-clip rounded-card border border-line ${STAGE} sm:basis-[46%] lg:min-h-[26rem] lg:min-w-0 lg:shrink lg:basis-0 lg:grow lg:cursor-pointer lg:shadow-card lg:transition-[flex-grow,border-color] lg:duration-[450ms] lg:ease-swift lg:data-open:grow-[6] lg:data-open:cursor-auto lg:data-open:border-line-strong`}
          >
            {logo ? (
              <div className="relative mx-6 mt-6 min-h-28 flex-1 lg:mx-3">
                <Image src={project.imgSrc} alt="" fill sizes={COVER_SIZES} className="object-contain" />
              </div>
            ) : (
              <>
                <Image
                  src={project.imgSrc}
                  alt=""
                  fill
                  sizes={COVER_SIZES}
                  className="object-cover lg:transition-transform lg:duration-[450ms] lg:ease-swift lg:group-data-open/card:scale-[1.04]"
                />
                {/* Keeps part of the picture clear of the caption however long the caption is. */}
                <div className="min-h-28 flex-1" />
              </>
            )}

            <div
              // Fixed width at lg (the open card's width), so the text does not
              // re-wrap while the card grows; the card clips what does not fit yet.
              className={`relative flex flex-col items-start px-4 pb-4 sm:px-5 sm:pb-5 ${
                logo ? "pt-4" : `pt-14 ${CAPTION_SCRIM}`
              } lg:w-[calc((100cqw-(var(--cards)-1)*0.75rem)*6/(var(--cards)+5)-2px)] lg:pointer-events-none lg:translate-y-2 lg:opacity-0 lg:transition-[opacity,transform] lg:duration-200 lg:ease-swift lg:group-data-open/card:pointer-events-auto lg:group-data-open/card:translate-y-0 lg:group-data-open/card:opacity-100 lg:motion-safe:group-data-open/card:delay-150 lg:group-data-open/card:duration-300`}
            >
              <ViewTransition name={projectTitleTransition(project.slug)}>
                <h3 className="text-heading font-bold text-white">{project.name}</h3>
              </ViewTransition>
              {meta ? <p className="mt-1 text-xs text-white/75">{meta}</p> : null}
              <p className="mt-2 text-sm text-white/85">{project.description}</p>
              {project.technologies?.length ? (
                <div className="mt-3">
                  <TagList label={`${project.name} technologies`} tags={teaserTags(project.technologies)} />
                </div>
              ) : null}
              <ButtonLink href={project.href} className="mt-4 focus-visible:outline-white">
                {projectLinkLabel(project.href)}
                <span className="sr-only">: {project.name}</span>
              </ButtonLink>
            </div>

            {/* The spine of a collapsed card (lg only). The name is repeated for the eye; the heading above is the real one. */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 hidden items-end justify-center pb-5 ${CLOSED_SCRIM} transition-opacity duration-300 ease-swift lg:flex lg:group-data-open/card:opacity-0`}
            >
              <span className="rotate-180 whitespace-nowrap font-display text-base font-bold text-white [writing-mode:vertical-rl]">
                {project.name}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
