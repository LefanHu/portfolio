"use client";
import { Badge } from "@mantine/core";

export default function TechnologyBadge(tech: string) {
  return (
    <Badge
      size="md"
      variant="gradient"
      gradient={{
        from: "rgba(186, 186, 186, 1)",
        to: "rgba(145, 145, 145, 1)",
        deg: 123,
      }}
      key={tech}
    >
      {tech}
    </Badge>
  );
}
