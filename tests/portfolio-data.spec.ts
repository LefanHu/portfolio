import { describe, expect, it } from "vitest";
import { skillGroups } from "@/lib/portfolio/about";
import { contact } from "@/lib/portfolio/contact";
import { experienceBranches } from "@/lib/portfolio/experience";
import { interests } from "@/lib/portfolio/interests";

describe("portfolio data", () => {
  it("has experience branches and roles", () => {
    expect(experienceBranches).toHaveLength(4);
    const titles = experienceBranches.flatMap((b) => b.roles.map((r) => r.title));
    expect(titles).toHaveLength(7);
    expect(titles).toEqual(
      expect.arrayContaining([
        "Aven Financial",
        "ATOMS",
        "Amazon Robotics",
        "Adentro",
        "TELUS",
        "Capital One",
        "Ciena",
      ]),
    );
  });

  it("has skill groups", () => {
    expect(skillGroups.map((g) => g.title)).toEqual(["Programming", "Cloud and Systems", "AI, Hardware, and Web"]);
  });

  it("has interests and contact", () => {
    expect(interests).toHaveLength(6);
    expect(contact.email).toBe("l2hu@uwaterloo.ca");
  });
});
