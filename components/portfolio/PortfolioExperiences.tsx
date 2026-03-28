"use client";

type ExperienceRole = {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  period: string;
  tags: string[];
  highlights: string[];
};

type ExperienceBranch = {
  id: string;
  title: string;
  subtitle: string;
  period: string;
  tags: string[];
  roles: ExperienceRole[];
};

export const mockExperienceBranches: ExperienceBranch[] = [
  {
    id: "robotics-and-automation",
    title: "Robotics and Automation",
    subtitle: "Applied ML, deployment, and cross-team enablement for physical systems",
    period: "2025",
    tags: ["Robotics", "ML", "AWS"],
    roles: [
      {
        id: "amazon-robotics",
        title: "Amazon Robotics",
        subtitle: "Software Developer, AR Human Workcell Interface Team",
        location: "Toronto, ON",
        period: "Sept. 2025 - Dec. 2025",
        tags: ["Planning Pipelines", "CDK", "Workcells"],
        highlights: [
          "Designed, developed, and deployed ML planning pipelines for robotic movement drive units across fulfillment centers worldwide.",
          "Led a cross-team effort for work-cell station setup in Toronto, creating a path for teams to test workflows locally instead of relying only on Boston.",
          "Deployed a custom CDK-managed application for robotic station software to connect to AWS from the Unfabric office network.",
        ],
      },
    ],
  },
  {
    id: "platform-and-security",
    title: "Platform and Security",
    subtitle: "Reliability, compliance, and operational tooling at service scale",
    period: "2023 - 2025",
    tags: ["Infrastructure", "Monitoring", "Compliance"],
    roles: [
      {
        id: "adentro",
        title: "Adentro",
        subtitle: "DevOps Engineer, Security and DevOps Team",
        location: "San Francisco, California",
        period: "May 2025 - Aug. 2025",
        tags: ["ECS", "Observability", "SOC 2"],
        highlights: [
          "Developed and maintained resilient monitoring systems for large-scale ECS clusters supporting 400+ services.",
          "Led system design improvements adopted cluster-wide, speeding up configuration change workflows by 80%.",
          "Contributed targeted infrastructure changes that supported SOC 2 compliance efforts across multiple services.",
        ],
      },
      {
        id: "telus",
        title: "TELUS",
        subtitle: "Software Developer, RCOE Team",
        location: "Toronto, ON",
        period: "May 2023 - Aug. 2023",
        tags: ["Spring Boot", "Docker", "GCP Pub/Sub"],
        highlights: [
          "Contributed to ACMP, an auto-call management service for automatic dispatching of field technicians.",
          "Built, tested, and deployed production images of the ACMP service to customer-facing Docker swarms.",
          "Adopted a GCP Pub/Sub model to facilitate secure communication and enable internal database access through Google services.",
          "Developed a Java Spring Boot chat service with a serverless architecture, reducing compute cost by 20x.",
        ],
      },
    ],
  },
  {
    id: "developer-productivity",
    title: "Developer Productivity",
    subtitle: "Internal tooling, diagnostics, and faster workflows for engineering teams",
    period: "2024",
    tags: ["Internal Tools", "Splunk", "Automation"],
    roles: [
      {
        id: "ciena",
        title: "CIENA Corporation",
        subtitle: "Software Developer, Technological Innovation Team",
        location: "Ottawa, ON",
        period: "Jan. 2024 - Apr. 2024",
        tags: ["JupyterLab", "Splunk", "Diagnostics"],
        highlights: [
          "Developed major releases of a data aggregator tool used by hundreds of engineers within CIENA.",
          "Built Splunk search queries that identified common hardware device errors 80% faster.",
          "Used JupyterLab to automate complex log archive workflows, increasing efficiency by 30%.",
        ],
      },
    ],
  },
];

