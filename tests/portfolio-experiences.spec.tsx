import React from "react";
import { render, screen, within } from "@testing-library/react";
import Experiences, { experienceRoles as roles } from "@/components/portfolio/PortfolioExperiences";
import { skillGroups } from "@/lib/portfolio/about";
import { SITE_ANCHORS } from "@/lib/portfolioProjects";

/** A sortable number for the month a period starts in ("Sept. 2025 – Apr. 2026" -> 2025 * 12 + 8). */
function startMonth(period: string) {
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const match = period.match(/^([A-Za-z]{3})[a-z]*\.? (\d{4})/);
  if (!match) throw new Error(`unreadable period: ${period}`);
  return Number(match[2]) * 12 + months.indexOf(match[1].toLowerCase());
}

describe("experience data", () => {
  it("runs newest first, by the month each role starts", () => {
    const starts = roles.map((role) => startMonth(role.period));
    expect(starts).toEqual([...starts].sort((a, b) => b - a));
    // No two roles start together, so the order is never a judgement call.
    expect(new Set(starts).size).toBe(starts.length);
  });

  it("writes every date range with an en dash", () => {
    for (const role of roles) {
      expect(role.period).toMatch(/ – /);
      expect(role.period).not.toMatch(/-/);
    }
  });

  it("leads with the upcoming roles, which have dates and a place but no highlights yet", () => {
    const upcoming = roles.filter((role) => role.upcoming);
    expect(upcoming.map((role) => [role.title, role.period, role.location])).toEqual([
      ["Aven Financial", "May 2027 – Aug. 2027", "San Jose, CA"],
      ["ATOMS", "Jan. 2027 – Apr. 2027", "San Francisco, CA"],
    ]);
    expect(roles.slice(0, upcoming.length)).toEqual(upcoming);
    for (const role of roles) {
      // A role has something to show for itself exactly when it has happened.
      expect(role.highlights.length === 0).toBe(Boolean(role.upcoming));
    }
  });

  it("gives every role that has happened one of a few themes", () => {
    for (const role of roles) {
      expect(Boolean(role.theme)).toBe(!role.upcoming);
    }
    expect(new Set(roles.flatMap((role) => role.theme ?? []))).toEqual(
      new Set(["Developer Productivity", "Robotics and Automation", "Platform and Security"]),
    );
  });

  it("writes every location as City, two-letter region", () => {
    for (const role of roles) {
      expect(role.location).toMatch(/^[A-Z][A-Za-z .]+, [A-Z]{2}$/);
    }
  });
});

describe("experience section", () => {
  it("is the experience anchor, named by its heading", () => {
    const { container } = render(<Experiences />);

    const section = screen.getByRole("region", { name: "Experience" });
    expect(section).toHaveAttribute("id", SITE_ANCHORS.experience);
    expect(container.querySelectorAll(`#${SITE_ANCHORS.experience}`)).toHaveLength(1);
    expect(within(section).getByRole("heading", { level: 2, name: "Experience" })).toBeInTheDocument();
  });

  it("renders every role as a card in one list, in data order", () => {
    render(<Experiences />);

    const list = screen.getByRole("list", { name: "Roles, newest first" });
    expect(list.children).toHaveLength(roles.length);
    const cards = within(list).getAllByRole("article");
    expect(cards.map((card) => within(card).getByRole("heading", { level: 3 }).textContent)).toEqual(
      roles.map((role) => role.title),
    );
    // Every card on the page is in that one list.
    expect(screen.getAllByRole("article")).toHaveLength(roles.length);
  });

  it("shows each role's team, period, location, theme, tags and every highlight", () => {
    render(<Experiences />);

    for (const role of roles) {
      const card = screen.getByRole("article", { name: role.title });
      expect(within(card).getByText(role.subtitle)).toBeInTheDocument();
      expect(within(card).getByText(role.period)).toBeInTheDocument();
      expect(within(card).getByText(role.location)).toBeInTheDocument();
      if (role.theme) {
        expect(within(card).getByText(role.theme)).toBeInTheDocument();
      }

      const tags = within(card).getByRole("list", { name: `Focus areas at ${role.title}` });
      expect(within(tags).getAllByRole("listitem").map((tag) => tag.textContent)).toEqual(role.tags);

      for (const highlight of role.highlights) {
        expect(within(card).getByText(highlight).closest("li")).not.toBeNull();
      }
    }
  });

  it("marks the upcoming roles, and only those, and gives them no empty list of highlights", () => {
    render(<Experiences />);

    for (const role of roles) {
      const card = screen.getByRole("article", { name: role.title });
      const marked = within(card).queryByText("Upcoming") !== null;
      expect(marked).toBe(Boolean(role.upcoming));
      // The tag list is always there; a list of highlights only when there are some.
      expect(within(card).getAllByRole("list")).toHaveLength(role.highlights.length > 0 ? 2 : 1);
    }
  });

  it("summarises the timeline in one line computed from the data", () => {
    render(<Experiences />);

    const summary = screen.getByText(new RegExp(`^${roles.length} roles`));
    expect(summary).toHaveTextContent("2023 – 2027");
  });

  it("keeps headings in order: no level is skipped and nothing outranks the section title", () => {
    const { container } = render(<Experiences />);

    const levels = [...container.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((heading) =>
      Number(heading.tagName[1]),
    );
    expect(levels[0]).toBe(2);
    expect(levels.filter((level) => level === 2)).toHaveLength(1);
    expect(Math.min(...levels)).toBe(2);
    levels.slice(1).forEach((level, index) => {
      expect(level - levels[index]).toBeLessThanOrEqual(1);
    });
  });

  it("hides the drawn timeline (trunk, nodes, twigs) from assistive technology", () => {
    const { container } = render(<Experiences />);

    const decorations = container.querySelectorAll("ol span[aria-hidden='true']");
    // One trunk piece and one node per role.
    expect(decorations.length).toBeGreaterThanOrEqual(roles.length * 2);
    for (const decoration of decorations) {
      expect(decoration.textContent?.trim() ?? "").toMatch(/^·?$/);
    }
  });

  it("ends with the technical skills", () => {
    render(<Experiences />);

    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings[headings.length - 1]).toHaveTextContent("Technical skills");
    expect(screen.getByRole("list", { name: skillGroups[0].title })).toBeInTheDocument();
  });
});
