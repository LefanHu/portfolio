import React from "react";
import { render, screen, within } from "@testing-library/react";
import Experiences, { experienceBranches } from "@/components/portfolio/PortfolioExperiences";
import { skillGroups } from "@/lib/portfolio/about";
import { SITE_ANCHORS } from "@/lib/portfolioProjects";

const roles = experienceBranches.flatMap((branch) => branch.roles);

/** A sortable number for the month a period starts in ("Sept. 2025 – Apr. 2026" -> 2025 * 12 + 8). */
function startMonth(period: string) {
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const match = period.match(/^([A-Za-z]{3})[a-z]*\.? (\d{4})/);
  if (!match) throw new Error(`unreadable period: ${period}`);
  return Number(match[2]) * 12 + months.indexOf(match[1].toLowerCase());
}

describe("experience data", () => {
  it("puts the most recent role first, and roles newest first inside each branch", () => {
    const newest = Math.max(...roles.map((role) => startMonth(role.period)));
    expect(startMonth(experienceBranches[0].roles[0].period)).toBe(newest);

    for (const branch of experienceBranches) {
      const starts = branch.roles.map((role) => startMonth(role.period));
      expect(starts).toEqual([...starts].sort((a, b) => b - a));
    }
  });

  it("orders the branches by their most recent role", () => {
    const latest = experienceBranches.map((branch) => startMonth(branch.roles[0].period));
    expect(latest).toEqual([...latest].sort((a, b) => b - a));
  });

  it("writes every date range with an en dash", () => {
    const periods = [...experienceBranches.map((branch) => branch.period), ...roles.map((role) => role.period)];
    for (const period of periods) {
      expect(period).toMatch(/ – /);
      expect(period).not.toMatch(/-/);
    }
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

  it("renders every branch as a level-3 heading, in data order, with its period", () => {
    render(<Experiences />);

    const headings = screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent);
    expect(headings.slice(0, experienceBranches.length)).toEqual(experienceBranches.map((branch) => branch.title));

    for (const branch of experienceBranches) {
      const item = screen.getByRole("heading", { level: 3, name: branch.title }).closest("li");
      expect(item).not.toBeNull();
      expect(within(item!).getByText(branch.period)).toBeInTheDocument();
      expect(within(item!).getByText(branch.subtitle)).toBeInTheDocument();
      const tags = within(item!).getByRole("list", { name: `${branch.title} themes` });
      expect(within(tags).getAllByRole("listitem").map((tag) => tag.textContent)).toEqual(branch.tags);
    }
  });

  it("renders every role as a card under its branch, in data order", () => {
    render(<Experiences />);

    const cards = screen.getAllByRole("article");
    expect(cards.map((card) => within(card).getByRole("heading", { level: 4 }).textContent)).toEqual(
      roles.map((role) => role.title),
    );

    for (const branch of experienceBranches) {
      // The list of roles is named by the branch heading.
      const list = screen.getByRole("list", { name: branch.title });
      expect(within(list).getAllByRole("article")).toHaveLength(branch.roles.length);
    }
  });

  it("shows each role's team, period, location, tags and every highlight", () => {
    render(<Experiences />);

    for (const role of roles) {
      const card = screen.getByRole("article", { name: role.title });
      expect(within(card).getByText(role.subtitle)).toBeInTheDocument();
      expect(within(card).getByText(role.period)).toBeInTheDocument();
      expect(within(card).getByText(role.location)).toBeInTheDocument();

      const tags = within(card).getByRole("list", { name: `Focus areas at ${role.title}` });
      expect(within(tags).getAllByRole("listitem").map((tag) => tag.textContent)).toEqual(role.tags);

      for (const highlight of role.highlights) {
        expect(within(card).getByText(highlight).closest("li")).not.toBeNull();
      }
    }
  });

  it("summarises the tree in one line computed from the data", () => {
    render(<Experiences />);

    const summary = screen.getByText(new RegExp(`^${roles.length} roles`));
    expect(summary).toHaveTextContent("2023 – 2026");
    expect(summary).toHaveTextContent(`${experienceBranches.length} branches`);
    for (const branch of experienceBranches) {
      expect(summary).toHaveTextContent(branch.title);
    }
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

  it("hides the drawn tree (trunk, nodes, twigs) from assistive technology", () => {
    const { container } = render(<Experiences />);

    const decorations = container.querySelectorAll("ol span[aria-hidden='true']");
    // One trunk piece and one node per branch and per role.
    expect(decorations.length).toBeGreaterThanOrEqual((experienceBranches.length + roles.length) * 2);
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
