import { skillGroups } from "@/lib/portfolio/about";
import { Chips, Label } from "./parts";

export default function SkillsPanel() {
  return (
    <div className="ap-grid3 ap-skills">
      {skillGroups.map((g) => (
        <section key={g.title} className="ap-card" data-wire="box">
          <Label>{g.skills.length} skills</Label>
          <h3 className="ap-card__title" data-wire="text">
            {g.title}
          </h3>
          <Chips items={g.skills} />
        </section>
      ))}
    </div>
  );
}
