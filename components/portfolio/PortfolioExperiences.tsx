"use client";

import { Text, Avatar, Timeline, Badge, List } from "@mantine/core";
import { reverse } from "lodash";

interface Experience {
  company: string;
  position: string;
  date: string;
  caption: string;
  responsibilities: string[];
  tags: string[];
  bullet: JSX.Element;
}

const bulletIcon = (srcUrl: string, size: number) => {
  return (
    <Avatar
      size={size}
      radius="xl"
      src={srcUrl}
      alt="bullet icon"
      styles={{
        image: {
          objectFit: "contain",
          backgroundColor: "white",
          padding: "0.1rem",
        },
      }}
    />
  );
};

const skillBadge = (skill: string) => {
  return (
    <Badge
      size="md"
      variant="gradient"
      gradient={{ from: "yellow", to: "orange", deg: 185 }}
      key={skill}
    >
      {skill}
    </Badge>
  );
};

const positionBadge = (position: string) => {
  return (
    <Badge
      size="sm"
      variant="gradient"
      gradient={{ from: "rgba(204, 118, 118, 1)", to: "violet", deg: 135 }}
    >
      {position}
    </Badge>
  );
};

const dateBadge = (date: string) => {
  return (
    <Badge
      size="sm"
      variant="gradient"
      gradient={{ from: "rgba(219, 219, 219, 0.46)", to: "gray", deg: 194 }}
    >
      {date}
    </Badge>
  );
};

export default function Experiences() {
  const badgeSize = 64;
  const experiences: Experience[] = [
    {
      company: "KSKC Kumon",
      position: "Assistant Instructor/Grader",
      date: "2016 - 2018",
      caption: "",
      responsibilities: [
        "Built script for automated tracking of virtual attendance during COVID-19",
        "Assistant instructor / grader",
      ],
      tags: ["Planning/Organization", "Spreadsheet", "Javascript"],
      bullet: bulletIcon("/images/kumon_logo.png", badgeSize),
    },
    {
      company: "Hackthon Organizer (Volunteer)",
      position: "Hackathon Organizer",
      date: "2016 - 2018",
      caption: "",
      responsibilities: [
        "Organized 2-day hackathon",
        "Gave ML workshop to 50+ participants from various countries",
        "Helped gather $3000 in prizes",
        "200 participants from over 50 different countries",
      ],
      tags: [
        "Planning/Organization",
        "Presentation",
        "PyTorch",
        "Machine Learning",
      ],
      bullet: bulletIcon("/images/infinihacks_logo.png", badgeSize),
    },
    {
      company: "TELUS Corporation",
      position: "Software Developer Co-Op",
      date: "May 2023 - August 2023",
      caption: "",
      responsibilities: [
        "Contributed to the development of the auto-call system (ACMP) - a tool for hundreds of field technicians that decreased average time for response to service outages from hours to just 30 seconds",
        "Development for ACMP included building production images and deploying them to production Docker swarms",
        "Developed a Google Chat POC internal tool for use across the TELUS Reliability Center of Excellence team",
        "POC tool demo-ed to VP of TELUS",
      ],
      tags: [
        "Python",
        "Jinja2",
        "Docker",
        "Docker Swarm",
        "GCP",
        "Java",
        "Sequelize",
        "Nginx",
        "LDAP",
      ],
      bullet: bulletIcon("/images/telus_logo.png", badgeSize),
    },
    {
      company: "Ciena Corporation",
      position: "Software Developer Co-Op",
      date: "January 2024 - April 2024",
      caption: "",
      responsibilities: [
        "Developed major releases of the extract logs application used by over 100 engineers",
        "Created Splunk queries to generate search queries for well-known signatures of recognizable errors on infrastructure",
        // "Utilized AWS for audio sentiment analysis with PyTorch",
        "Extensively used Python and JupyterLab for scripting, automation, and parsing of complex log files",
        "Built database for audio sentiment analysis by a combination of scripting, parsing, and web scraping from various sources",
      ],
      tags: ["Splunk", "AWS", "PyTorch", "Python", "JupyterLab", "Scrapy"],
      bullet: bulletIcon("/images/ciena_logo.png", badgeSize),
    },
    {
      company: "???",
      position: "so exciting! :D",
      date: "Summer 2025 Co-Op",
      caption:
        "Looking for a Co-Op for summer 2025, please reach out if you have any opportunities and believe my experiences align with your development goals!",
      responsibilities: [],
      tags: [],
      bullet: bulletIcon("/images/chibi_tilt.gif", badgeSize),
    },
  ];
  reverse(experiences);
  return (
    <div className="flex flex-col items-center gap-y-8 w-full bg-gray-900 rounded-2xl bg-opacity-90 px-4 py-8 sm:px-6 sm:py-12 lg:max-w-7xl lg:px-8">
      <h2 className="text-3xl font-extrabold tracking-tight text-gray-200 sm:text-4xl md:text-6xl bg-gradient-to-r from-gray-200 to-slate-300 bg-clip-text text-transparent">
        Experiences
      </h2>
      <div className="mx-auto gap-x-8 gap-y-8 px-4 py-8 sm:px-6 bg-gray-600 bg-opacity-50 rounded-2xl">
        <div className="flex flex-row justify-center items-center">
          <Timeline
            radius="xl"
            lineWidth={3}
            bulletSize={badgeSize + 4}
            active={experiences.length}
            color="rgba(172, 48, 176, 1)"
          >
            {experiences.map((experience, index) => (
              <Timeline.Item
                key={"experience" + index}
                title={
                  <h3 className="bg-gradient-to-r from-sky-200 via-orange-100 to-purple-400 bg-clip-text text-transparent text-2xl font-extrabold">
                    {experience.company}
                  </h3>
                }
                bullet={experience.bullet}
              >
                <div className="flex flex-row flex-nowrap gap-2">
                  {positionBadge(experience.position)}
                  {dateBadge(experience.date)}
                </div>
                <div className="my-2 flex flex-col max-w-2xl">
                  <Text size="sm">{experience.caption}</Text>
                  {experience.responsibilities.length > 0 && (
                    <div className="m-2 p-4 bg-slate-600 bg-opacity-70 rounded-xl">
                      <List size="sm" listStyleType="disc">
                        {experience.responsibilities.map((resp) => (
                          <List.Item key={resp} className="w-[95%]">
                            <p>{resp}</p>
                          </List.Item>
                        ))}
                      </List>
                    </div>
                  )}

                  <div className="flex flex-row flex-wrap gap-2">
                    {experience.tags.map((tag) => skillBadge(tag))}
                  </div>
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        </div>
      </div>
    </div>
  );
}
