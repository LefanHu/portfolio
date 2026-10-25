import { about } from "@/lib/portfolio/about";
import { Label } from "./parts";

export default function AboutPanel() {
  return (
    <div className="ap-about">
      <section className="ap-card ap-about__intro" data-wire="box">
        <Label>Introduction</Label>
        <h3 className="ap-display" data-wire="text">
          {about.name}
        </h3>
        <p className="ap-lead" data-wire="text">
          I&apos;m {about.name}, {about.blurb}
        </p>
        <p className="ap-note" data-wire="text">
          {about.coop}
        </p>
      </section>
      <div className="ap-about__side">
        <section className="ap-card" data-wire="box">
          <Label>Education</Label>
          <h3 className="ap-card__title" data-wire="text">
            {about.education.school}
          </h3>
          <p className="ap-body" data-wire="text">
            {about.education.degree}
          </p>
          <p className="ap-meta" data-wire="text">
            {about.education.period}
          </p>
        </section>
        <section className="ap-card" data-wire="box">
          <Label>Research</Label>
          <h3 className="ap-card__title" data-wire="text">
            {about.research.title}
          </h3>
          <p className="ap-meta" data-wire="text">
            {about.research.period}
          </p>
          <p className="ap-body" data-wire="text">
            {about.research.description}
          </p>
        </section>
      </div>
    </div>
  );
}