function Tag({ tag, tone }: { tag: string; tone: "sky" | "amber" | "emerald" }) {
  const styles =
    tone === "amber"
      ? "border-amber-300/25 bg-amber-300/10 text-amber-100"
      : tone === "emerald"
        ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
        : "border-sky-300/25 bg-sky-300/10 text-sky-100";

  return (
    <span className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${styles}`}>
      {tag}
    </span>
  );
}

function BranchCard({ branch }: { branch: ExperienceBranch }) {
  return (
    <article className="relative flex min-w-[280px] max-w-[360px] flex-1 flex-col rounded-[30px] border border-white/10 bg-slate-950/70 p-5 shadow-[0_25px_80px_rgba(2,6,23,0.45)] backdrop-blur">
      <div className="absolute left-1/2 top-0 h-10 w-px -translate-y-10 bg-gradient-to-b from-cyan-300/80 to-white/0" />
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="bg-gradient-to-r from-cyan-200 via-sky-100 to-indigo-200 bg-clip-text text-xs font-bold uppercase tracking-[0.28em] text-transparent">
            Branch
          </p>
          <h3 className="mt-2 text-2xl font-black text-white">{branch.title}</h3>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-200">
          {branch.period}
        </span>
      </div>

      <p className="text-sm leading-6 text-slate-300">{branch.subtitle}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {branch.tags.map((tag) => (
          <Tag key={tag} tag={tag} tone="sky" />
        ))}
      </div>

      <div className="relative mt-8 flex flex-col gap-4 border-l border-white/10 pl-5">
        {branch.roles.map((role, index) => (
          <div key={role.id} className="relative">
            <div className="absolute -left-[21px] top-6 h-px w-4 bg-white/20" />
            <div className="absolute -left-[27px] top-[21px] h-3 w-3 rounded-full border border-slate-950 bg-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.75)]" />
            <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/8 p-4">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-lg font-bold text-white">{role.title}</h4>
                  <p className="text-sm text-emerald-100/90">{role.subtitle}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    {role.location}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                  {role.period}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {role.tags.map((tag) => (
                  <Tag key={`${role.id}-${tag}`} tag={tag} tone="emerald" />
                ))}
              </div>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-200">
                {role.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
            {index < branch.roles.length - 1 ? (
              <div className="absolute -left-[21px] top-9 h-[calc(100%+0.75rem)] w-px bg-white/10" />
            ) : null}
          </div>
        ))}
      </div>
    </article>
  );
}

export default function Experiences() {
  const totalRoles = mockExperienceBranches.reduce(
    (count, branch) => count + branch.roles.length,
    0
  );

  return (
    <section className="relative flex w-full flex-col gap-8 overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_28%),radial-gradient(circle_at_right,rgba(251,191,36,0.14),transparent_24%),linear-gradient(180deg,rgba(3,7,18,0.96),rgba(15,23,42,0.93))] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="absolute left-10 top-10 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute bottom-8 right-8 h-40 w-40 rounded-full bg-amber-300/10 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-4 lg:max-w-3xl">
        <span className="w-fit rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100">
          Experience Tree
        </span>
        <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl">
          Work experience grouped by the kinds of systems I like building.
        </h2>
        <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
          Robotics, platform engineering, reliability, and internal tooling work
          across internships where I shipped production systems and made complex
          workflows faster for other teams.
        </p>
      </div>

      <div className="relative z-10 rounded-[32px] border border-white/10 bg-slate-950/45 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto mb-10 flex max-w-xl flex-col items-center text-center">
          <div className="rounded-[28px] border border-cyan-300/25 bg-[linear-gradient(160deg,rgba(15,23,42,0.96),rgba(30,41,59,0.92))] px-6 py-5 shadow-[0_24px_70px_rgba(59,130,246,0.2)]">
            <p className="bg-gradient-to-r from-cyan-200 via-sky-100 to-indigo-300 bg-clip-text text-xs font-bold uppercase tracking-[0.32em] text-transparent">
              Overview
            </p>
            <h3 className="mt-2 text-3xl font-black text-white">Career Journey</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              A focused timeline across {totalRoles} engineering roles spanning
              robotics, platform reliability, and developer productivity.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Tag tag="2023 - 2025" tone="amber" />
              <Tag tag={`${mockExperienceBranches.length} branches`} tone="sky" />
              <Tag tag={`${totalRoles} experiences`} tone="emerald" />
            </div>
          </div>
          <div className="h-10 w-px bg-gradient-to-b from-cyan-300/80 to-white/0" />
        </div>

        <div className="relative flex flex-wrap justify-center gap-6 xl:flex-nowrap">
          <div className="pointer-events-none absolute left-[8%] right-[8%] top-0 hidden h-px bg-gradient-to-r from-transparent via-cyan-200/45 to-transparent xl:block" />
          {mockExperienceBranches.map((branch) => (
            <BranchCard key={branch.id} branch={branch} />
          ))}
        </div>
      </div>
    </section>
  );
}
