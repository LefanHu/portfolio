import { acceleratorProject, projects } from "@/lib/portfolioProjects";
import { Label, WireImage, linkTarget } from "./parts";

const cta = (href: string) => (href.startsWith("/") ? "Read more →" : "Open ↗");

export default function ProjectsPanel() {
  return (
    <div className="ap-projects">
      <a className="ap-card ap-feature" href={acceleratorProject.href} {...linkTarget(acceleratorProject.href)} data-wire="box">
        {/* a systolic array in miniature */}
        <div className="ap-feature__art" data-wire="img" aria-hidden>
          {Array.from({ length: 24 }, (_, i) => (
            <i key={i} style={{ animationDelay: `${((i % 6) + Math.floor(i / 6)) * 140}ms` }} />
          ))}
        </div>
        <div className="ap-feature__text">
          <Label>Featured · FPGA</Label>
          <h3 className="ap-card__title ap-feature__title" data-wire="text">
            {acceleratorProject.name}
          </h3>
          <p className="ap-body" data-wire="text">
            {acceleratorProject.description}
          </p>
          <span className="ap-cta" data-wire="text">
            {cta(acceleratorProject.href)}
          </span>
        </div>
      </a>
      <div className="ap-grid3">
        {projects.map((p) => (
          <a key={p.name} className="ap-card ap-proj" href={p.href} {...linkTarget(p.href)} data-wire="box">
            <WireImage src={p.imgSrc} alt="" />
            <h3 className="ap-card__title" data-wire="text">
              {p.name}
            </h3>
            <p className="ap-body ap-proj__desc" data-wire="text">
              {p.description}
            </p>
            <span className="ap-cta" data-wire="text">
              {cta(p.href)}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
