import Link from "next/link";
import { ViewTransition, type CSSProperties, type ReactNode } from "react";
import ButtonLink, { type ButtonVariant } from "@/components/ui/ButtonLink";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/icons";
import { CONTAINER } from "@/components/ui/layout";
import Panel from "@/components/ui/Panel";
import Tag, { TagList } from "@/components/ui/Tag";
import { projectPage, projectPages, projectTitleTransition, type ProjectEntry } from "@/lib/portfolioProjects";

const GALLERY = "/project-gallery";

export interface ProjectAction {
  href: string;
  label: string;
  icon?: ReactNode;
  variant?: ButtonVariant;
}

const rise = (i: number) => ({ "--i": i }) as CSSProperties;

function GalleryLink({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <Link
      href={GALLERY}
      style={style}
      className={`group inline-flex min-h-11 items-center gap-2 text-sm font-bold text-body no-underline hover:text-rune ${className}`}
    >
      <ArrowLeftIcon className="transition-transform duration-200 ease-swift group-hover:-translate-x-1" />
      All projects
    </Link>
  );
}

function PagerLink({ project, direction }: { project: ProjectEntry; direction: "previous" | "next" }) {
  const next = direction === "next";
  return (
    <Link
      href={project.href}
      rel={next ? "next" : "prev"}
      className={`group flex h-full min-h-11 items-center gap-4 rounded-control border border-line bg-pane px-4 py-3 no-underline hover:border-rune sm:px-5 sm:py-4 ${
        next ? "justify-end text-right" : ""
      }`}
    >
      {next ? null : (
        <ArrowLeftIcon className="shrink-0 text-mute transition-transform duration-200 ease-swift group-hover:-translate-x-1 group-hover:text-rune" />
      )}
      <span className="min-w-0">
        <span className="block text-xs text-mute">{next ? "Next project" : "Previous project"}</span>
        <span className="mt-0.5 block font-display text-lead font-bold text-ink group-hover:text-rune">
          {project.name}
        </span>
      </span>
      {next ? (
        <ArrowRightIcon className="shrink-0 text-mute transition-transform duration-200 ease-swift group-hover:translate-x-1 group-hover:text-rune" />
      ) : null}
    </Link>
  );
}

/**
 * The one layout for a project write-up. Everything that identifies the
 * project (name, dates, place, status, technologies) comes from
 * lib/portfolioProjects.ts; a page supplies its summary, any real links, and
 * its sections as children (see ProjectSection and the content helpers below).
 */
export default function ProjectPage({
  slug,
  summary,
  actions = [],
  children,
}: {
  slug: string;
  /** One short paragraph under the title. */
  summary: ReactNode;
  /** Links that exist for this project (a demo, a repository). The first is the main one. */
  actions?: readonly ProjectAction[];
  children: ReactNode;
}) {
  const project = projectPage(slug);
  const position = projectPages.indexOf(project);
  const previous = projectPages[position - 1];
  const next = projectPages[position + 1];
  const facts = [project.period, project.location].filter(Boolean);

  return (
    <article className={`${CONTAINER} pb-12 pt-6 sm:pb-16 sm:pt-10`}>
      <header>
        <GalleryLink className="rise" />
        {/* The name is the shared element of the route transition from a card, so
            it must be in place on the first frame: it does not take part in the
            entrance, and only the text is named so the morph keeps its proportions. */}
        <h1 className="mt-3 text-title font-bold tracking-tight">
          <ViewTransition name={projectTitleTransition(project.slug)}>
            <span className="inline-block">{project.name}</span>
          </ViewTransition>
        </h1>
        {facts.length > 0 || project.status ? (
          <p className="rise mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-2 text-sm text-mute" style={rise(1)}>
            {facts.map((fact, index) => (
              <span key={fact} className="inline-flex items-center gap-2.5">
                {index > 0 ? <span aria-hidden="true">·</span> : null}
                {fact}
              </span>
            ))}
            {project.status ? <Tag tone="accent">{project.status}</Tag> : null}
          </p>
        ) : null}
        <p className="rise mt-5 max-w-2xl text-lead text-body" style={rise(2)}>
          {summary}
        </p>
        {project.technologies?.length ? (
          <div className="rise mt-6 max-w-3xl" style={rise(3)}>
            <TagList label="Technologies" tags={project.technologies} />
          </div>
        ) : null}
        {actions.length > 0 ? (
          <div className="rise mt-7 flex flex-wrap gap-3" style={rise(4)}>
            {actions.map((action, index) => (
              <ButtonLink
                key={action.href}
                href={action.href}
                icon={action.icon}
                variant={action.variant ?? (index === 0 ? "primary" : "secondary")}
              >
                {action.label}
              </ButtonLink>
            ))}
          </div>
        ) : null}
      </header>

      <div className="mt-10 space-y-5 sm:mt-14 sm:space-y-6">{children}</div>

      <nav aria-label="More projects" className="mt-14 border-t border-line pt-8 sm:mt-20">
        <ul className="grid gap-3 sm:grid-cols-2 sm:gap-5">
          {previous ? (
            <li>
              <PagerLink project={previous} direction="previous" />
            </li>
          ) : null}
          {next ? (
            <li className="sm:col-start-2">
              <PagerLink project={next} direction="next" />
            </li>
          ) : null}
        </ul>
        <GalleryLink className="mt-5" />
      </nav>
    </article>
  );
}

/** A titled part of the write-up: one pane, never a pane inside a pane. */
export function ProjectSection({ title, children }: { title: string; children: ReactNode }) {
  const headingId = `section-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <Panel as="section" aria-labelledby={headingId} className="p-4 sm:p-6 lg:p-8">
      <h2 id={headingId} className="text-heading font-bold">
        {title}
      </h2>
      <div className="mt-4 sm:mt-5">{children}</div>
    </Panel>
  );
}

/** Running text, held to a readable measure. */
export function Prose({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`max-w-prose space-y-4 text-body ${className}`}>{children}</div>;
}

/**
 * A list of points. On wide screens it flows into two columns, which keeps
 * each line to a readable length without leaving half the pane empty.
 */
export function Points({ items }: { items: readonly ReactNode[] }) {
  return (
    <ul className="max-w-prose list-disc pl-5 text-body marker:text-mute lg:max-w-none lg:columns-2 lg:gap-x-14">
      {items.map((item, index) => (
        <li key={index} className="mb-2 break-inside-avoid pl-1 last:mb-0">
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Short titled notes, side by side on wide screens. */
export function Notes({ notes }: { notes: readonly { title: string; body: ReactNode }[] }) {
  return (
    <div className="grid gap-x-14 gap-y-6 lg:grid-cols-2">
      {notes.map((note) => (
        <div key={note.title} className="max-w-prose">
          <h3 className="text-lead font-bold">{note.title}</h3>
          <p className="mt-2 text-body">{note.body}</p>
        </div>
      ))}
    </div>
  );
}
