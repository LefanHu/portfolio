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
      caption:
        "Rock climbing is my go-to activity for stress relief as well as physical exercise... Nothing quite like the feeling of hard rocks in your hand.",
      responsibilities: [
        "Built script for automated tracking of virtual attendance during COVID-19",
        "Assistant instructor / grader",
      ],
      tags: ["Planning/Organization", "Spreadsheet", "Javascript"],
      bullet: bulletIcon("/images/kumon_logo.png", badgeSize),
    },
    {
      company: "Hackthon Organizer",
      position: "Hackathon Organizer (Volunteer)",
      date: "2016 - 2018",
      caption:
        "Building fpv drones and flying them either autonomously or in fpv mode. Ardupilot, Betaflight, iNav, etc, are all really cool open source projects.",
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
      caption:
        "Generative AI has always been an interest of mine in the sense that machines can have such a thing as 'creativity'",
      responsibilities: [
        "Contributed to auto-callout system (ACMP) for field technicians and improved the reliability of response times in times of need",
        "Developed a Google Chat internal tool for use across the TELUS Reliability Center of Excellence team",
      ],
      tags: [
        "Python",
        "Jinja2",
        "Docker",
        "Docker Swarm",
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
      caption:
        "As someone who grew up with a potato computer, I've always liked the idea of IaaS... AWS, AZURE, GCP, etc.",
      responsibilities: [
        "Created Splunk queries to generate search queries for well-known signatures of recognizable errors",
        "Utilized AWS for audio sentiment analysis with PyTorch",
        "Extensively used Python and JupyterLab for scripting, automation, and parsing of complex log files",
        "Employed the Scrapy Python framework for web crawling data",
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
    <div className="flex flex-col mx-auto max-w-2xl gap-x-8 gap-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:max-w-7xl lg:px-8 bg-gray-900 bg-opacity-90 rounded-2xl">
      <h2 className="text-3xl font-bold tracking-tight text-gray-200 sm:text-4xl">
        Experiences
      </h2>
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
                  <div className="m-2 p-4 bg-slate-700 bg-opacity-30 rounded-xl">
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
  );
}
