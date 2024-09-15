"use client";

import { ThemeIcon, Text, Avatar, Timeline } from "@mantine/core";
import { IconSun, IconVideo } from "@tabler/icons-react";

const experiences = [
  {
    name: "Rock Climbing",
    description:
      "Rock climbing is my go-to activity for stress relief as well as physical exercise... Nothing quite like the feeling of hard rocks in your hand.",
  },
  {
    name: "Drones",
    description:
      "Building fpv drones and flying them either autonomously or in fpv mode. Ardupilot, Betaflight, iNav, etc, are all really cool open source projects.",
  },
  {
    name: "AI & Machine Learning",
    description:
      "Generative AI has always been an interest of mine in the sense that machines can have such a thing as 'creativity'",
  },
  {
    name: "Computer Infrastructure",
    description:
      "As someone who grew up with a potato computer, I've always liked the idea of IaaS... AWS, AZURE, GCP, etc.",
  },
  {
    name: "Games & Anime",
    description:
      "Due to my interest for servers & infrastructure, I've always been the one to set up game / streaming servers for my friends.",
  },
  {
    name: "Gym",
    description:
      "Working out and staying healthy is also a passion of mine :) Goodlife fitness saunas are quite nice.",
  },
];

export default function Experiences() {
  return (
    <Timeline bulletSize={64} reverseActive>
      <Timeline.Item title="Default bullet">
        <Text c="dimmed" size="sm">
          Default bullet without anything
        </Text>
      </Timeline.Item>
      <Timeline.Item
        title="Avatar"
        bullet={
          <Avatar
            size={22}
            radius="xl"
            src="https://avatars0.githubusercontent.com/u/10353856?s=460&u=88394dfd67727327c1f7670a1764dc38a8a24831&v=4"
          />
        }
      >
        <Text c="dimmed" size="sm">
          Timeline bullet as avatar image
        </Text>
      </Timeline.Item>
      <Timeline.Item title="Icon" bullet={<IconSun size="0.8rem" />}>
        <Text c="dimmed" size="sm">
          Timeline bullet as icon
        </Text>
      </Timeline.Item>
      <Timeline.Item
        title="ThemeIcon"
        bullet={
          <ThemeIcon
            size={22}
            variant="gradient"
            gradient={{ from: "lime", to: "cyan" }}
            radius="xl"
          >
            <IconVideo size="0.8rem" />
          </ThemeIcon>
        }
      >
        <Text c="dimmed" size="sm">
          Timeline bullet as ThemeIcon component
        </Text>
      </Timeline.Item>
    </Timeline>
  );
}
