import { experienceBranches, type ExperienceBranch, type ExperienceRole } from "@/lib/portfolio/experience";
import { SITE_ANCHORS } from "@/lib/portfolioProjects";
import Panel from "@/components/ui/Panel";
import SectionHeading from "@/components/ui/SectionHeading";
import Sigil from "@/components/ui/Sigil";
import { TagList } from "@/components/ui/Tag";
import TechnicalSkills from "./TechnicalSkills";
import styles from "./ExperienceTree.module.css";

export { experienceBranches };

const TITLE_ID = "experience-title";

/** "2023 – 2026": the first and last year mentioned in any role's period. */
function yearSpan(roles: ExperienceRole[]) {
  const years = roles.flatMap((role) => role.period.match(/\d{4}/g) ?? []).map(Number);
  return `${Math.min(...years)} – ${Math.max(...years)}`;
}

/** A piece of the trunk: the track and the part of it the reader has scrolled past. */
function Rail() {
  return (
    <span aria-hidden="true" className={styles.rail}>
      <span className={styles.railFill} />
    </span>
  );
}

function RoleCard({ role }: { role: ExperienceRole }) {
  const headingId = `experience-${role.id}`;
  return (
    <li className={`relative ${styles.role}`}>
      <Rail />
      <span aria-hidden="true" className={`${styles.mark} ${styles.roleMark}`}>
        <span className={styles.twig}>
          <span className={styles.twigFill} />
        </span>
        <span className={styles.dot} />
      </span>
      <Panel as="article" aria-labelledby={headingId} className="p-4 sm:p-6">
        <div className="flex flex-col gap-x-6 gap-y-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h4 id={headingId} className="font-display text-lead font-bold leading-tight text-ink">
              {role.title}
            </h4>
            <p className="mt-1 text-sm font-medium text-body">{role.subtitle}</p>
          </div>
          <p className="shrink-0 text-sm text-mute sm:text-right">
            <span className="whitespace-nowrap text-body">{role.period}</span>
            <span aria-hidden="true" className="sm:hidden">
              {" · "}
            </span>
            <span className="sr-only">, </span>
            <span className="whitespace-nowrap sm:block">{role.location}</span>
          </p>
        </div>
        <div className="mt-3">
          <TagList label={`Focus areas at ${role.title}`} tags={role.tags} />
        </div>
        <ul className="mt-3 max-w-prose list-disc space-y-1.5 pl-4 text-sm text-body marker:text-sig-experience sm:mt-4 sm:space-y-2 sm:pl-5">
          {role.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      </Panel>
    </li>
  );
}

function Branch({ branch }: { branch: ExperienceBranch }) {
  const headingId = `experience-${branch.id}`;
  return (
    <li className={`relative ${styles.branch}`}>
      <div className={styles.head}>
        <Rail />
        <span aria-hidden="true" className={`${styles.mark} ${styles.branchMark}`}>
          <Sigil section="experience" />
        </span>
        <div className={styles.headText}>
          <h3 id={headingId} className="text-heading font-bold">
            {branch.title}
          </h3>
          {/* One line in a single column; stacked beside the trunk in two. */}
          <p className="mt-1 max-w-prose text-sm text-body">
            <span className="whitespace-nowrap text-mute lg:block">{branch.period}</span>
            <span aria-hidden="true" className="text-mute lg:hidden">
              {" · "}
            </span>
            <span className="sr-only">: </span>
            <span className="lg:mt-2 lg:block">{branch.subtitle}</span>
          </p>
          <div className="mt-3">
            <TagList label={`${branch.title} themes`} tags={branch.tags} />
          </div>
        </div>
      </div>
      <ol role="list" aria-labelledby={headingId} className={styles.roles}>
        {branch.roles.map((role) => (
          <RoleCard key={role.id} role={role} />
        ))}
      </ol>
    </li>
  );
}

/**
 * Work experience as a tree: one trunk down the section, a diamond on it for
 * each branch (a kind of system), and each role hanging off its branch as a
 * card. Branches and roles render in the order of the data, newest first.
 */
export default function Experiences() {
  const roles = experienceBranches.flatMap((branch) => branch.roles);

  return (
    <section id={SITE_ANCHORS.experience} aria-labelledby={TITLE_ID}>
      <SectionHeading section="experience" title="Experience" id={TITLE_ID}>
        Internships where I shipped production systems, grouped by the kinds of systems I like building.
      </SectionHeading>
      <p className="mt-4 text-sm text-mute">
        {roles.length} roles <span aria-hidden="true">·</span> {yearSpan(roles)} <span aria-hidden="true">·</span>{" "}
        {experienceBranches.length} branches: {experienceBranches.map((branch) => branch.title).join(", ")}
      </p>

      <ol role="list" className={`${styles.tree} mt-6 sm:mt-10`}>
        {experienceBranches.map((branch) => (
          <Branch key={branch.id} branch={branch} />
        ))}
      </ol>

      <div className="mt-8 sm:mt-14">
        <TechnicalSkills />
      </div>
    </section>
  );
}
