import { Badge } from "@mantine/core";

interface LTSkill {
  tagName: string;
  tagSlug: string;
  problemsSolved: number;
}

export default function LTSkill(skill: LTSkill) {
  return (
    <Badge size="sm" color="blue">
      {skill.tagSlug} <span className="text-gray-800">x</span>{" "}
      <span className="text-orange-500 font-bold">{skill.problemsSolved}</span>
    </Badge>
  );
}
