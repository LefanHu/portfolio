import { experienceRoles, type ExperienceRole } from "@/lib/portfolio/experience";
import { SITE_ANCHORS } from "@/lib/portfolioProjects";
import Panel from "@/components/ui/Panel";
import SectionHeading from "@/components/ui/SectionHeading";
import Tag, { TagList } from "@/components/ui/Tag";
import TechnicalSkills from "./TechnicalSkills";
import { isVignetteId, VIGNETTE_CAPTIONS } from "./vignettes/captions";
import MotionToggle from "./vignettes/MotionToggle";
import Vignette from "./vignettes/Vignette";
import figure from "./vignettes/Vignette.module.css";
import styles from "./ExperienceTimeline.module.css";

export { experienceRoles };

const TITLE_ID = "experience-title";

/** "2023 – 2027": the first and last year mentioned in any role's period. */
function yearSpan(roles: ExperienceRole[]) {
  const years = roles.flatMap((role) => role.period.match(/\d{4}/g) ?? []).map(Number);
  return `${Math.min(...years)} – ${Math.max(...years)}`;
}

function Role({ role }: { role: ExperienceRole }) {
  const headingId = `experience-${role.id}`;
  return (
    <li className={styles.role}>
      {/* A piece of the trunk: the track and the part of it the reader has scrolled past. */}
      <span aria-hidden="true" className={styles.rail}>
        <span className={styles.railFill} />
      </span>
      <span aria-hidden="true" className={styles.mark}>
        <span className={styles.twig}>
          <span className={styles.twigFill} />
        </span>
        <span className={styles.dot} />
      </span>
      <article aria-labelledby={headingId} className={styles.entry}>
        {/* Above the card in one column; across the trunk from it in two. */}
        <p className={`${styles.when} text-sm text-mute`}>
          <span className="whitespace-nowrap font-medium text-body">{role.period}</span>
          <span aria-hidden="true" className="lg:hidden">
            {" · "}
          </span>
          <span className="sr-only">, </span>
          <span className="whitespace-nowrap lg:mt-0.5 lg:block">{role.location}</span>
        </p>
        <Panel className="p-4 sm:p-6">
          <div className={role.highlights.length > 0 ? figure.card : `${figure.card} ${figure.compact}`}>
            <div className={figure.head}>
              {/* The status sits beside the heading, not in it, so the card is still named by the employer alone. */}
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <h3 id={headingId} className="font-display text-lead font-bold leading-tight text-ink">
                  {role.title}
                </h3>
                {role.upcoming ? <Tag tone="accent">Upcoming</Tag> : null}
              </div>
              <p className="mt-1 text-sm font-medium text-body">{role.subtitle}</p>
              {role.theme ? (
                <p className="mt-0.5 text-sm text-sig-experience">
                  <span className="sr-only">Theme: </span>
                  <span>{role.theme}</span>
                </p>
              ) : null}
              <div className="mt-3">
                <TagList label={`Focus areas at ${role.title}`} tags={role.tags} />
              </div>
            </div>
            {isVignetteId(role.id) ? <Vignette id={role.id} caption={VIGNETTE_CAPTIONS[role.id]} /> : null}
            {role.highlights.length > 0 ? (
              <ul
                className={`${figure.body} max-w-prose list-disc space-y-1.5 pl-4 text-sm text-body marker:text-sig-experience sm:mt-4 sm:space-y-2 sm:pl-5`}
              >
                {role.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </Panel>
      </article>
    </li>
  );
}

/**
 * Work experience as a timeline: one trunk down the section with a node for
 * each role, dates on one side and the role's card on the other. Roles render
 * in the order of the data, newest first.
 */
export default function Experiences() {
  return (
    <section id={SITE_ANCHORS.experience} aria-labelledby={TITLE_ID}>
      <SectionHeading section="experience" title="Experience" id={TITLE_ID}>
        Internships where I shipped production systems, newest first, starting with the two co-op terms coming up
        next.
      </SectionHeading>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="text-sm text-mute">
          {experienceRoles.length} roles <span aria-hidden="true">·</span> {yearSpan(experienceRoles)}
        </p>
        <MotionToggle className="-mx-2" />
      </div>

      <ol role="list" aria-label="Roles, newest first" className={`${styles.timeline} mt-6 sm:mt-10`}>
        {experienceRoles.map((role) => (
          <Role key={role.id} role={role} />
        ))}
      </ol>

      <div className="mt-8 sm:mt-14">
        <TechnicalSkills />
      </div>
    </section>
  );
}
