import Image from "next/image";
import Link from "next/link";
import { about } from "@/lib/portfolio/about";
import { contact } from "@/lib/portfolio/contact";
import ButtonLink from "@/components/ui/ButtonLink";
import { CubeIcon, GitHubIcon, LinkedInIcon, MailIcon } from "@/components/ui/icons";

const ISLAND = { width: 1420, height: 1060 };
const ISLAND_SIZES = "(min-width: 1024px) 620px, 94vw";

// The blurb is written to follow "I'm Lefan Hu, "; on its own it starts a sentence.
const lead = about.blurb.charAt(0).toUpperCase() + about.blurb.slice(1);

/**
 * Who this is, what he does, how to reach him, and a window onto the 3D altar.
 * The island is the altar itself, pictured in both of its themes: the two
 * images are stacked and cross-fade when the theme changes.
 */
export default function Hero() {
  return (
    <section aria-labelledby="hero-title" className="grid items-center gap-x-10 gap-y-8 pt-10 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div>
        <h1 id="hero-title" className="rise text-display font-extrabold tracking-tight">
          {about.name}
        </h1>
        <p className="rise mt-6 max-w-xl text-lead text-body" style={{ "--i": 1 } as React.CSSProperties}>
          {lead}
        </p>
        <p
          className="rise mt-5 inline-flex items-center gap-2.5 rounded-chip border border-line-strong bg-rune-wash px-3 py-1.5 text-sm font-medium text-ink"
          style={{ "--i": 2 } as React.CSSProperties}
        >
          <span aria-hidden="true" className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-ok opacity-60" />
            <span className="relative h-2 w-2 rounded-full bg-ok" />
          </span>
          {about.coop}
        </p>
        <div className="rise mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap" style={{ "--i": 3 } as React.CSSProperties}>
          <ButtonLink href={`mailto:${contact.email}`} variant="primary" icon={<MailIcon />} className="col-span-2">
            Email me
          </ButtonLink>
          <ButtonLink href={contact.github} icon={<GitHubIcon />}>
            GitHub
          </ButtonLink>
          <ButtonLink href={contact.linkedin} icon={<LinkedInIcon />}>
            LinkedIn
          </ButtonLink>
        </div>
        <dl
          className="rise mt-10 grid max-w-xl gap-x-8 gap-y-5 border-t border-line pt-6 text-sm sm:grid-cols-2"
          style={{ "--i": 4 } as React.CSSProperties}
        >
          <div>
            <dt className="font-bold text-ink">Education</dt>
            <dd className="mt-1 text-body">
              {about.education.degree}, {about.education.school}
            </dd>
            <dd className="mt-1 text-mute">
              {about.education.period}. {about.education.graduation}.
            </dd>
          </div>
          <div>
            <dt className="font-bold text-ink">Research</dt>
            <dd className="mt-1 text-body">{about.research.description}</dd>
            <dd className="mt-1 text-mute">
              {about.research.title}, {about.research.period}
            </dd>
          </div>
        </dl>
      </div>

      <Link
        href="/altar"
        className="rise group relative block no-underline xl:-mr-10"
        style={{ "--i": 2 } as React.CSSProperties}
      >
        <span className="island-mask relative block motion-safe:animate-float">
          <Image
            src="/images/altar/island-day.webp"
            alt=""
            width={ISLAND.width}
            height={ISLAND.height}
            sizes={ISLAND_SIZES}
            loading="eager"
            className="h-auto w-full transition-opacity duration-500 dark:opacity-0"
          />
          <Image
            src="/images/altar/island-night.webp"
            alt="A low-poly floating island with a glowing cauldron, a workbench and relics: this portfolio as a 3D scene"
            width={ISLAND.width}
            height={ISLAND.height}
            sizes={ISLAND_SIZES}
            loading="eager"
            className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-500 dark:opacity-100"
          />
        </span>
        <span className="absolute inset-x-0 bottom-0 flex justify-center">
          <span className="inline-flex min-h-11 items-center gap-2 rounded-control border border-line-strong bg-pane px-4 py-2 text-sm font-bold text-ink shadow-card group-hover:border-rune group-hover:text-rune">
            <CubeIcon />
            Explore this portfolio in 3D
          </span>
        </span>
      </Link>
    </section>
  );
}
