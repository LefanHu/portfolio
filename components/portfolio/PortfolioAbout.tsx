import { about, skillGroups } from "@/lib/portfolio/about";

const cardClasses = "rounded-2xl border border-white/10 bg-slate-900/90 p-6 sm:p-8";

function AboutSummaryContent() {
  return (
    <>
      <h2 id="about-heading" className="text-3xl font-bold text-white">About Me</h2>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
        I&apos;m {about.name}, {about.blurb}
      </p>
      <p className="mt-3 text-sky-200">{about.coop}</p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-xl font-bold text-white">Education</h3>
          <p className="mt-2 text-slate-200">{about.education.school}</p>
          <p className="text-slate-300">{about.education.degree}</p>
          <p className="mt-2 text-sm text-sky-200">{about.education.period}</p>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Research</h3>
          <p className="mt-2 text-slate-200">{about.research.title} · {about.research.period}</p>
          <p className="mt-2 leading-7 text-slate-300">{about.research.description}</p>
        </div>
      </div>
    </>
  );
}

function TechnicalSkillsContent() {
  return (
    <>
      <h3 className="mt-8 text-xl font-bold text-white">Technical Skills</h3>
      <div className="mt-4 grid gap-6 lg:grid-cols-3">
        {skillGroups.map((group) => (
          <div key={group.title}>
            <h4 className="font-semibold text-sky-200">{group.title}</h4>
            <ul className="mt-3 flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <li key={skill} className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-sm text-slate-200">{skill}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}

export function AboutSummary() {
  return (
    <section aria-labelledby="about-heading" className={cardClasses}>
      <AboutSummaryContent />
    </section>
  );
}

// The heading's top margin separates it from the summary inside About; on its own card it starts flush.
export function TechnicalSkills() {
  return (
    <section aria-label="Technical Skills" className={`${cardClasses} [&>h3:first-child]:mt-0`}>
      <TechnicalSkillsContent />
    </section>
  );
}

export default function About() {
  return (
    <section aria-labelledby="about-heading" className={cardClasses}>
      <AboutSummaryContent />
      <TechnicalSkillsContent />
    </section>
  );
}
