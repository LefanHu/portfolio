import Panel from "@/components/ui/Panel";
import Tag from "@/components/ui/Tag";
import type { Skill, SkillGroup } from "./profile";

/** Topics shown per level before the "Show all" disclosure. */
export const SKILLS_VISIBLE = 8;

// One column per level on wide screens, stacked below.
const LEVELS = "mt-4 grid gap-x-8 gap-y-4 lg:grid-cols-3";
const CHIPS = "flex flex-wrap gap-1.5";

// Placeholder chip widths for one level: the spread of real topic names, so they wrap like the real rows.
const PLACEHOLDER_CHIPS = ["w-24", "w-20", "w-20", "w-28", "w-36", "w-32", "w-40", "w-16"];
const PLACEHOLDER_LEVELS = ["Fundamental", "Intermediate", "Advanced"];

function SkillTags({ skills }: { skills: Skill[] }) {
  return (
    <ul className={CHIPS}>
      {skills.map((skill) => (
        <Tag as="li" key={skill.slug}>
          {skill.name}
          <span className="text-mute lining-nums tabular-nums">{skill.solved}</span>
        </Tag>
      ))}
    </ul>
  );
}

// Once open, the toggle moves below the extra chips it controls (where
// <details> can be laid out as a flex column; elsewhere it stays above them).
function Level({ group }: { group: SkillGroup }) {
  const top = group.skills.slice(0, SKILLS_VISIBLE);
  const rest = group.skills.slice(SKILLS_VISIBLE);
  return (
    <div>
      <dt className="text-sm font-bold text-ink">{group.label}</dt>
      <dd className="mt-2">
        <SkillTags skills={top} />
        {rest.length > 0 ? (
          <details className="group open:flex open:flex-col-reverse">
            <summary className="mt-1 inline-flex self-start min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-chip text-sm font-medium text-rune hover:text-rune-strong [&::-webkit-details-marker]:hidden">
              <svg
                viewBox="0 0 16 16"
                width="0.8em"
                height="0.8em"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
                className="transition-transform duration-200 ease-swift group-open:rotate-90"
              >
                <path d="m6 3.5 4.5 4.5L6 12.5" />
              </svg>
              <span className="group-open:hidden">Show all {group.skills.length}</span>
              <span className="hidden group-open:inline">Show fewer</span>
              <span className="sr-only"> {group.label.toLowerCase()} topics</span>
            </summary>
            <div className="mt-1.5">
              <SkillTags skills={rest} />
            </div>
          </details>
        ) : null}
      </dd>
    </div>
  );
}

/**
 * Topics by LeetCode's three levels, most-solved first, with the number of
 * problems solved in each. Without `groups` it renders placeholders.
 */
export default function Skills({ groups }: { groups?: SkillGroup[] }) {
  return (
    <Panel as="section" aria-labelledby="lt-skills-title" className="p-4 sm:p-6">
      <h3 id="lt-skills-title" className="text-heading font-bold">
        Skills by level
      </h3>
      <p className="mt-1 text-sm text-mute">Problems solved per topic.</p>
      {groups === undefined ? (
        <div aria-hidden="true" className={LEVELS}>
          {PLACEHOLDER_LEVELS.map((level) => (
            <div key={level}>
              <span className="flex h-[1lh] items-center text-sm">
                <span className="skeleton block h-[0.7em] w-24" />
              </span>
              <ul className={`mt-2 ${CHIPS}`}>
                {PLACEHOLDER_CHIPS.map((width, index) => (
                  <li key={index} className={`skeleton h-[1.5625rem] ${width}`} />
                ))}
              </ul>
              <span className="mt-1 flex min-h-11 items-center">
                <span className="skeleton block h-3 w-20" />
              </span>
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <p className="mt-4 text-sm text-mute">The topic breakdown is unavailable right now.</p>
      ) : (
        <dl className={LEVELS}>
          {groups.map((group) => (
            <Level key={group.level} group={group} />
          ))}
        </dl>
      )}
    </Panel>
  );
}
