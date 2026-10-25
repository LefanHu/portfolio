import { experienceBranches } from "@/lib/portfolio/experience";
import { Chips, Label } from "./parts";

export default function ExperiencePanel() {
  return (
    <div className="ap-columns">
      {experienceBranches.flatMap((branch) =>
        branch.roles.map((role) => (
          <article key={role.id} className="ap-card ap-role" data-wire="box">
            <Label>{branch.title}</Label>
            <h3 className="ap-card__title" data-wire="text">
              {role.title}
            </h3>
            <p className="ap-sub" data-wire="text">
              {role.subtitle}
            </p>
            <p className="ap-meta" data-wire="text">
              {role.period} · {role.location}
            </p>
            <ul className="ap-bullets">
              {role.highlights.map((h) => (
                <li key={h} data-wire="text">
                  {h}
                </li>
              ))}
            </ul>
            <Chips items={role.tags} />
          </article>
        )),
      )}
    </div>
  );
}
