import React from "react";
import { render, screen, within } from "@testing-library/react";
import TechnicalSkills from "@/components/portfolio/TechnicalSkills";
import { skillGroups } from "@/lib/portfolio/about";

describe("skill data", () => {
  it("lists each skill once across all groups", () => {
    const skills = skillGroups.flatMap((group) => group.skills.map((skill) => skill.toLowerCase()));
    expect(new Set(skills).size).toBe(skills.length);
  });

  it("has no entry that only restates another or says nothing on its own", () => {
    const skills = skillGroups.flatMap((group) => group.skills);
    expect(skills).not.toContain("Networking");
    expect(skills).not.toContain("AI");
    expect(skills).toContain("Computer Networks");
  });
});

describe("technical skills block", () => {
  it("is headed one level below the section title", () => {
    render(<TechnicalSkills />);

    expect(screen.getByRole("heading", { level: 3, name: "Technical skills" })).toBeInTheDocument();
  });

  it("renders every group as a labelled list of its skills, in data order", () => {
    render(<TechnicalSkills />);

    const groupHeadings = screen.getAllByRole("heading", { level: 4 }).map((heading) => heading.textContent);
    expect(groupHeadings).toEqual(skillGroups.map((group) => group.title));

    for (const group of skillGroups) {
      const list = screen.getByRole("list", { name: group.title });
      expect(within(list).getAllByRole("listitem").map((item) => item.textContent)).toEqual(group.skills);
    }
  });

  it("renders nothing but the skills: one list per group", () => {
    render(<TechnicalSkills />);

    expect(screen.getAllByRole("list")).toHaveLength(skillGroups.length);
    expect(screen.getAllByRole("listitem")).toHaveLength(skillGroups.flatMap((group) => group.skills).length);
  });
});
