import { describe, expect, it } from "vitest";
import { skillGroups } from "@/lib/portfolio/about";
import { contact } from "@/lib/portfolio/contact";
import { experienceRoles } from "@/lib/portfolio/experience";
import { interests } from "@/lib/portfolio/interests";

describe("portfolio data", () => {
  it("has experience roles", () => {
    expect(experienceRoles.map((role) => role.title)).toEqual([
      "Aven Financial",
      "ATOMS",
      "Capital One",
      "Amazon Robotics",
      "Adentro",
      "Ciena",
      "TELUS",
    ]);
  });

  it("has skill groups", () => {
    expect(skillGroups.map((g) => g.title)).toEqual(["Programming", "Cloud and Systems", "AI, Hardware, and Web"]);
  });

  it("has interests and contact", () => {
    expect(interests).toHaveLength(6);
    expect(contact.email).toBe("l2hu@uwaterloo.ca");
  });
});
