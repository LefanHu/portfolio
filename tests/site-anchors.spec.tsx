import React from "react";
import { render } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import {
  SITE_ANCHORS,
  acceleratorProject,
  projectCardId,
  projects,
} from "@/lib/portfolioProjects";
import FavProjects from "@/components/portfolio/PortfolioProjects";
import Experiences from "@/components/portfolio/PortfolioExperiences";
import LeetcodeStats from "@/components/portfolio/LeetcodeStats";
import ContactForm from "@/components/ContactForm";
import ProjectGallery from "@/app/(portfolio)/project-gallery/page";

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.mock("react-activity-calendar", () => ({
  ActivityCalendar: () => <div />,
}));

const allProjects = [acceleratorProject, ...projects];

describe("site anchors", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    // Never resolves, so LeetcodeStats stays in its loading state.
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    ["projects", FavProjects],
    ["experience", Experiences],
    ["coding", LeetcodeStats],
    ["contact", ContactForm],
  ] as const)("renders the %s anchor", (key, Component) => {
    const { container } = render(
      <MantineProvider>
        <Component />
      </MantineProvider>
    );
    const matches = container.querySelectorAll(`#${SITE_ANCHORS[key]}`);
    expect(matches).toHaveLength(1);
  });
});

describe("project slugs", () => {
  it("are unique and kebab-case", () => {
    const slugs = allProjects.map((project) => project.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("match the route segment of every internal href", () => {
    const internal = allProjects.filter((project) =>
      project.href.startsWith("/")
    );
    expect(internal.length).toBeGreaterThan(0);
    for (const project of internal) {
      expect(project.href.endsWith(`/${project.slug}`)).toBe(true);
    }
  });

  it("builds card ids from the slug", () => {
    expect(projectCardId("hive-hq")).toBe("project-hive-hq");
  });
});

describe("project gallery cards", () => {
  it("renders a project-<slug> id for all 7 projects", () => {
    const { container } = render(<ProjectGallery />);
    expect(allProjects).toHaveLength(7);
    for (const project of allProjects) {
      expect(
        container.querySelectorAll(`#${projectCardId(project.slug)}`)
      ).toHaveLength(1);
    }
  });
});
