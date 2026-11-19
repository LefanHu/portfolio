import { skillGroups } from "@/lib/portfolio/about";
import { TagList } from "@/components/ui/Tag";
import styles from "./ExperienceTimeline.module.css";

/**
 * The skills summary that closes the experience section. On wide screens it
 * takes the timeline's two columns (title left, groups right) so the section
 * keeps one set of edges.
 */
export default function TechnicalSkills() {
  return (
    <div className={`${styles.skills} border-t border-line pt-7 sm:pt-10`}>
      <h3 className="text-heading font-bold">Technical skills</h3>
      <div className="mt-4 flex flex-col gap-4 sm:gap-5 lg:mt-1">
        {skillGroups.map((group) => (
          <div key={group.title} className="grid gap-x-6 gap-y-2 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-baseline">
            <h4 className="text-sm font-bold text-ink">{group.title}</h4>
            <TagList label={group.title} tags={group.skills} />
          </div>
        ))}
      </div>
    </div>
  );
}
