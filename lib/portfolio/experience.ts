export type ExperienceRole = {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  period: string;
  tags: string[];
  /** Empty for a role that has not started. */
  highlights: string[];
  /** An accepted role that has not started: its card says so and has no highlights yet. */
  upcoming?: boolean;
};

export type ExperienceBranch = {
  id: string;
  title: string;
  subtitle: string;
  period: string;
  tags: string[];
  roles: ExperienceRole[];
};

// Display order: the branch holding the most recent role comes first, and
// roles run newest first inside a branch. The section renders this as written.
export const experienceBranches: ExperienceBranch[] = [
  // Roles move out of here into a branch of their own kind once they have highlights to show.
  {
    id: "up-next",
    title: "Up Next",
    subtitle: "Software engineering co-op terms lined up for 2027",
    period: "Jan. – Aug. 2027",
    tags: ["Co-op", "Winter 2027", "Spring 2027"],
    roles: [
      {
        id: "aven-financial",
        title: "Aven Financial",
        subtitle: "Software Development Engineer",
        location: "San Jose, CA",
        period: "May 2027 – Aug. 2027",
        tags: ["Spring 2027", "Co-op"],
        highlights: [],
        upcoming: true,
      },
      {
        id: "atoms",
        title: "ATOMS",
        subtitle: "Software Development Engineer",
        location: "San Francisco, CA",
        period: "Jan. 2027 – Apr. 2027",
        tags: ["Winter 2027", "Co-op"],
        highlights: [],
        upcoming: true,
      },
    ],
  },
  {
    id: "developer-productivity",
    title: "Developer Productivity",
    subtitle: "Internal tooling, diagnostics, and faster workflows for engineering teams",
    period: "2024 – 2026",
    tags: ["Internal Tools", "AI", "Automation"],
    roles: [
      {
        id: "capital-one",
        title: "Capital One",
        subtitle: "Software Developer, The 6ix Team",
        location: "Toronto, ON",
        period: "May 2026 – Aug. 2026",
        tags: ["AI Automation", "Figma MCP", "Astro"],
        highlights: [
          "Developed an AI-automated Figma-to-Astro framework for product pages, reducing implementation time from two weeks to one day.",
          "Integrated Figma MCP to extract layout, spacing, and design-token context for production workflows, minimizing manual intervention.",
        ],
      },
      {
        id: "ciena",
        title: "Ciena",
        subtitle: "Software Developer, Technological Innovation Team",
        location: "Ottawa, ON",
        period: "Jan. 2024 – Apr. 2024",
        tags: ["JupyterLab", "Splunk", "Diagnostics"],
        highlights: [
          "Developed major releases of a data aggregator tool used by hundreds of engineers within Ciena, saving hundreds of engineering hours.",
          "Built Splunk search queries that identified common hardware device errors 80% faster.",
          "Used JupyterLab to automate complex log archive workflows, increasing efficiency by 30%.",
        ],
      },
    ],
  },
  {
    id: "robotics-and-automation",
    title: "Robotics and Automation",
    subtitle: "Applied ML, deployment, and cross-team enablement for physical systems",
    period: "2025 – 2026",
    tags: ["Robotics", "ML", "AWS"],
    roles: [
      {
        id: "amazon-robotics",
        title: "Amazon Robotics",
        subtitle: "Software Developer, AR Human Workcell Interface Team",
        location: "Toronto, ON",
        period: "Sept. 2025 – Apr. 2026",
        tags: ["Planning Pipelines", "CDK", "Workcells"],
        highlights: [
          "Designed, developed, and deployed ML planning pipelines for robotic movement drive units across 1,200+ fulfillment centers worldwide.",
          "Led a cross-team effort to establish a robotics lab in Toronto, using a custom VPN routed through corporate infrastructure and robotic drive simulation clusters to enable capabilities previously exclusive to Amazon Robotics HQ, saving approximately $1 million in deployment costs.",
          "Deployed a custom CDK-managed application for robotic station software to connect to AWS from the Unfabric office network.",
        ],
      },
    ],
  },
  {
    id: "platform-and-security",
    title: "Platform and Security",
    subtitle: "Reliability, compliance, and operational tooling at service scale",
    period: "2023 – 2025",
    tags: ["Infrastructure", "Monitoring", "Compliance"],
    roles: [
      {
        id: "adentro",
        title: "Adentro",
        subtitle: "DevOps Engineer, Security and DevOps Team",
        location: "San Francisco, CA",
        period: "May 2025 – Aug. 2025",
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
        period: "May 2023 – Aug. 2023",
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
];
